import ky from 'ky'

export type ApiError = {
  error: string
  code: string
  detail: string
}

export class ApiRequestError extends Error {
  readonly code: string
  readonly status: number

  constructor(payload: ApiError, status: number) {
    super(payload.detail)
    this.name = 'ApiRequestError'
    this.code = payload.code
    this.status = status
  }
}

const API_REQUEST_TIMEOUT_MS = 5000

function hasHttpResponse(error: unknown): error is { response: { json(): Promise<unknown>; status: number } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'json' in error.response &&
    typeof error.response.json === 'function' &&
    'status' in error.response &&
    typeof error.response.status === 'number'
  )
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await ky(path, {
      credentials: 'include',
      ...init,
      timeout: API_REQUEST_TIMEOUT_MS,
    }).json<T>()
  } catch (error) {
    if (error instanceof ApiRequestError) throw error
    if (hasHttpResponse(error)) {
      const payload = (await error.response.json().catch(() => null)) as ApiError | null
      throw new ApiRequestError(payload ?? { error: 'Request failed', code: 'BACKEND_UNAVAILABLE', detail: 'The service is temporarily unavailable.' }, error.response.status)
    }
    throw new ApiRequestError({ error: 'Request failed', code: 'BACKEND_UNAVAILABLE', detail: 'The service is temporarily unavailable.' }, 503)
  }
}
