// client/src/state/aiState.ts
import React, { createContext, useContext, useState } from 'react';
import { AICommandResult, Operation, SelectionRange } from '../shared/types';
import { apiClient } from '../services/apiClient';

interface AIState {
  apiKey: string | null;
  prompt: string;
  lastResult: AICommandResult | null;
  isRunning: boolean;
}

interface AIContextValue extends AIState {
  setApiKey: (key: string) => void;
  setPrompt: (prompt: string) => void;
  runCommand: (sheetId: string, selection: SelectionRange) => Promise<Operation[]>;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

const API_KEY_STORAGE_KEY = 'ai-excel-api-key';

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AIState>({
    apiKey: localStorage.getItem(API_KEY_STORAGE_KEY),
    prompt: '',
    lastResult: null,
    isRunning: false
  });

  function setApiKey(key: string) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setState(prev => ({ ...prev, apiKey: key }));
  }

  function setPrompt(prompt: string) {
    setState(prev => ({ ...prev, prompt }));
  }

  async function runCommand(
    sheetId: string,
    selection: SelectionRange
  ): Promise<Operation[]> {
    if (!state.prompt.trim()) return [];
    setState(prev => ({ ...prev, isRunning: true }));
    try {
      const result = await apiClient.runAICommand(sheetId, state.prompt, selection);
      setState(prev => ({ ...prev, lastResult: result }));
      return result.operations;
    } finally {
      setState(prev => ({ ...prev, isRunning: false }));
    }
  }

  const value: AIContextValue = {
    ...state,
    setApiKey,
    setPrompt,
    runCommand
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
}
