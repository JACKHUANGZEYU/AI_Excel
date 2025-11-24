import React from 'react';
import { CellId, SelectionRange } from '../../shared/types';
import { GridState, handleCellDoubleClick, handleCellMouseDown, handleCellMouseMove, handleCellMouseUp, handleCellSingleClick, handleEditCancel, handleEditCommit } from '../../state/gridState';
import { useGridData } from './useGridData';
import { normalizeSelection, parseTsv, buildSetOps, computeVisibleCells } from '../../utils/gridUtils';
import { isCellInRange } from '../../utils/rangeUtils';

interface Props {
  sheetId: string;
  sheetRowCount: number;
  sheetColCount: number;
  grid: GridState;
  setGrid: React.Dispatch<React.SetStateAction<GridState>>;
  scroll: { left: number; top: number };
  ranges: { rows: { start: number; end: number }; cols: { start: number; end: number } };
  isScrolling: boolean;
  onScroll: () => void;
  onWheelZoom: (e: React.WheelEvent<HTMLDivElement>) => void;
  rowHeight: number;
  colWidth: number;
  headerSizes: { height: number; width: number };
  sheet: any;
  applyOps: (ops: any[]) => Promise<void>;
  pushOps: (ops: any[]) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const MainGrid: React.FC<Props> = ({
  sheetId,
  sheetRowCount,
  sheetColCount,
  grid,
  setGrid,
  scroll,
  ranges,
  isScrolling,
  onScroll,
  onWheelZoom,
  rowHeight,
  colWidth,
  headerSizes,
  sheet,
  applyOps,
  pushOps,
  containerRef
}) => {
  const data = useGridData(sheet);

  const normalizedSel = normalizeSelection(grid.selectionRange);

  const handleClick = (id: CellId) => {
    const raw = data.getRaw(id.row, id.col);
    setGrid(prev => ({ ...handleCellSingleClick(prev, id), editBuffer: raw ?? '' }));
  };

  const handleDblClick = (id: CellId) => {
    const raw = data.getRaw(id.row, id.col);
    setGrid(prev => {
      const next = handleCellDoubleClick(prev, id);
      return { ...next, editBuffer: raw ?? '' };
    });
  };

  const handleDown = (id: CellId) => {
    setGrid(prev => handleCellMouseDown(prev, id));
  };

  const handleEnter = (id: CellId) => {
    setGrid(prev => handleCellMouseMove(prev, id));
  };

  const handleUp = () => {
    setGrid(prev => handleCellMouseUp(prev));
  };

  const handleEditChange = (text: string) => {
    setGrid(prev => ({ ...prev, editBuffer: text }));
  };

  const commitEdit = async () => {
    const nextGrid = handleEditCommit(grid);
    setGrid(nextGrid);
  };

  const cancelEdit = () => {
    setGrid(prev => handleEditCancel(prev));
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!sheet) return;
    const anchor = grid.activeCell || grid.selectionRange?.start;
    if (!anchor) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    const matrix = parseTsv(text);
    const ops = buildSetOps(matrix, anchor, { rowCount: sheetRowCount, colCount: sheetColCount }, sheetId);
    if (ops.length) {
      pushOps(ops);
      await applyOps(ops);
    }
  };

  const selectionBox = normalizedSel
    ? {
        top: normalizedSel.start.row * rowHeight,
        left: normalizedSel.start.col * colWidth,
        width: (normalizedSel.end.col - normalizedSel.start.col + 1) * colWidth,
        height: (normalizedSel.end.row - normalizedSel.start.row + 1) * rowHeight
      }
    : null;

  const maxCells = 2000;
  const visibleRows = ranges.rows.end - ranges.rows.start;
  const visibleCols = ranges.cols.end - ranges.cols.start;
  const maxRows = Math.max(1, Math.floor(maxCells / Math.max(1, visibleCols)));
  const limitedRowEnd = Math.min(ranges.rows.end, ranges.rows.start + maxRows);
  const limitedColEnd = Math.min(
    ranges.cols.end,
    ranges.cols.start + Math.max(1, Math.floor(maxCells / Math.max(1, visibleRows)))
  );

  const cells: JSX.Element[] = [];
  for (let r = ranges.rows.start; r < limitedRowEnd; r++) {
    for (let c = ranges.cols.start; c < limitedColEnd; c++) {
      const id: CellId = { row: r, col: c };
      const isActive = grid.activeCell && grid.activeCell.row === r && grid.activeCell.col === c;
      const isSelected = isCellInRange(id, normalizedSel);
      const isEditingCell = isActive && grid.isEditing && grid.editSource === 'cell';
      const value = data.getValue(r, c);
      const top = r * rowHeight;
      const left = c * colWidth;
      cells.push(
        <div
          key={`${r}-${c}`}
          className={`cell ${isActive ? 'cell--active' : ''} ${isSelected ? 'cell--selected' : ''} ${
            isScrolling ? 'cell--skeleton' : ''
          }`}
          style={{
            position: 'absolute',
            top,
            left,
            width: colWidth,
            height: rowHeight
          }}
          onClick={() => !isScrolling && handleClick(id)}
          onDoubleClick={() => !isScrolling && handleDblClick(id)}
          onMouseDown={() => !isScrolling && handleDown(id)}
          onMouseEnter={() => !isScrolling && handleEnter(id)}
          onMouseUp={() => !isScrolling && handleUp()}
        >
          {!isScrolling &&
            (isEditingCell ? (
              <input
                className="cell-input"
                value={grid.editBuffer}
                onChange={e => handleEditChange(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitEdit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
                autoFocus
              />
            ) : (
              value ?? ''
            ))}
        </div>
      );
    }
  }

  const contentStyle = {
    height: sheetRowCount * rowHeight,
    width: sheetColCount * colWidth
  };

  return (
    <div
      className="pane-main"
      onPaste={handlePaste}
      onScroll={onScroll}
      onWheel={onWheelZoom}
      tabIndex={0}
      ref={containerRef}
    >
      <div className="main-content" style={contentStyle}>
        {cells}
        {selectionBox && !isScrolling && (
          <div
            className="selection-overlay"
            style={{
              top: selectionBox.top,
              left: selectionBox.left,
              width: selectionBox.width,
              height: selectionBox.height
            }}
          >
            <div className="selection-border" />
            <div className="fill-handle" title="Fill" />
          </div>
        )}
      </div>
    </div>
  );
};
