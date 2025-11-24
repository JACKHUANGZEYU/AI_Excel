// server/src/shared/types.ts

export type CellType = 'empty' | 'number' | 'text' | 'boolean' | 'formula' | 'error';

export interface CellId {
  row: number; // 0-based
  col: number; // 0-based
}

export interface CellError {
  code: string;
  message: string;
}

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  // extend later (background, borders, etc.)
}

export interface Cell {
  id: CellId;
  raw: string | null; // what user typed; formula starts with "="
  type: CellType;
  value: number | string | boolean | null;
  error?: CellError | null;
  format?: CellFormat;
}

export interface RowMeta {
  height?: number;
  hidden?: boolean;
}

export interface ColMeta {
  width?: number;
  hidden?: boolean;
}

export interface SheetMeta {
  id: string;
  name: string;
  rowCount: number;
  colCount: number;
}

export interface Sheet extends SheetMeta {
  // key = `R${row}C${col}`
  cells: Record<string, Cell>;
  rowMeta?: Record<number, RowMeta>;
  colMeta?: Record<number, ColMeta>;
}

export interface SelectionRange {
  start: CellId;
  end: CellId;
}

export type SelectionMode = 'cell' | 'row' | 'column' | 'range' | 'sheet';

export type OperationType =
  | 'setCell'
  | 'clearCell'
  | 'insertRow'
  | 'deleteRow'
  | 'swapRows'
  | 'insertColumn'
  | 'deleteColumn'
  | 'swapColumns';

export interface Operation {
  type: OperationType;
  sheetId: string;
  row?: number;
  col?: number;
  raw?: string | null;
  fromRow?: number;
  toRow?: number;
  fromCol?: number;
  toCol?: number;
}

export interface AICommandSelection {
  sheetId: string;
  range: SelectionRange;
}

export interface AICommandRequest {
  sheetId: string;
  prompt: string;
  selection: SelectionRange;
  apiKey?: string | null;
}

export interface AICommandResult {
  operations: Operation[];
  message?: string;
}
