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

  it('debe hacer login exitoso y guardar token en localStorage', async () => {
    const mockToken = 'fake-jwt-token-12345'

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: mockToken })
    })

    const { authService } = await import('../../services/authService')
    const result = await authService.login('test@restaurant.com', 'password123')

    expect(result).toBe(true)
    expect(localStorage.getItem('auth_token')).toBe(mockToken)
  })
})
