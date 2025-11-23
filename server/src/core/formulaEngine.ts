// server/src/core/formulaEngine.ts
import { Cell, CellId, Sheet } from '../shared/types';
import { cellKey, getCell } from './SheetModel';

const CELL_REF_RE = /\b([A-Z]+)(\d+)\b/g;

function colLettersToIndex(letters: string): number {
  let col = 0;
  for (const ch of letters) {
    col = col * 26 + (ch.charCodeAt(0) - 64); // 'A' => 1
  }
  return col - 1; // 0-based
}

function idFromA1(ref: string): CellId {
  const match = /^([A-Z]+)(\d+)$/.exec(ref.toUpperCase());
  if (!match) throw new Error(`Invalid A1 ref: ${ref}`);
  return {
    col: colLettersToIndex(match[1]),
    row: Number(match[2]) - 1
  };
}

function safeNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Evaluate raw value (formula or literal) for a single cell.
 * Uses naive "replace refs + eval" approach for now.
 */
export function evaluateCellValue(sheet: Sheet, cell: Cell): void {
  const raw = cell.raw;
  cell.error = null;

  if (raw == null || raw === '') {
    cell.type = 'empty';
    cell.value = null;
    return;
  }

  if (raw.startsWith('=')) {
    const expr = raw.slice(1).trim();
    // replace A1-style references with numeric values
    const replaced = expr.replace(CELL_REF_RE, (_m, colLetters, rowStr) => {
      const refId = idFromA1(`${colLetters}${rowStr}`);
      const refCell = getCell(sheet, refId);
      // if referenced cell is itself a formula, assume its value
      return String(safeNumber(refCell.value));
    });

    try {
      // Simple math-only evaluation. In a real app you would use a safe expression parser.
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${replaced});`);
      const value = fn();
      cell.type = 'formula';
      cell.value = value as number;
    } catch (err) {
      cell.type = 'error';
      cell.value = null;
      cell.error = {
        code: 'EVAL',
        message: (err as Error).message
      };
    }
    return;
  }

  // literal parsing
  if (raw === 'TRUE' || raw === 'FALSE') {
    cell.type = 'boolean';
    cell.value = raw === 'TRUE';
    return;
  }

  const n = Number(raw);
  if (!Number.isNaN(n)) {
    cell.type = 'number';
    cell.value = n;
    return;
  }

  cell.type = 'text';
  cell.value = raw;
}

export function recalcSheet(sheet: Sheet): void {
  // naive full recalc: iterate all cells and evaluate from raw
  for (const key of Object.keys(sheet.cells)) {
    const cell = sheet.cells[key];
    evaluateCellValue(sheet, cell);
  }
}

export function recalcCellAndSheet(sheet: Sheet, id: CellId): void {
  const key = cellKey(id);
  const cell = sheet.cells[key];
  if (cell) {
    evaluateCellValue(sheet, cell);
  }
  // full recalc is simple (dependency-agnostic)
  recalcSheet(sheet);
}
