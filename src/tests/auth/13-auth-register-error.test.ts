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

  it('debe manejar error cuando el servidor devuelve error 400', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400
    })

    const { authService } = await import('../../services/authService')

    await expect(
      authService.register('test@email.com', 'existinguser', 'password123')
    ).rejects.toThrow('Error: 400')
  })
})
