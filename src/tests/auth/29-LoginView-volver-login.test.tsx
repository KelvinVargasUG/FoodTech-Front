import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginView } from '../../views/LoginView'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth')

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(useAuth).mockImplementation(() => ({
      login: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      error: null,
      isAuthenticated: false,
    }))
  })

  it('debe volver a modo login al hacer click en toggle desde registro', () => {
    renderWithRouter(<LoginView />)

    const toggleToRegister = screen.getByRole('button', { name: /Regístrate/i })
    fireEvent.click(toggleToRegister)

    const toggleToLogin = screen.getByRole('button', { name: /Iniciar sesión/i })
    fireEvent.click(toggleToLogin)

    expect(screen.getByText('FoodTech Login')).toBeInTheDocument()
  })
})
