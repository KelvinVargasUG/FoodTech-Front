import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('debe retornar el token guardado', async () => {
    localStorage.setItem('auth_token', 'my-token')

    const { authService } = await import('../../services/authService')
    expect(authService.getToken()).toBe('my-token')
  })
})
