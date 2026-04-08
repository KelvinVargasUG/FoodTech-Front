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

  it('debe limpiar campos al cambiar de modo', () => {
    renderWithRouter(<LoginView />)

    const emailInput = document.querySelector('input[id="email"]') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } })

    const toggleButton = screen.getByRole('button', { name: /Regístrate/i })
    fireEvent.click(toggleButton)

    expect(emailInput.value).toBe('')
  })
})
