import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginView } from '../../views/LoginView'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth')

const mockRegister = vi.fn()

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockRegister.mockResolvedValue(undefined)
    vi.mocked(useAuth).mockImplementation(() => ({
      login: vi.fn(),
      register: mockRegister,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    }))
  })

  it('debe llamar register al hacer submit en modo registro', async () => {
    renderWithRouter(<LoginView />)

    const toggleButton = screen.getByRole('button', { name: /Regístrate/i })
    fireEvent.click(toggleButton)

    const emailInput = document.querySelector('input[id="email"]') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } })

    const usernameInput = document.querySelector('input[id="username"]') as HTMLInputElement
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })

    const passwordInput = document.querySelector('input[id="password"]') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@email.com', 'testuser', 'password123')
    })
  })
})
