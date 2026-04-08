import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../../hooks/useAuth'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

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
