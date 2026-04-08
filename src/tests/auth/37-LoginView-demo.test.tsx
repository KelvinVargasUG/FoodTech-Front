import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
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

  it('debe usar demo token al hacer submit en modo demo', async () => {
    renderWithRouter(<LoginView />)

    const demoCheckbox = document.querySelector('input[id="demoMode"]') as HTMLInputElement
    fireEvent.click(demoCheckbox)

    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('demo-token-12345')
    })
  })
})
