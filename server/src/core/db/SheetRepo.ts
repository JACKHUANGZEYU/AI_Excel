// server/src/core/db/SheetRepo.ts
import { CellId, Operation, Sheet } from '../../shared/types';
import { createDemoSheet } from '../operations';
import { applyOperations } from '../operations';
import { recalcCellAndSheet, recalcSheet } from '../formulaEngine';
import { setCellRaw } from '../SheetModel';

class SheetRepo {
  private sheets = new Map<string, Sheet>();

  getOrCreateSheet(sheetId: string): Sheet {
    let sheet = this.sheets.get(sheetId);
    if (!sheet) {
      sheet = createDemoSheet(sheetId);
      this.sheets.set(sheetId, sheet);
    }
    return sheet;
  }

  getSheet(sheetId: string): Sheet {
    return this.getOrCreateSheet(sheetId);
  }

  updateCell(
    sheetId: string,
    row: number,
    col: number,
    raw: string | null
  ): Sheet {
    const sheet = this.getOrCreateSheet(sheetId);
    setCellRaw(sheet, { row, col }, raw);
    recalcCellAndSheet(sheet, { row, col });
    return sheet;
  }

  batchUpdateCells(sheetId: string, updates: { row: number; col: number; raw: string | null }[]): Sheet {
    const sheet = this.getOrCreateSheet(sheetId);
    for (const u of updates) {
      setCellRaw(sheet, { row: u.row, col: u.col }, u.raw);
    }
    recalcSheet(sheet);
    return sheet;
  }

  applyOperations(sheetId: string, ops: Operation[]): Sheet {
    const sheet = this.getOrCreateSheet(sheetId);
    applyOperations(sheet, ops);
    return sheet;
  }
}

export const sheetRepo = new SheetRepo();
