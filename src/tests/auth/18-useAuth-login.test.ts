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

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

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
})
