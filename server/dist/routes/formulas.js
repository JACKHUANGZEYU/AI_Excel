"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/formulas.ts
const express_1 = require("express");
const router = (0, express_1.Router)();
// Example: POST /api/formulas/evaluate  (for debugging client formulas)
router.post('/evaluate', (req, res) => {
    // For now, just echo back. You can later wire this into formulaEngine.
    res.json({ ok: true, note: 'Formula debug endpoint stub.' });
});
exports.default = router;
