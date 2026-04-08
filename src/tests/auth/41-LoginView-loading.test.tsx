import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
      isLoading: true,
      error: null,
      isAuthenticated: false,
    }))
  })

  it('debe mostrar Iniciando sesión... cuando está cargando', () => {
    renderWithRouter(<LoginView />)

    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
  })
})
