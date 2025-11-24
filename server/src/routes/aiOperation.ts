import { Router } from 'express';
import { AIOperationRequest, AIOperationResponse } from '../shared/types';

const router = Router();

async function callGemini(
  apiKey: string,
  prompt: string,
  data: unknown[][],
  modelFromRequest?: string
): Promise<unknown> {
  const systemPrompt =
    'You are an AI data analyst helper. You will receive a 2D array of spreadsheet data and a user request. Return only the modified 2D array data in JSON format that matches the shape of the input. Do not include markdown formatting or explanation.';

  const userText = `User request:\n${prompt}\n\nSpreadsheet data (JSON):\n${JSON.stringify(
    data
  )}\n\nRespond with JSON only, matching the same 2D shape.`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${userText}` }]
      }
    ]
  };

  const model =
    modelFromRequest ||
    process.env.GEMINI_MODEL ||
    'gemini-2.5-flash'; // safe default supported by v1beta

  // API version: Gemini 2.x requires v1 endpoints; older models work with v1beta.
  const apiVersion = model.startsWith('gemini-2') ? 'v1' : 'v1beta';
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini request failed: ${txt || res.statusText}`);
  }

  const json = (await res.json()) as any;
  const partText: string | undefined = json?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text)
    .filter(Boolean)
    .join('\n')
    ?.trim();

  if (!partText) {
    throw new Error('No response text from Gemini');
  }

  try {
    return JSON.parse(partText);
  } catch (err) {
    throw new Error(`Failed to parse Gemini response as JSON: ${partText}`);
  }
}

router.post('/', async (req, res) => {
  const { apiKey, prompt, data, model } = req.body as AIOperationRequest;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' });
  }
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt required' });
  }
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Data must be a 2D array' });
  }

  try {
    const aiData = (await callGemini(apiKey, prompt, data, model)) as unknown[][];
    if (!Array.isArray(aiData)) {
      throw new Error('AI response is not an array');
    }
    const response: AIOperationResponse = {
      data: aiData as (string | number | boolean | null)[][],
      message: 'AI processed data'
    };
    res.json(response);
  } catch (err) {
    console.error('[ai-operation] failed', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'AI request failed' });
  }
});

export default router;
