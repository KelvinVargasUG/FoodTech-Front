import { useState, useCallback } from 'react';
import type { Table } from '../models/Table';
import { TableStatus } from '../models/Table';
import type { Task } from '../models/Task';
import { TaskStatus } from '../models/Task';

const INITIAL_TABLES: Table[] = [
  { id: '1', number: 'A1', status: TableStatus.DISPONIBLE },
  { id: '2', number: 'A2', status: TableStatus.DISPONIBLE },
  { id: '3', number: 'A3', status: TableStatus.DISPONIBLE },
  { id: '4', number: 'A4', status: TableStatus.DISPONIBLE },
  { id: '5', number: 'B1', status: TableStatus.DISPONIBLE },
  { id: '6', number: 'B2', status: TableStatus.DISPONIBLE },
  { id: '7', number: 'B3', status: TableStatus.DISPONIBLE },
  { id: '8', number: 'B4', status: TableStatus.DISPONIBLE },
];

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const selectedTable = tables.find((table) => table.id === selectedTableId);

  const selectTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId);
  }, []);

  const markTableAsOccupied = useCallback(
    (tableId: string, orderId: number) => {
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === tableId
            ? {
                ...table,
                status: TableStatus.OCUPADA,
                activeOrderId: orderId,
              }
            : table
        )
      );
    },
    []
  );

  const markTableAsAvailable = useCallback((tableId: string) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status: TableStatus.DISPONIBLE,
              activeOrderId: undefined,
            }
          : table
      )
    );
  }, []);

  const syncTablesWithTasks = useCallback((tasks: Task[]) => {
    setTables((prevTables) => {

      const occupiedTables = new Map<string, number>();

      tasks.forEach((task) => {
        if (task.status !== TaskStatus.COMPLETED) {

          occupiedTables.set(task.tableNumber, task.orderId);
        }
      });

      return prevTables.map((table) => {
        const orderId = occupiedTables.get(table.number);

        if (orderId) {

          return {
            ...table,
            status: TableStatus.OCUPADA,
            activeOrderId: orderId,
          };
        } else {

          return {
            ...table,
            status: TableStatus.DISPONIBLE,
            activeOrderId: undefined,
          };
        }
      });
    });
  }, []);

  return {
    tables,
    selectedTable,
    selectedTableId,
    selectTable,
    markTableAsOccupied,
    markTableAsAvailable,
    syncTablesWithTasks,
  };
};
