import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StationLayout } from './StationLayout';

describe('StationLayout', () => {
  it('renders station name and code', () => {
    render(
      <StationLayout stationName="Estación Barra" stationCode="BAR • Bebidas" icon="local_bar">
        <div data-testid="child-content">Content</div>
      </StationLayout>
    );

    expect(screen.getByText('Estación Barra')).toBeInTheDocument();
    expect(screen.getByText('BAR • Bebidas')).toBeInTheDocument();
    expect(screen.getByText('local_bar')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});
