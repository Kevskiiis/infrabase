/* Generated from the FastAPI OpenAPI contract. Regenerate with `npm run generate:api`. */
import { apiRequest } from '../client'

export type AuthErrorCode = 'AUTH_REQUIRED' | 'AUTH_REJECTED' | 'AUTH_STATE_INVALID' | 'AUTH_PROVIDER_UNAVAILABLE' | 'SESSION_STORE_UNAVAILABLE' | 'BACKEND_UNAVAILABLE'
export type AuthError = { error: string; code: AuthErrorCode | string; detail: string }
export type AuthenticatedUser = { subject: string; tenant_id: string; email?: string | null; name?: string | null }
export type SessionStatus = { authenticated: boolean; user: AuthenticatedUser | null; return_to?: string | null }

export const getAuthSession = () => apiRequest<SessionStatus>('/auth/session')
export const postAuthLogout = () => apiRequest<{ authenticated: false }>('/auth/logout', { method: 'POST' })
