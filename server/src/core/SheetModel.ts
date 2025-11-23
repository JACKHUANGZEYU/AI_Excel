// server/src/core/SheetModel.ts
import { Cell, CellId, Sheet } from '../shared/types';

export function cellKey(id: CellId): string {
  return `R${id.row}C${id.col}`;
}

export function parseCellKey(key: string): CellId {
  const match = /^R(\d+)C(\d+)$/.exec(key);
  if (!match) throw new Error(`Invalid cell key: ${key}`);
  return { row: Number(match[1]), col: Number(match[2]) };
}

export function createEmptySheet(
  id: string,
  name: string,
  rowCount: number,
  colCount: number
): Sheet {
  return {
    id,
    name,
    rowCount,
    colCount,
    cells: {}
  };
}

export function getCell(sheet: Sheet, id: CellId): Cell {
  const key = cellKey(id);
  let cell = sheet.cells[key];
  if (!cell) {
    cell = {
      id,
      raw: null,
      type: 'empty',
      value: null,
      error: null
    };
    sheet.cells[key] = cell;
  }
  return cell;
}

export function setCellRaw(
  sheet: Sheet,
  id: CellId,
  raw: string | null
): void {
  const cell = getCell(sheet, id);
  cell.raw = raw;
}
