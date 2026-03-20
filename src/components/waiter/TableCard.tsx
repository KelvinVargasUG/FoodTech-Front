import type { Table } from '../../models/Table';
import { TableStatus } from '../../models/Table';

interface TableCardProps {
  table: Table;
  isSelected: boolean;
  onSelect: (tableId: string) => void;
}

/**
 * Tarjeta de mesa individual
 */
export const TableCard = ({ table, isSelected, onSelect }: TableCardProps) => {
  const isOccupied = table.status === TableStatus.OCUPADA;

  return (
    <div
      data-testid={`table-item-${table.id}`}
      data-table-id={table.id}
      data-table-number={table.number}
      data-table-status={table.status}
      onClick={() => !isOccupied && onSelect(table.id)}
      className={`
        p-3 rounded-xl flex flex-col items-center justify-center gap-1 
        transition-all
        ${
          isOccupied
            ? 'bg-gradient-to-br from-red-900/40 to-red-800/30 border border-red-700/50 cursor-not-allowed opacity-75'
            : isSelected
            ? 'glass-panel-dark border-primary/40 cursor-pointer'
            : 'bg-white/5 border border-white/5 hover:border-primary/30 cursor-pointer'
        }
      `}
    >
      <span
        data-testid={`table-number-${table.number}`}
        className={`text-[10px] font-bold ${
          isOccupied
            ? 'text-red-400'
            : isSelected
            ? 'text-primary'
            : 'text-silver-text'
        }`}
      >
        {table.number}
      </span>
      <span
        data-testid={`table-status-${table.number}`}
        className={`text-sm font-bold ${
          isOccupied
            ? 'text-red-300'
            : isSelected
            ? 'text-white-text'
            : 'text-silver-text'
        }`}
      >
        {isOccupied ? 'Ocupada' : 'Disponible'}
      </span>
      <div
        className={`w-1 h-1 rounded-full ${
          isOccupied
            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
            : isSelected
            ? 'bg-primary shadow-[0_0_8px_#C5A059]'
            : 'bg-white/20'
        }`}
      />
    </div>
  );
};
