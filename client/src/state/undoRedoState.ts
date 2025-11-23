// client/src/state/undoRedoState.ts
import React, { createContext, useContext, useState } from 'react';
import { Operation } from '../shared/types';

export interface UndoRedoState {
  undoStack: Operation[][];
  redoStack: Operation[][];
}

interface UndoRedoContextValue extends UndoRedoState {
  push: (ops: Operation[]) => void;
  undo: () => Operation[] | null;
  redo: () => Operation[] | null;
}

const UndoRedoContext = createContext<UndoRedoContextValue | undefined>(undefined);

export const UndoRedoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UndoRedoState>({
    undoStack: [],
    redoStack: []
  });

  function push(ops: Operation[]) {
    if (!ops.length) return;
    setState(prev => ({
      undoStack: [...prev.undoStack, ops],
      redoStack: []
    }));
  }

  function undo(): Operation[] | null {
    let popped: Operation[] | undefined;
    setState(prev => {
      if (!prev.undoStack.length) return prev;
      const undoStack = [...prev.undoStack];
      popped = undoStack.pop();
      const redoStack = [...prev.redoStack, popped!];
      return { undoStack, redoStack };
    });
    return popped ?? null;
  }

  function redo(): Operation[] | null {
    let popped: Operation[] | undefined;
    setState(prev => {
      if (!prev.redoStack.length) return prev;
      const redoStack = [...prev.redoStack];
      popped = redoStack.pop();
      const undoStack = [...prev.undoStack, popped!];
      return { undoStack, redoStack };
    });
    return popped ?? null;
  }

  const value: UndoRedoContextValue = { ...state, push, undo, redo };

  return <UndoRedoContext.Provider value={value}>{children}</UndoRedoContext.Provider>;
};

export function useUndoRedo() {
  const ctx = useContext(UndoRedoContext);
  if (!ctx) throw new Error('useUndoRedo must be used within UndoRedoProvider');
  return ctx;
}
