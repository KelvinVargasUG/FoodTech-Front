import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '../../hooks/useAuth'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('debe iniciar con isAuthenticated true cuando hay token', () => {
    localStorage.setItem('auth_token', 'existing-token')

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('existing-token')
  })
})
