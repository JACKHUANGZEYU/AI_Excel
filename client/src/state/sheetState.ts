// client/src/state/sheetState.ts
import React, { createContext, useContext, useState } from 'react';
import { CellId, Operation, Sheet } from '../shared/types';
import { apiClient } from '../services/apiClient';
import { GridState } from './gridState';

interface SheetContextValue {
  sheet: Sheet | null;
  setSheet: React.Dispatch<React.SetStateAction<Sheet | null>>;
  refreshSheet: (sheetId: string) => Promise<void>;
  commitEditBuffer: (sheetId: string, grid: GridState) => Promise<Sheet | null>;
  applyOperations: (sheetId: string, operations: Operation[]) => Promise<Sheet | null>;
}

const SheetContext = createContext<SheetContextValue | undefined>(undefined);

export const SheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sheet, setSheet] = useState<Sheet | null>(null);

  async function refreshSheet(sheetId: string) {
    const loaded = await apiClient.getSheet(sheetId);
    setSheet(loaded);
  }

  async function commitEditBuffer(
    sheetId: string,
    grid: GridState
  ): Promise<Sheet | null> {
    if (!sheet || !grid.activeCell) return sheet;
    const key = `R${grid.activeCell.row}C${grid.activeCell.col}`;
    const current = sheet.cells[key];
    const raw = grid.editBuffer;

    if (current?.raw === raw) return sheet;

    const updated = await apiClient.updateCell(sheetId, grid.activeCell.row, grid.activeCell.col, raw);
    setSheet(updated);
    return updated;
  }

  async function applyOperations(
    sheetId: string,
    operations: Operation[]
  ): Promise<Sheet | null> {
    if (!operations.length) return sheet;
    const updated = await apiClient.applyOperations(sheetId, operations);
    setSheet(updated);
    return updated;
  }

  const value: SheetContextValue = {
    sheet,
    setSheet,
    refreshSheet,
    commitEditBuffer,
    applyOperations
  };

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
};

export function useSheet() {
  const ctx = useContext(SheetContext);
  if (!ctx) {
    throw new Error('useSheet must be used within SheetProvider');
  }
  return ctx;
}

// helper utilities

export function a1FromCellId(id: CellId): string {
  const letters = (() => {
    let col = id.col + 1;
    let s = '';
    while (col > 0) {
      const rem = (col - 1) % 26;
      s = String.fromCharCode(65 + rem) + s;
      col = Math.floor((col - 1) / 26);
    }
    return s;
  })();
  return `${letters}${id.row + 1}`;
}
