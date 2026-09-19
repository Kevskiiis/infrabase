import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { ApiRequestError } from '../../shared/api/client'
import { getSession, logout as logoutRequest, type AuthenticatedUser } from './authApi'

type AuthContextValue = {
  user: AuthenticatedUser | null
  loading: boolean
  error: ApiRequestError | null
  refresh: () => void
  logout: () => Promise<void>
}

type AuthState = { user: AuthenticatedUser | null; loading: boolean; error: ApiRequestError | null }
type AuthAction = { type: 'loading' } | { type: 'success'; user: AuthenticatedUser | null } | { type: 'failure'; error: ApiRequestError | null } | { type: 'logout' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  if (action.type === 'loading') return { ...state, loading: true }
  if (action.type === 'success') return { user: action.user, loading: false, error: null }
  if (action.type === 'failure') return { user: null, loading: false, error: action.error }
  return { user: null, loading: false, error: null }
}

function redirectAuthError(): ApiRequestError | null {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('auth_error')
  if (!code) return null
  const detail = params.get('auth_error_detail') ?? 'Authentication is temporarily unavailable. Try again.'
  params.delete('auth_error')
  params.delete('auth_error_detail')
  const query = params.toString()
  window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
  return new ApiRequestError({ error: 'Authentication failed', code, detail }, 503)
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, loading, error }, dispatch] = useReducer(authReducer, { user: null, loading: true, error: null })
  const [refreshToken, refresh] = useReducer((value: number) => value + 1, 0)

  useEffect(() => {
    let active = true
    const redirectError = redirectAuthError()
    if (redirectError) {
      dispatch({ type: 'failure', error: redirectError })
      return
    }
    dispatch({ type: 'loading' })
    getSession()
      .then((session) => {
        if (!active) return
        dispatch({ type: 'success', user: session.user })
      })
      .catch((reason: unknown) => {
        if (!active) return
        const requestError = reason instanceof ApiRequestError ? reason : null
        dispatch({ type: 'failure', error: requestError?.code === 'AUTH_REQUIRED' ? null : requestError })
      })
      .finally(() => undefined)
    return () => { active = false }
  }, [refreshToken])

  async function logout() {
    await logoutRequest()
    dispatch({ type: 'logout' })
    localStorage.setItem('infrabase-auth-change', String(Date.now()))
  }

  return <AuthContext.Provider value={{ user, loading, error, refresh, logout }}>{children}</AuthContext.Provider>
}

// The hook shares the provider context and is intentionally exported from this feature module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
