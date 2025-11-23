// server/src/routes/ai.ts
import { Router } from 'express';
import { AICommandRequest, AICommandResult } from '../shared/types';

const router = Router();

// POST /api/ai/command
router.post('/command', (req, res) => {
  const body = req.body as AICommandRequest;

  // TODO: call real AI provider with prompt + snapshot.
  // For now, return empty operations and a debug message.
  const result: AICommandResult = {
    operations: [],
    message: `AI stub received prompt: "${body.prompt}" for sheet ${body.sheetId}`
  };

  res.json(result);
});

export default router;
