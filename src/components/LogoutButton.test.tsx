import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutButton } from './LogoutButton';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the logout button', () => {
    render(<LogoutButton />);
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
    expect(screen.getByText('logout')).toBeInTheDocument();
  });

  it('calls logout and navigates to /login on click', () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
