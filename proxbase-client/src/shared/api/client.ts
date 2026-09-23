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

const API_REQUEST_TIMEOUT_MS = 15000

type ApiResponse = {
  json(): Promise<unknown>
  status: number
  ok: boolean
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiError).error === 'string' &&
    typeof (value as ApiError).code === 'string' &&
    typeof (value as ApiError).detail === 'string'
  )
}

async function readApiError(response: ApiResponse): Promise<ApiError | null> {
  try {
    const payload = await response.json()
    return isApiError(payload) ? payload : null
  } catch {
    return null
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await ky(path, {
      credentials: 'include',
      ...init,
      timeout: API_REQUEST_TIMEOUT_MS,
      throwHttpErrors: false,
    })

    if (!response.ok) {
      const payload = await readApiError(response)
      throw new ApiRequestError(payload ?? { error: 'Request failed', code: 'BACKEND_UNAVAILABLE', detail: 'The service is temporarily unavailable.' }, response.status)
    }

    return await response.json<T>()
  } catch (error) {
    if (error instanceof ApiRequestError) throw error
    throw new ApiRequestError({ error: 'Request failed', code: 'BACKEND_UNAVAILABLE', detail: 'The service is temporarily unavailable.' }, 503)
  }
}
