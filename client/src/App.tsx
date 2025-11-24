// client/src/App.tsx
import React, { useEffect, useRef, useState } from 'react';
import { SheetProvider, useSheet } from './state/sheetState';
import { AIProvider, useAI } from './state/aiState';
import { UndoRedoProvider, useUndoRedo } from './state/undoRedoState';
import { GridView } from './components/Grid/GridView';
import { FormulaBar } from './components/FormulaBar/FormulaBar';
import { AIPanel } from './components/AIPanel/AIPanel';
import { Toolbar } from './components/Toolbar/Toolbar';
import { GridState, initialGridState } from './state/gridState';
import { SelectionRange } from './shared/types';

const SHEET_ID = 'sheet1';

const AppInner: React.FC = () => {
  const { sheet, refreshSheet, applyOperations } = useSheet();
  const { runCommand } = useAI();
  const { push, undo, redo } = useUndoRedo();
  const [grid, setGrid] = useState<GridState>(initialGridState);
  const formulaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshSheet(SHEET_ID).catch(console.error);
  }, [refreshSheet]);

  useEffect(() => {
    if (!sheet) return;
    setGrid(prev => ({
      ...prev,
      viewportRowCount: sheet.rowCount,
      viewportColCount: sheet.colCount
    }));
  }, [sheet?.rowCount, sheet?.colCount]);

  const selection: SelectionRange | null = grid.selectionRange;

  async function handleRunAI() {
    if (!selection) return;
    const ops = await runCommand(SHEET_ID, selection);
    if (!ops.length) return;
    push(ops);
    await applyOperations(SHEET_ID, ops);
  }

  async function handleUndo() {
    const ops = undo();
    if (!ops) return;
    // TODO: send inverse operations to backend; for now just reapply forward ops
    await applyOperations(SHEET_ID, ops);
  }

  async function handleRedo() {
    const ops = redo();
    if (!ops) return;
    await applyOperations(SHEET_ID, ops);
  }

  if (!sheet) {
    return <div>Loading…</div>;
  }

  return (
    <div className="app">
      <Toolbar onUndo={handleUndo} onRedo={handleRedo} />
      <FormulaBar sheetId={SHEET_ID} grid={grid} setGrid={setGrid} inputRef={formulaInputRef} />
      <GridView
        grid={grid}
        setGrid={setGrid}
        onStartEditing={() => formulaInputRef.current?.focus()}
      />
      <AIPanel sheetId={SHEET_ID} selection={selection} onRun={handleRunAI} />
    </div>
  );
};

export const App: React.FC = () => (
  <UndoRedoProvider>
    <AIProvider>
      <SheetProvider>
        <AppInner />
      </SheetProvider>
    </AIProvider>
  </UndoRedoProvider>
);
