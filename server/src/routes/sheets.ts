// server/src/routes/sheets.ts
import { Router } from 'express';
import { sheetRepo } from '../core/db/SheetRepo';
import { Operation } from '../shared/types';

const router = Router();

// GET /api/sheets/:sheetId
router.get('/:sheetId', (req, res) => {
  const { sheetId } = req.params;
  const sheet = sheetRepo.getSheet(sheetId);
  res.json(sheet);
});

// PATCH /api/sheets/:sheetId/cells/:row/:col
router.patch('/:sheetId/cells/:row/:col', (req, res) => {
  const { sheetId, row, col } = req.params;
  const { raw } = req.body as { raw: string | null };
  const sheet = sheetRepo.updateCell(sheetId, Number(row), Number(col), raw);
  res.json(sheet);
});

// PATCH /api/sheets/:sheetId/cells  (batch)
router.patch('/:sheetId/cells', (req, res) => {
  const { sheetId } = req.params;
  const { updates } = req.body as {
    updates: { row: number; col: number; raw: string | null }[];
  };
  const sheet = sheetRepo.batchUpdateCells(sheetId, updates || []);
  res.json(sheet);
});

// POST /api/sheets/:sheetId/operations
// Generic structural ops: insert/delete rows/columns, fill handle, etc.
router.post('/:sheetId/operations', (req, res) => {
  const { sheetId } = req.params;
  const { operations } = req.body as { operations: Operation[] };
  const sheet = sheetRepo.applyOperations(sheetId, operations || []);
  res.json(sheet);
});

export default router;
