import { describe, expect, it, vi } from 'vitest'
import { logout } from '../../src/features/entra-session-auth/authApi'

describe('logout flow', () => {
  it('uses an idempotent backend logout request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ authenticated: false }), { status: 200 })))
    await expect(logout()).resolves.toEqual({ authenticated: false })
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]).toMatchObject({ method: 'POST', credentials: 'include' })
  })
})
