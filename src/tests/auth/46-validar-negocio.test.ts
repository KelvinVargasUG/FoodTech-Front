import { describe, it, expect, vi, beforeEach } from 'vitest'

declare global {
  interface Global {
    fetch: ReturnType<typeof vi.fn>
  }
  var global: Global
}

describe('VALIDAR: Reglas de Negocio - Seguridad', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('VALIDAR: Token expirado NO permite acceso - como "saldo negativo" en seguridad', async () => {
    const expiredDate = Date.now() - 1000
    localStorage.setItem('auth_token', 'expired-token')
    localStorage.setItem('auth_token_expiry', expiredDate.toString())

    const { authService } = await import('../../services/authService')

    expect(authService.isAuthenticated()).toBe(false)
  })

  it('VALIDAR: Login con credenciales inválidas NO crea sesión', async () => {
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

  it('VALIDAR: Sesión sin token es inválida - como cuenta bloqueada', async () => {
    localStorage.clear()

    const { authService } = await import('../../services/authService')

    expect(authService.isAuthenticated()).toBe(false)
    expect(authService.getToken()).toBeNull()
  })
})
