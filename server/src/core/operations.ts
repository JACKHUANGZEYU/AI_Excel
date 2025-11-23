// server/src/core/operations.ts
import { CellId, Operation, Sheet } from '../shared/types';
import { cellKey, createEmptySheet, getCell, setCellRaw } from './SheetModel';
import { recalcSheet } from './formulaEngine';

export function applyOperation(sheet: Sheet, op: Operation): Sheet {
  switch (op.type) {
    case 'setCell': {
      if (op.row == null || op.col == null) return sheet;
      const id: CellId = { row: op.row, col: op.col };
      setCellRaw(sheet, id, op.raw ?? null);
      recalcSheet(sheet);
      return sheet;
    }
    case 'clearCell': {
      if (op.row == null || op.col == null) return sheet;
      const id: CellId = { row: op.row, col: op.col };
      setCellRaw(sheet, id, null);
      recalcSheet(sheet);
      return sheet;
    }
    case 'insertRow':
    case 'deleteRow':
    case 'swapRows':
    case 'insertColumn':
    case 'deleteColumn':
    case 'swapColumns':
      // TODO: implement full structural operations
      // For now: no-op so that endpoints exist and code compiles.
      return sheet;
    default:
      return sheet;
  }
}

export function applyOperations(sheet: Sheet, ops: Operation[]): Sheet {
  for (const op of ops) {
    applyOperation(sheet, op);
  }
  return sheet;
}

// convenience: create demo sheet used on first load
export function createDemoSheet(id = 'sheet1'): Sheet {
  const sheet = createEmptySheet(id, 'Sheet1', 50, 20);
  // add a couple of example values
  const c1 = getCell(sheet, { row: 0, col: 0 });
  c1.raw = '1';
  const c2 = getCell(sheet, { row: 1, col: 0 });
  c2.raw = '2';
  const c3 = getCell(sheet, { row: 2, col: 0 });
  c3.raw = '=A1+A2';

  recalcSheet(sheet);
  return sheet;
}
