import { describe, it, expect, vi, beforeEach } from 'vitest'

declare global {
  interface Global {
    fetch: ReturnType<typeof vi.fn>
  }
  var global: Global
}

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('debe guardar token con expiración cuando rememberMe es true', async () => {
    const mockToken = 'fake-jwt-token-remember'

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: mockToken })
    })

    const { authService } = await import('../../services/authService')
    await authService.login('test@restaurant.com', 'password123', true)

    expect(localStorage.getItem('auth_token')).toBe(mockToken)
    expect(localStorage.getItem('auth_token_expiry')).not.toBeNull()
  })
})
