import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('debe retornar true cuando hay token válido', async () => {
    localStorage.setItem('auth_token', 'valid-token')

    const { authService } = await import('../../services/authService')
    expect(authService.isAuthenticated()).toBe(true)
  })
})
