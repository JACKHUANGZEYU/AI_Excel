import { useMemo } from 'react';
import { Operation, Sheet } from '../../shared/types';

export interface GridDataHelpers {
  getValue: (row: number, col: number) => string | number | boolean | null;
  getRaw: (row: number, col: number) => string;
  buildSetOps: (
    data: (string | number | boolean | null)[][],
    anchor: { row: number; col: number },
    bounds: { rowCount: number; colCount: number },
    sheetId: string
  ) => Operation[];
}

export function useGridData(sheet: Sheet | null): GridDataHelpers {
  const getValue = (row: number, col: number) => {
    if (!sheet) return null;
    const key = `R${row}C${col}`;
    const cell = sheet.cells[key];
    return cell?.value ?? cell?.raw ?? null;
  };

  const getRaw = (row: number, col: number) => {
    if (!sheet) return '';
    const key = `R${row}C${col}`;
    const cell = sheet.cells[key];
    return cell?.raw ?? '';
  };

  const buildSetOps = (
    data: (string | number | boolean | null)[][],
    anchor: { row: number; col: number },
    bounds: { rowCount: number; colCount: number },
    sheetId: string
  ): Operation[] => {
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
  };

  return useMemo(
    () => ({
      getValue,
      getRaw,
      buildSetOps
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sheet?.id, sheet?.rowCount, sheet?.colCount]
  );
}

