import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('debe retornar false cuando el token está expirado', async () => {
    const expiredDate = Date.now() - 1000
    localStorage.setItem('auth_token', 'expired-token')
    localStorage.setItem('auth_token_expiry', expiredDate.toString())

    const { authService } = await import('../../services/authService')
    expect(authService.isAuthenticated()).toBe(false)
  })
})
