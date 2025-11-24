// client/src/utils/rangeUtils.ts
import { CellId, SelectionRange } from '../shared/types';

export function isCellInRange(id: CellId, range: SelectionRange | null): boolean {
  if (!range) return false;
  const minRow = Math.min(range.start.row, range.end.row);
  const maxRow = Math.max(range.start.row, range.end.row);
  const minCol = Math.min(range.start.col, range.end.col);
  const maxCol = Math.max(range.start.col, range.end.col);
  return (
    id.row >= minRow &&
    id.row <= maxRow &&
    id.col >= minCol &&
    id.col <= maxCol
  );
}

export function isSingleCellRange(range: SelectionRange | null): boolean {
  if (!range) return true;
  return range.start.row === range.end.row && range.start.col === range.end.col;
}

export function isRowInRange(row: number, range: SelectionRange | null): boolean {
  if (!range) return false;
  const minRow = Math.min(range.start.row, range.end.row);
  const maxRow = Math.max(range.start.row, range.end.row);
  return row >= minRow && row <= maxRow;
}

export function isColInRange(col: number, range: SelectionRange | null): boolean {
  if (!range) return false;
  const minCol = Math.min(range.start.col, range.end.col);
  const maxCol = Math.max(range.start.col, range.end.col);
  return col >= minCol && col <= maxCol;
}
