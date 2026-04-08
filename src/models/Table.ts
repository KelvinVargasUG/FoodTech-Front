export const TableStatus = {
  DISPONIBLE: 'DISPONIBLE',
  OCUPADA: 'OCUPADA',
} as const;

export type TableStatus = (typeof TableStatus)[keyof typeof TableStatus];

export interface Table {
  id: string;
  number: string;
  status: TableStatus;
  activeOrderId?: number;
}
