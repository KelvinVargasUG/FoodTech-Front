import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'

declare global {
  interface Global {
    fetch: ReturnType<typeof vi.fn>
  }
  var global: Global
}

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('debe iniciar con isAuthenticated false cuando no hay token', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.token).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('debe iniciar con isAuthenticated true cuando hay token', () => {
      localStorage.setItem('auth_token', 'existing-token')

      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.token).toBe('existing-token')
    })
  })

  describe('login', () => {
    it('debe hacer login exitosamente y crear sesión', async () => {
      const mockToken = 'jwt-token-abc123'

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login('test@restaurant.com', 'password123')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.token).toBe(mockToken)
      expect(result.current.error).toBeNull()
    })

    it('debe manejar error de login SIN crear sesión', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login('wrong@email.com', 'wrongpass')
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('Credenciales inválidas')
      expect(result.current.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('debe mostrar error vacío cuando err es falsy (null/undefined)', async () => {
      // authService always re-throws Error objects, so we need to mock authService
      // to reject with a falsy value to cover the `err ? ... : ""` branch
      const { authService: svc } = await import('../services/authService');
      vi.spyOn(svc, 'login').mockRejectedValueOnce(null);

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login('x@x.com', 'pass')
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('')
      expect(result.current.token).toBeNull()
    })

    it('debe manejar estado de loading durante login', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: 'token' })
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isLoading).toBe(false)

      await act(async () => {
        await result.current.login('test@email.com', 'password')
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('debe hacer logout correctamente Y limpiar sesión', () => {
      localStorage.setItem('auth_token', 'token-to-remove')

      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('register', () => {
    it('debe hacer registro exitosamente', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Usuario registrado' })
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register('test@email.com', 'newuser', 'password123')
      })

      expect(result.current.error).toBeNull()
    })

    it('debe manejar error de red durante registro', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register('test@email.com', 'existinguser', 'password123')
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).not.toBeNull()
      expect(result.current.token).toBeNull()
    })

    it('debe mostrar "Error desconocido" cuando registro lanza un non-Error', async () => {
      global.fetch = vi.fn().mockRejectedValue('string error')

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register('test@email.com', 'user1', 'pass')
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('Error desconocido')
      expect(result.current.token).toBeNull()
    })

    it('debe manejar estado de loading durante registro', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'ok' })
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isLoading).toBe(false)

      await act(async () => {
        await result.current.register('test@email.com', 'testuser', 'password')
      })

      expect(result.current.isLoading).toBe(false)
    })
  })
})
