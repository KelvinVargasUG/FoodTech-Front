import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('debe remover token de localStorage', async () => {
    localStorage.setItem('auth_token', 'some-token')

    const { authService } = await import('../../services/authService')
    authService.logout()

    expect(localStorage.getItem('auth_token')).toBeNull()
  })
})
