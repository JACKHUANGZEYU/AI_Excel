// client/src/state/gridState.ts
import { CellId, SelectionMode, SelectionRange } from '../shared/types';

export interface GridState {
  activeCell: CellId | null;
  selectionRange: SelectionRange | null;
  selectionMode: SelectionMode;
  isEditing: boolean;
  editBuffer: string;
  dragType: 'selection' | 'fill' | 'row-reorder' | 'col-reorder' | null;
  dragAnchor: CellId | null;
  dragCurrent: CellId | null;
  viewportTop: number;
  viewportLeft: number;
  viewportRowCount: number;
  viewportColCount: number;
}

export const initialGridState: GridState = {
  activeCell: null,
  selectionRange: null,
  selectionMode: 'cell',
  isEditing: false,
  editBuffer: '',
  dragType: null,
  dragAnchor: null,
  dragCurrent: null,
  viewportTop: 0,
  viewportLeft: 0,
  viewportRowCount: 40,
  viewportColCount: 20
};

function rangeFromCell(cellId: CellId): SelectionRange {
  return { start: cellId, end: cellId };
}

// ===== core handlers (cell & selection) =====

export function handleCellSingleClick(
  state: GridState,
  cellId: CellId
): GridState {
  return {
    ...state,
    activeCell: cellId,
    selectionRange: rangeFromCell(cellId),
    selectionMode: 'cell',
    isEditing: false
  };
}

export function handleCellDoubleClick(
  state: GridState,
  cellId: CellId
): GridState {
  return {
    ...state,
    activeCell: cellId,
    selectionRange: rangeFromCell(cellId),
    selectionMode: 'cell',
    isEditing: true,
    editBuffer: state.editBuffer
  };
}

export function handleCellMouseDown(state: GridState, cellId: CellId): GridState {
  return {
    ...state,
    dragType: 'selection',
    dragAnchor: cellId,
    dragCurrent: cellId,
    selectionRange: rangeFromCell(cellId),
    activeCell: cellId
  };
}

export function handleCellMouseMove(state: GridState, cellId: CellId): GridState {
  if (state.dragType !== 'selection' || !state.dragAnchor) return state;
  return {
    ...state,
    dragCurrent: cellId,
    selectionRange: {
      start: {
        row: Math.min(state.dragAnchor.row, cellId.row),
        col: Math.min(state.dragAnchor.col, cellId.col)
      },
      end: {
        row: Math.max(state.dragAnchor.row, cellId.row),
        col: Math.max(state.dragAnchor.col, cellId.col)
      }
    }
  };
}

export function handleCellMouseUp(state: GridState): GridState {
  return {
    ...state,
    dragType: null,
    dragAnchor: null,
    dragCurrent: null
  };
}

export function handleCellShiftClick(
  state: GridState,
  cellId: CellId
): GridState {
  const anchor = state.activeCell ?? cellId;
  return {
    ...state,
    selectionRange: {
      start: {
        row: Math.min(anchor.row, cellId.row),
        col: Math.min(anchor.col, cellId.col)
      },
      end: {
        row: Math.max(anchor.row, cellId.row),
        col: Math.max(anchor.col, cellId.col)
      }
    },
    selectionMode: 'range'
  };
}

export function handleCellCtrlClick(
  state: GridState,
  _cellId: CellId
): GridState {
  // multi-range selection is V2; keep as no-op for now.
  return state;
}

// Arrow key navigation when NOT editing
export type ArrowDirection = 'up' | 'down' | 'left' | 'right';

export function handleCellKeyArrow(
  state: GridState,
  direction: ArrowDirection,
  maxRow: number,
  maxCol: number
): GridState {
  const current = state.activeCell;
  if (!current) return state;

  let { row, col } = current;
  if (direction === 'up') row = Math.max(0, row - 1);
  if (direction === 'down') row = Math.min(maxRow - 1, row + 1);
  if (direction === 'left') col = Math.max(0, col - 1);
  if (direction === 'right') col = Math.min(maxCol - 1, col + 1);

  const next: CellId = { row, col };
  return {
    ...state,
    activeCell: next,
    selectionRange: rangeFromCell(next),
    selectionMode: 'cell'
  };
}

export type TabDirection = 'forward' | 'backward';

export function handleCellKeyTab(
  state: GridState,
  direction: TabDirection,
  maxRow: number,
  maxCol: number
): GridState {
  const current = state.activeCell;
  if (!current) return state;
  let { row, col } = current;

  if (direction === 'forward') {
    col++;
    if (col >= maxCol) {
      col = 0;
      row = Math.min(maxRow - 1, row + 1);
    }
  } else {
    col--;
    if (col < 0) {
      col = maxCol - 1;
      row = Math.max(0, row - 1);
    }
  }

  const next: CellId = { row, col };
  return {
    ...state,
    activeCell: next,
    selectionRange: rangeFromCell(next),
    selectionMode: 'cell'
  };
}

export type EnterDirection = 'down' | 'up';

export function handleCellKeyEnter(
  state: GridState,
  direction: EnterDirection,
  maxRow: number
): GridState {
  const current = state.activeCell;
  if (!current) return state;

  let { row } = current;
  row = direction === 'down' ? Math.min(maxRow - 1, row + 1) : Math.max(0, row - 1);
  const next: CellId = { row, col: current.col };

  return {
    ...state,
    activeCell: next,
    selectionRange: rangeFromCell(next),
    selectionMode: 'cell'
  };
}

