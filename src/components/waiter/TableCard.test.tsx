import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableCard } from './TableCard';
import { TableStatus } from '../../models/Table';
import type { Table } from '../../models/Table';

describe('TableCard', () => {
  const availableTable: Table = { id: '1', number: 'A1', status: TableStatus.DISPONIBLE };
  const occupiedTable: Table = { id: '2', number: 'B2', status: TableStatus.OCUPADA, activeOrderId: 100 };

  it('renders available table correctly', () => {
    render(<TableCard table={availableTable} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByTestId('table-number-A1')).toHaveTextContent('A1');
    expect(screen.getByTestId('table-status-A1')).toHaveTextContent('Disponible');
  });

  it('renders occupied table correctly', () => {
    render(<TableCard table={occupiedTable} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByTestId('table-status-B2')).toHaveTextContent('Ocupada');
  });

  it('calls onSelect when available table is clicked', () => {
    const onSelect = vi.fn();
    render(<TableCard table={availableTable} isSelected={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('table-item-1'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('does not call onSelect when occupied table is clicked', () => {
    const onSelect = vi.fn();
    render(<TableCard table={occupiedTable} isSelected={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('table-item-2'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows selected styling when isSelected is true', () => {
    render(<TableCard table={availableTable} isSelected={true} onSelect={vi.fn()} />);
    const card = screen.getByTestId('table-item-1');
    expect(card.className).toContain('glass-panel-dark');
  });
});
