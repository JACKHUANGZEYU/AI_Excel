import { Operation, SelectionRange } from '../shared/types';

export function colIndexToLetters(index: number): string {
  let col = index + 1;
  let s = '';
  while (col > 0) {
    const rem = (col - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    col = Math.floor((col - 1) / 26);
  }
  return s;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalizeSelection(range: SelectionRange | null): SelectionRange | null {
  if (!range) return null;
  return {
    start: { row: Math.min(range.start.row, range.end.row), col: Math.min(range.start.col, range.end.col) },
    end: { row: Math.max(range.start.row, range.end.row), col: Math.max(range.start.col, range.end.col) }
  };
}

export function parseTsv(text: string): string[][] {
  const rows = text
    .split(/\r\n|\n|\r/)
    .filter((r, idx, arr) => !(r.trim() === '' && idx === arr.length - 1));
  return rows.map(r => r.split('\t').map(cell => cell.replace(/^"(.*)"$/, '$1')));
}

export function buildSetOps(
  data: (string | number | boolean | null)[][],
  anchor: { row: number; col: number },
  bounds: { rowCount: number; colCount: number },
  sheetId: string
): Operation[] {
  const ops: Operation[] = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      const r = anchor.row + i;
      const c = anchor.col + j;
      if (r < 0 || c < 0 || r >= bounds.rowCount || c >= bounds.colCount) continue;
      const rawVal = data[i][j];
      const raw =
        rawVal === null || rawVal === undefined
          ? ''
          : typeof rawVal === 'string'
          ? rawVal
          : String(rawVal);
      ops.push({ type: 'setCell', sheetId, row: r, col: c, raw });
    }
  }
  return ops;
}

export function computeVisibleCells(
  viewport: { width: number; height: number },
  colWidth: number,
  rowHeight: number,
  scale: number
): number {
  return (viewport.width / (colWidth * scale)) * (viewport.height / (rowHeight * scale));
}

