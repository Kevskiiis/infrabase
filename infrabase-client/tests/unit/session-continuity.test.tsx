import { describe, expect, it, vi } from 'vitest'
import { getSession } from '../../src/features/entra-session-auth/authApi'

describe('session continuity', () => {
  it('requests the backend session with browser credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ authenticated: true, user: { subject: 'sub', tenant_id: 'tenant' } }), { status: 200 })))
    await expect(getSession()).resolves.toMatchObject({ authenticated: true })
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('/auth/session')
  })

  it('exposes a retryable backend outage rather than authenticating optimistically', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')))
    await expect(getSession()).rejects.toMatchObject({ code: 'BACKEND_UNAVAILABLE', status: 503 })
  })
})
