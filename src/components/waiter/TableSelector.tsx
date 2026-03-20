import type { Table } from '../../models/Table';
import { TableCard } from './TableCard';

interface TableSelectorProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
}

/**
 * Panel lateral con selector de mesas
 */
export const TableSelector = ({
  tables,
  selectedTableId,
  onSelectTable,
}: TableSelectorProps) => {
  return (
    <aside className="w-72 bg-charcoal border-r border-white/5 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-8 flex items-center gap-3">
        <div className="size-10 gold-gradient rounded-lg flex items-center justify-center text-midnight shadow-lg shadow-primary/10">
          <span className="material-symbols-outlined font-bold">
            restaurant
          </span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white-text">
            Waiter Station
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary">
            Estación Mesero
          </p>
        </div>
      </div>

      {/* Active Zone */}
      <div className="mt-4 px-4 flex-1">
        <p className="text-[11px] uppercase tracking-widest text-silver-text px-3 mb-4">
          Zona Activa
        </p>
            <div className="grid grid-cols-2 gap-2.5" data-testid="table-grid">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              isSelected={selectedTableId === table.id}
              onSelect={onSelectTable}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};
