// server/src/routes/formulas.ts
import { Router } from 'express';

const router = Router();

// Example: POST /api/formulas/evaluate  (for debugging client formulas)
router.post('/evaluate', (req, res) => {
  // For now, just echo back. You can later wire this into formulaEngine.
  res.json({ ok: true, note: 'Formula debug endpoint stub.' });
});

export default router;
