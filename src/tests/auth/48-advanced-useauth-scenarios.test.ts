import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../../hooks/useAuth'

declare global {
  interface Global {
    fetch: ReturnType<typeof vi.fn>
  }
  var global: Global
}

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

describe('CAJA BLANCA AVANZADA: useAuth - Escenarios Complejos con Mocks', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('Escenario Complejo: Login y logout funcionan correctamente', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'integration-token' })
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('test@restaurant.com', 'password123')
    })

    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBeNull()
  })

  it('Escenario: Manejo robusto de errores de red', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('test@restaurant.com', 'password123').catch(() => undefined)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('Escenario: Registro exitoso actualiza estado', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'register-token' })
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.register('new@restaurant.com', 'newuser', 'password123')
    })

    expect(result.current.error).toBeNull()
  })

  it('Escenario: Loading state refleja operación en curso', async () => {
    let resolveLogin: (value: { ok: boolean; json: () => Promise<{ token: string }> }) => void
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => { resolveLogin = resolve })
    )

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(false)

    act(() => {
      result.current.login('test@restaurant.com', 'password123')
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolveLogin!({ ok: true, json: () => Promise.resolve({ token: 'token' }) })
    })

    expect(result.current.isLoading).toBe(false)
  })
})
