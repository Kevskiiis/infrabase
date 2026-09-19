import { describe, expect, it, vi } from 'vitest'
import ky from 'ky'
import { apiRequest, ApiRequestError } from '../../src/shared/api/client'
import { startLogin } from '../../src/features/entra-session-auth/authApi'

vi.mock('ky')

describe('authentication flow primitives', () => {
  it('parses structured backend errors without exposing credentials', async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ error: 'Authentication failed', code: 'AUTH_REJECTED', detail: 'Try again.' }),
      status: 401,
    }
    const mockError = new Error('HTTP 401')
    Object.assign(mockError, { response: mockResponse })
    vi.mocked(ky).mockImplementation(() => {
      throw mockError
    })

    await expect(apiRequest('/auth/session')).rejects.toMatchObject({ code: 'AUTH_REJECTED', status: 401 })
    expect(vi.mocked(ky)).toHaveBeenCalledWith('/auth/session', expect.objectContaining({ credentials: 'include' }))
  })

  it('starts login with the current safe path', () => {
    window.history.pushState({}, '', '/servers?active=true#grid')
    Object.defineProperty(window, 'location', { configurable: true, value: { pathname: '/servers', search: '?active=true', hash: '#grid', assign: vi.fn() } })
    startLogin()
    expect(window.location.assign).toHaveBeenCalledWith('/auth/login?return_to=%2Fservers%3Factive%3Dtrue%23grid')
  })

  it('keeps backend error type stable', () => {
    const error = new ApiRequestError({ error: 'Request failed', code: 'BACKEND_UNAVAILABLE', detail: 'Try again.' }, 503)
    expect(error).toMatchObject({ code: 'BACKEND_UNAVAILABLE', status: 503 })
  })
})
