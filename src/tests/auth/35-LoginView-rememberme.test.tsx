import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { LoginView } from '../../views/LoginView'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth')

const mockLogin = vi.fn()

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockLogin.mockResolvedValue(undefined)
    vi.mocked(useAuth).mockImplementation(() => ({
      login: mockLogin,
      register: vi.fn(),
      isLoading: false,
      error: null,
      isAuthenticated: false,
    }))
  })

  it('debe llamar login con rememberMe al hacer submit con checkbox marcado', async () => {
    renderWithRouter(<LoginView />)

    const rememberMeCheckbox = document.querySelector('input[id="rememberMe"]') as HTMLInputElement
    fireEvent.click(rememberMeCheckbox)

    const passwordInput = document.querySelector('input[id="password"]') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('', 'password123', true)
    })
  })
})
