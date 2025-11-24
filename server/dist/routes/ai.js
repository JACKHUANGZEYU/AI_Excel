"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/ai.ts
const express_1 = require("express");
const router = (0, express_1.Router)();
// POST /api/ai/command
router.post('/command', (req, res) => {
    const body = req.body;
    const operations = [];
    const prompt = (body.prompt || '').trim();
    if (prompt && body.selection) {
        const targetRow = Math.min(body.selection.start.row, body.selection.end.row);
        const targetCol = Math.min(body.selection.start.col, body.selection.end.col);
        operations.push({
            type: 'setCell',
            sheetId: body.sheetId,
            row: targetRow,
            col: targetCol,
            raw: prompt
        });
    }
    const result = {
        operations,
        message: prompt
            ? `AI stub stored your prompt in the top-left cell of the selection${body.apiKey ? ' using the provided API key' : ''}.`
            : 'AI stub received an empty prompt.'
    };
    res.json(result);
});
exports.default = router;
