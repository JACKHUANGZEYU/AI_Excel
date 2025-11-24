import {
  AICommandResult,
  AIOperationRequest,
  AIOperationResponse,
  Operation,
  SelectionRange,
  Sheet
} from '../shared/types';

const BASE_URL = '';

export interface ApiClient {
  getSheet(sheetId: string): Promise<Sheet>;
  updateCell(
    sheetId: string,
    row: number,
    col: number,
    raw: string | null
  ): Promise<Sheet>;
  applyOperations(
    sheetId: string,
    operations: Operation[]
  ): Promise<Sheet>;
  runAICommand(
    sheetId: string,
    prompt: string,
    selection: SelectionRange,
    apiKey?: string | null
  ): Promise<AICommandResult>;

  runAIOperation(body: AIOperationRequest): Promise<AIOperationResponse>;
}

export const apiClient: ApiClient = {
  async getSheet(sheetId) {
    const res = await fetch(`${BASE_URL}/api/sheets/${sheetId}`);
    if (!res.ok) throw new Error('Failed to load sheet');
    return res.json();
  },

  async updateCell(sheetId, row, col, raw) {
    const res = await fetch(
      `${BASE_URL}/api/sheets/${sheetId}/cells/${row}/${col}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw })
      }
    );
    if (!res.ok) throw new Error('Failed to update cell');
    return res.json();
  },

  async applyOperations(sheetId, operations) {
    const res = await fetch(`${BASE_URL}/api/sheets/${sheetId}/operations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations })
    });
    if (!res.ok) throw new Error('Failed to apply operations');
    return res.json();
  },

  async runAICommand(sheetId, prompt, selection, apiKey) {
    const res = await fetch(`${BASE_URL}/api/ai/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetId, prompt, selection, apiKey })
    });
    if (!res.ok) throw new Error('AI command failed');
    return res.json();
  },

  async runAIOperation(body) {
    const res = await fetch(`${BASE_URL}/api/ai-operation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'AI operation failed');
    }
    return res.json();
  }
};
