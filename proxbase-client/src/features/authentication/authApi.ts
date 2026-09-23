import { apiRequest } from '../../shared/api/client'

export type AuthenticatedUser = {
  subject: string
  tenant_id: string
  email?: string | null
  name?: string | null
}

export type SessionStatus = {
  authenticated: boolean
  user: AuthenticatedUser | null
}

export function getSession() {
  return apiRequest<SessionStatus>('/auth/session')
}

export function logout() {
  return apiRequest<{ authenticated: false }>('/auth/logout', { method: 'POST' })
}

export function startLogin(returnTo = window.location.pathname + window.location.search + window.location.hash) {
  window.location.assign(`/auth/login?return_to=${encodeURIComponent(returnTo)}`)
}
