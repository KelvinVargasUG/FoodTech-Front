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

  describe('login', () => {
    it('debe hacer login exitoso y guardar token en localStorage', async () => {
      const mockToken = 'fake-jwt-token-12345'

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      })

      const { authService } = await import('./authService')
      const result = await authService.login('test@restaurant.com', 'password123')

      expect(result).toBe(true)
      expect(localStorage.getItem('auth_token')).toBe(mockToken)
    })

    it('debe lanzar error cuando credenciales son inválidas', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      })

      const { authService } = await import('./authService')

      await expect(
        authService.login('wrong@email.com', 'wrongpass')
      ).rejects.toThrow('Credenciales inválidas')
    })

    it('debe lanzar error cuando hay error de red', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

      const { authService } = await import('./authService')

      await expect(
        authService.login('test@email.com', 'password')
      ).rejects.toThrow('Error de conexión')
    })

    it('debe guardar token sin expiración cuando rememberMe es false', async () => {
      const mockToken = 'fake-jwt-token-12345'

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      })

      const { authService } = await import('./authService')
      await authService.login('test@restaurant.com', 'password123', false)

      expect(localStorage.getItem('auth_token')).toBe(mockToken)
      expect(localStorage.getItem('auth_token_expiry')).toBeNull()
    })

    it('debe guardar token con expiración cuando rememberMe es true', async () => {
      const mockToken = 'fake-jwt-token-remember'

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      })

      const { authService } = await import('./authService')
      await authService.login('test@restaurant.com', 'password123', true)

      expect(localStorage.getItem('auth_token')).toBe(mockToken)
      expect(localStorage.getItem('auth_token_expiry')).not.toBeNull()
    })
  })

  describe('logout', () => {
    it('debe remover token de localStorage', async () => {
      localStorage.setItem('auth_token', 'some-token')

      const { authService } = await import('./authService')
      authService.logout()

      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('getToken', () => {
    it('debe retornar el token guardado', async () => {
      localStorage.setItem('auth_token', 'my-token')

      const { authService } = await import('./authService')
      expect(authService.getToken()).toBe('my-token')
    })

    it('debe retornar null cuando no hay token', async () => {
      const { authService } = await import('./authService')
      expect(authService.getToken()).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('debe retornar true cuando hay token válido', async () => {
      localStorage.setItem('auth_token', 'valid-token')

      const { authService } = await import('./authService')
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('debe retornar false cuando no hay token', async () => {
      const { authService } = await import('./authService')
      expect(authService.isAuthenticated()).toBe(false)
    })

    it('debe retornar false cuando el token está expirado', async () => {
      const expiredDate = Date.now() - 1000
      localStorage.setItem('auth_token', 'expired-token')
      localStorage.setItem('auth_token_expiry', expiredDate.toString())

      const { authService } = await import('./authService')
      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('register', () => {
    it('debe hacer registro exitoso', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Usuario registrado' })
      })

      const { authService } = await import('./authService')
      const result = await authService.register('test@email.com', 'newuser', 'password123')

      expect(result).toBe(true)
    })

    it('debe lanzar error cuando el servidor devuelve error 400', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400
      })

      const { authService } = await import('./authService')

      await expect(
        authService.register('test@email.com', 'existinguser', 'password123')
      ).rejects.toThrow('Error: 400')
    })

    it('debe lanzar error cuando hay error de red', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

      const { authService } = await import('./authService')

      await expect(
        authService.register('test@email.com', 'testuser', 'password')
      ).rejects.toThrow('Error de conexión')
    })

    it('debe hacer request con los datos correctos al endpoint register', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'ok' })
      })
      global.fetch = mockFetch

      const { authService } = await import('./authService')
      await authService.register('test@email.com', 'testuser', 'testpass')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@email.com',
            username: 'testuser',
            password: 'testpass'
          })
        })
      )
    })
  })
})
