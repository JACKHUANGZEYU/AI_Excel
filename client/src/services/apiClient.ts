// client/src/services/apiClient.ts
import {
  AICommandResult,
  Operation,
  SelectionRange,
  Sheet
} from '../shared/types';

const BASE_URL = 'http://localhost:4000';

export const apiClient = {
  async getSheet(sheetId: string): Promise<Sheet> {
    const res = await fetch(`${BASE_URL}/api/sheets/${sheetId}`);
    if (!res.ok) throw new Error('Failed to load sheet');
    return res.json();
  },

  async updateCell(
    sheetId: string,
    row: number,
    col: number,
    raw: string | null
  ): Promise<Sheet> {
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

  async applyOperations(
    sheetId: string,
    operations: Operation[]
  ): Promise<Sheet> {
    const res = await fetch(`${BASE_URL}/api/sheets/${sheetId}/operations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations })
    });
    if (!res.ok) throw new Error('Failed to apply operations');
    return res.json();
  },

  async runAICommand(
    sheetId: string,
    prompt: string,
    selection: SelectionRange
  ): Promise<AICommandResult> {
    const res = await fetch(`${BASE_URL}/api/ai/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetId, prompt, selection })
    });
    if (!res.ok) throw new Error('AI command failed');
    return res.json();
  }
// client/src/services/apiClient.ts
import {
  AICommandResult,
  Operation,
  SelectionRange,
  Sheet
} from '../shared/types';

const BASE_URL = 'http://localhost:4000';

export const apiClient = {
  async getSheet(sheetId: string): Promise<Sheet> {
    const res = await fetch(`${BASE_URL}/api/sheets/${sheetId}`);
    if (!res.ok) throw new Error('Failed to load sheet');
    return res.json();
  },

  async updateCell(
    sheetId: string,
    row: number,
    col: number,
    raw: string | null
  ): Promise<Sheet> {
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

  async applyOperations(
    sheetId: string,
    operations: Operation[]
  ): Promise<Sheet> {
    const res = await fetch(`${BASE_URL}/api/sheets/${sheetId}/operations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations })
    });
    if (!res.ok) throw new Error('Failed to apply operations');
    return res.json();
  },

  async runAICommand(
    sheetId: string,
    prompt: string,
    selection: SelectionRange
  ): Promise<AICommandResult> {
    const res = await fetch(`${BASE_URL}/api/ai/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetId, prompt, selection })
    });
    if (!res.ok) throw new Error('AI command failed');
    return res.json();
  }
};
