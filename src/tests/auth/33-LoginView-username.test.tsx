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

  it('debe mostrar username en modo registro', () => {
    renderWithRouter(<LoginView />)

    const toggleButton = screen.getByRole('button', { name: /Regístrate/i })
    fireEvent.click(toggleButton)

    expect(document.querySelector('input[id="username"]')).toBeInTheDocument()
  })
})
