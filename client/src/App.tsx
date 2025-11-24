// client/src/App.tsx
import React, { useEffect, useRef, useState } from 'react';
import { SheetProvider, useSheet } from './state/sheetState';
import { AIProvider, useAI } from './state/aiState';
import { UndoRedoProvider, useUndoRedo } from './state/undoRedoState';
import { GridContainer } from './components/GridSystem/GridContainer';
import { FormulaBar } from './components/FormulaBar/FormulaBar';
import { AIPanel } from './components/AIPanel/AIPanel';
import { Toolbar } from './components/Toolbar/Toolbar';
import { GridState, initialGridState } from './state/gridState';
import { Operation, SelectionRange } from './shared/types';

const SHEET_ID = 'sheet1';

const AppInner: React.FC = () => {
  const { sheet, refreshSheet, applyOperations } = useSheet();
  const { runCommand, apiKey, prompt } = useAI();
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

  function extractSelectionData(): (string | number | boolean | null)[][] | null {
    if (!sheet || !selection) return null;
    const startRow = Math.min(selection.start.row, selection.end.row);
    const endRow = Math.max(selection.start.row, selection.end.row);
    const startCol = Math.min(selection.start.col, selection.end.col);
    const endCol = Math.max(selection.start.col, selection.end.col);

    const data: (string | number | boolean | null)[][] = [];
    for (let r = startRow; r <= endRow; r++) {
      const rowArr: (string | number | boolean | null)[] = [];
      for (let c = startCol; c <= endCol; c++) {
        const key = `R${r}C${c}`;
        const cell = sheet.cells[key];
        const raw = cell?.raw;
        const val = raw ?? cell?.value ?? null;
        rowArr.push(val);
      }
      data.push(rowArr);
    }
    return data;
  }

  async function handleRunAI() {
    if (!selection) {
      window.alert('Select at least one cell before running AI.');
      return;
    }
    if (!apiKey) {
      window.alert('API key is required to run AI commands.');
      return;
    }
    if (!prompt.trim()) {
      window.alert('Please enter a prompt.');
      return;
    }
    const data = extractSelectionData();
    if (!data) return;

    try {
      const result = await runCommand(data);
      if (!result || !result.data) return;

      const startRow = Math.min(selection.start.row, selection.end.row);
      const endRow = Math.max(selection.start.row, selection.end.row);
      const startCol = Math.min(selection.start.col, selection.end.col);
      const endCol = Math.max(selection.start.col, selection.end.col);

      const expectedRows = endRow - startRow + 1;
      const expectedCols = endCol - startCol + 1;
      if (result.data.length !== expectedRows || result.data[0]?.length !== expectedCols) {
        window.alert('AI response shape does not match the selection.');
        return;
      }

      const ops: Operation[] = [];
      for (let r = 0; r < result.data.length; r++) {
        for (let c = 0; c < result.data[r].length; c++) {
          const rawVal = result.data[r][c];
          const targetRow = startRow + r;
          const targetCol = startCol + c;
          const raw =
            rawVal === null || rawVal === undefined
              ? null
              : typeof rawVal === 'string'
              ? rawVal
              : String(rawVal);
          ops.push({ type: 'setCell', sheetId: SHEET_ID, row: targetRow, col: targetCol, raw });
        }
      }
      if (ops.length) {
        push(ops);
        await applyOperations(SHEET_ID, ops);
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : 'AI request failed. Please try again.';
      window.alert(message);
    }
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
      <GridContainer sheetId={SHEET_ID} grid={grid} setGrid={setGrid} />
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
