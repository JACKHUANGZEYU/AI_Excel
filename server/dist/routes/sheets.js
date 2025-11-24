"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/sheets.ts
const express_1 = require("express");
const SheetRepo_1 = require("../core/db/SheetRepo");
const router = (0, express_1.Router)();
// GET /api/sheets/:sheetId
router.get('/:sheetId', (req, res) => {
    const { sheetId } = req.params;
    const sheet = SheetRepo_1.sheetRepo.getSheet(sheetId);
    res.json(sheet);
});
// PATCH /api/sheets/:sheetId/cells/:row/:col
router.patch('/:sheetId/cells/:row/:col', (req, res) => {
    const { sheetId, row, col } = req.params;
    const { raw } = req.body;
    const sheet = SheetRepo_1.sheetRepo.updateCell(sheetId, Number(row), Number(col), raw);
    res.json(sheet);
});
// PATCH /api/sheets/:sheetId/cells  (batch)
router.patch('/:sheetId/cells', (req, res) => {
    const { sheetId } = req.params;
    const { updates } = req.body;
    const sheet = SheetRepo_1.sheetRepo.batchUpdateCells(sheetId, updates || []);
    res.json(sheet);
});
// POST /api/sheets/:sheetId/operations
// Generic structural ops: insert/delete rows/columns, fill handle, etc.
router.post('/:sheetId/operations', (req, res) => {
    const { sheetId } = req.params;
    const { operations } = req.body;
    const sheet = SheetRepo_1.sheetRepo.applyOperations(sheetId, operations || []);
    res.json(sheet);
});
exports.default = router;
