import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Redirected to {to}</div>,
}));

describe('ProtectedRoute', () => {
  it('shows loading when auth is loading', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    render(<ProtectedRoute><div>Protected</div></ProtectedRoute>);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    render(<ProtectedRoute><div>Protected</div></ProtectedRoute>);
    expect(screen.getByTestId('navigate')).toHaveTextContent('Redirected to /login');
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
