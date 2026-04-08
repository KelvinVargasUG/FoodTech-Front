import { describe, it, expect, vi, beforeEach } from 'vitest'

declare global {
  interface Global {
    fetch: ReturnType<typeof vi.fn>
  }
  var global: Global
}

describe('VALIDACION: Reglas de Negocio - Auth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('VALIDAR: Token expirado no permite acceso', async () => {
    const expiredDate = Date.now() - 1000
    localStorage.setItem('auth_token', 'expired-token')
    localStorage.setItem('auth_token_expiry', expiredDate.toString())

    const { authService } = await import('../../services/authService')
    expect(authService.isAuthenticated()).toBe(false)
  })

  it('VALIDAR: Logout limpia token', async () => {
    localStorage.setItem('auth_token', 'some-token')
    localStorage.setItem('auth_token_expiry', '123456')

    const { authService } = await import('../../services/authService')
    authService.logout()

    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('VALIDAR: getToken retorna null cuando no hay token', async () => {
    const { authService } = await import('../../services/authService')
    expect(authService.getToken()).toBeNull()
  })

  it('VALIDAR: isAuthenticated retorna false sin token', async () => {
    localStorage.clear()
    const { authService } = await import('../../services/authService')
    expect(authService.isAuthenticated()).toBe(false)
  })

  it('VALIDAR: Login exitoso guarda token', async () => {
    const mockToken = 'jwt-token-validacion'
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: mockToken })
    })

    const { authService } = await import('../../services/authService')
    await authService.login('test@restaurant.com', 'password123')

    expect(localStorage.getItem('auth_token')).toBe(mockToken)
  })

  it('VALIDAR: Login con error NO guarda token', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401
    })

    const { authService } = await import('../../services/authService')
    await expect(
      authService.login('wrong@email.com', 'wrongpass')
    ).rejects.toThrow()

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(authService.isAuthenticated()).toBe(false)
  })

  it('VALIDAR: RememberMe guarda expiry', async () => {
    const mockToken = 'jwt-token-remember'
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: mockToken })
    })

    const { authService } = await import('../../services/authService')
    await authService.login('test@restaurant.com', 'password123', true)

    expect(localStorage.getItem('auth_token_expiry')).not.toBeNull()
  })

  it('VALIDAR: Sin rememberMe NO guarda expiry', async () => {
    const mockToken = 'jwt-token-no-remember'
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: mockToken })
    })

    const { authService } = await import('../../services/authService')
    await authService.login('test@restaurant.com', 'password123', false)

    expect(localStorage.getItem('auth_token_expiry')).toBeNull()
  })

  it('VALIDAR: isAuthenticated retorna true con token válido', async () => {
    localStorage.setItem('auth_token', 'valid-token')
    const { authService } = await import('../../services/authService')
    expect(authService.isAuthenticated()).toBe(true)
  })

  it('VALIDAR: getToken retorna token guardado', async () => {
    localStorage.setItem('auth_token', 'my-token')
    const { authService } = await import('../../services/authService')
    expect(authService.getToken()).toBe('my-token')
  })
})