// ===== editing inside a cell (buffer) =====

export function handleEditInput(state: GridState, char: string): GridState {
  if (!state.isEditing) return state;
  return {
    ...state,
    editBuffer: state.editBuffer + char
  };
}

export function handleEditBackspace(state: GridState): GridState {
  if (!state.isEditing) return state;
  return {
    ...state,
    editBuffer: state.editBuffer.slice(0, -1)
  };
}

export function handleEditDelete(state: GridState): GridState {
  if (!state.isEditing) return state;
  return {
    ...state,
    editBuffer: ''
  };
}

export function handleEditCancel(state: GridState): GridState {
  return {
    ...state,
    isEditing: false,
    editBuffer: ''
  };
}

// direction is optional: move after commit
export function handleEditCommit(
  state: GridState,
  direction?: EnterDirection
): GridState {
  let nextState: GridState = {
    ...state,
    isEditing: false
  };

  if (direction) {
    nextState = handleCellKeyEnter(nextState, direction, nextState.viewportTop + nextState.viewportRowCount);
  }
  return nextState;
}

// ===== formula bar specific =====

export function handleFormulaBarFocus(state: GridState): GridState {
  return {
    ...state,
    isEditing: true
  };
}

export function handleFormulaBarInputChange(
  state: GridState,
  text: string
): GridState {
  return {
    ...state,
    editBuffer: text
  };
}

export function handleFormulaBarCommit(
  state: GridState
): GridState {
  return handleEditCommit(state);
}

export function insertCellReferenceFromFormula(
  state: GridState,
  _cellId: CellId
): GridState {
  // TODO: insert A1-style reference at caret position in editBuffer
  return state;
}

// ===== row & column operations (mostly stubs for now) =====

export function handleRowHeaderClick(
  state: GridState,
  rowIndex: number
): GridState {
  return {
    ...state,
    selectionMode: 'row',
    selectionRange: {
      start: { row: rowIndex, col: 0 },
      end: { row: rowIndex, col: state.viewportColCount - 1 }
    }
  };
}

export function handleInsertRowAbove(state: GridState, _rowIndex: number): GridState {
  return state;
}

export function handleInsertRowBelow(state: GridState, _rowIndex: number): GridState {
  return state;
}

export function handleDeleteSelectedRows(state: GridState): GridState {
  return state;
}

export function handleClearSelectedRows(state: GridState): GridState {
  return state;
}

// Column operations stubs
export function handleColumnHeaderClick(
  state: GridState,
  colIndex: number
): GridState {
  return {
    ...state,
    selectionMode: 'column',
    selectionRange: {
      start: { row: 0, col: colIndex },
      end: { row: state.viewportRowCount - 1, col: colIndex }
    }
  };
}

export function handleColumnHeaderDragReorder(
  state: GridState,
  _startIndex: number,
  _endIndex: number
): GridState {
  return state;
}

export function handleInsertColumnLeft(
  state: GridState,
  _colIndex: number
): GridState {
  return state;
}

export function handleInsertColumnRight(
  state: GridState,
  _colIndex: number
): GridState {
  return state;
}

export function handleDeleteSelectedColumns(state: GridState): GridState {
  return state;
}

export function handleClearSelectedColumns(state: GridState): GridState {
  return state;
}

// ===== fill handle (bottom-right drag) stubs =====

export function handleFillHandleMouseDown(
  state: GridState,
  _anchorRange: SelectionRange
): GridState {
  return { ...state, dragType: 'fill' };
}

export function handleFillHandleMouseMove(
  state: GridState,
  _currentRange: SelectionRange
): GridState {
  return state;
}

export function handleFillHandleMouseUp(
  state: GridState,
  _finalRange: SelectionRange
): GridState {
  return {
    ...state,
    dragType: null
  };
}

// ===== copy / cut / paste (grid-level, internal) =====

export interface ClipboardState {
  range: SelectionRange | null;
}

export const initialClipboardState: ClipboardState = {
  range: null
};

export function handleCopy(state: GridState, clipboard: ClipboardState): ClipboardState {
  return {
    ...clipboard,
    range: state.selectionRange
  };
}

export function handleCut(
  state: GridState,
  clipboard: ClipboardState
): ClipboardState {
  // grid-level cut just records range; clearing happens in sheet state
  return handleCopy(state, clipboard);
}

// paste itself needs sheet data so is handled in sheetState.ts

// ===== scroll & viewport =====

export function handleScrollDelta(
  state: GridState,
  deltaX: number,
  deltaY: number
): GridState {
  return {
    ...state,
    viewportLeft: Math.max(0, state.viewportLeft + deltaX),
    viewportTop: Math.max(0, state.viewportTop + deltaY)
  };
}

export function scrollToCell(
  state: GridState,
  cellId: CellId
): GridState {
  // simple: just ensure active cell is set; real scroll logic later
  return {
    ...state,
    activeCell: cellId,
    selectionRange: rangeFromCell(cellId)
  };
}

export function scrollToRange(
  state: GridState,
  _range: SelectionRange
): GridState {
  return state;
}
