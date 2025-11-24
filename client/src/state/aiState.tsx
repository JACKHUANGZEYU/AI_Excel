import React, { createContext, useContext, useState } from 'react';
import { AIOperationResponse } from '../shared/types';
import { apiClient } from '../services/apiClient';

interface AIState {
  apiKey: string | null;
  prompt: string;
  lastResult: AIOperationResponse | null;
  isRunning: boolean;
}

interface AIContextValue extends AIState {
  setApiKey: (key: string) => void;
  setPrompt: (prompt: string) => void;
  runCommand: (data: (string | number | boolean | null)[][]) => Promise<AIOperationResponse | null>;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

const API_KEY_STORAGE_KEY = 'ai-excel-api-key';

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AIState>({
    apiKey: typeof window !== 'undefined'
      ? localStorage.getItem(API_KEY_STORAGE_KEY)
      : null,
    prompt: '',
    lastResult: null,
    isRunning: false
  });

  function setApiKey(key: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    }
    setState(prev => ({ ...prev, apiKey: key }));
  }

  function setPrompt(prompt: string) {
    setState(prev => ({ ...prev, prompt }));
  }

  async function runCommand(
    data: (string | number | boolean | null)[][]
  ): Promise<AIOperationResponse | null> {
    if (!state.prompt.trim()) return null;
    if (!state.apiKey) return null;
    setState(prev => ({ ...prev, isRunning: true }));
    try {
      const result = await apiClient.runAIOperation({
        apiKey: state.apiKey,
        prompt: state.prompt,
        data
      });
      setState(prev => ({ ...prev, lastResult: result }));
      return result;
    } catch (err) {
      console.error('AI operation failed', err);
      throw err;
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
