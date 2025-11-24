// client/src/components/Grid/GridView.tsx
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { CellId, Operation, SelectionRange } from '../../shared/types';
import { useSheet } from '../../state/sheetState';
import {
  handleCellDoubleClick,
  handleCellMouseDown,
  handleCellMouseMove,
  handleCellMouseUp,
  handleCellSingleClick,
  handleEditCancel,
  handleEditCommit,
  GridState
} from '../../state/gridState';
import { CellView } from './CellView';
import { RowHeader } from './RowHeader';
import { ColumnHeader } from './ColumnHeader';
import { useUndoRedo } from '../../state/undoRedoState';
import { adjustFormula } from '../../utils/formulaUtils';

interface Props {
  sheetId: string;
  grid: GridState;
  setGrid: React.Dispatch<React.SetStateAction<GridState>>;
}

export const GridView: React.FC<Props> = ({ sheetId, grid, setGrid }) => {
  const { sheet, applyOperations, commitEditBuffer } = useSheet();
  const { push } = useUndoRedo();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const [cellSize, setCellSize] = useState({ width: 70, height: 20 });
  const [headerSize, setHeaderSize] = useState({ width: 70, height: 20 });
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const [fillState, setFillState] = useState<{
    active: boolean;
    lock: 'row' | 'col' | null;
    source: SelectionRange | null;
    preview: SelectionRange | null;
  }>({ active: false, lock: null, source: null, preview: null });

  const rowCount = sheet?.rowCount ?? 0;
  const colCount = sheet?.colCount ?? 0;

  const getCellValue = useCallback(
    (id: CellId) => {
      if (!sheet) return null;
      const key = `R${id.row}C${id.col}`;
      const cell = sheet.cells[key];
      return cell?.value ?? cell?.raw ?? null;
    },
    [sheet]
  );

  const getCellRaw = useCallback(
    (id: CellId) => {
      if (!sheet) return '';
      const key = `R${id.row}C${id.col}`;
      const cell = sheet.cells[key];
      return cell?.raw ?? '';
    },
    [sheet]
  );

  const handleClick = (id: CellId) => {
    const raw = getCellRaw(id);
    setGrid(prev => ({ ...handleCellSingleClick(prev, id), editBuffer: raw ?? '' }));
  };

  const handleDblClick = (id: CellId) => {
    const raw = getCellRaw(id);
    setGrid(prev => {
      const next = handleCellDoubleClick(prev, id);
      return { ...next, editBuffer: raw ?? '' };
    });
  };

  const handleEditChange = (text: string) => {
    setGrid(prev => ({ ...prev, editBuffer: text }));
  };

  const commitEdit = async () => {
    const nextGrid = handleEditCommit(grid);
    setGrid(nextGrid);
    await commitEditBuffer(sheetId, nextGrid);
  };

  const cancelEdit = () => {
    setGrid(prev => handleEditCancel(prev));
  };

  const handleDown = (id: CellId) => {
    setGrid(prev => handleCellMouseDown(prev, id));
  };

  const handleEnter = (id: CellId) => {
    if (fillState.active && fillState.source) {
      updateFillPreview(id);
    } else {
      setGrid(prev => handleCellMouseMove(prev, id));
    }
  };

  const handleUp = () => {
    setGrid(prev => handleCellMouseUp(prev));
  };

  if (!sheet) {
    return <div>Loading sheet…</div>;
  }

  const rows: JSX.Element[] = [];

  for (let r = 0; r < rowCount; r++) {
    const cells: JSX.Element[] = [];
    for (let c = 0; c < colCount; c++) {
      const id: CellId = { row: r, col: c };
      cells.push(
        <CellView
          key={`${r}-${c}`}
          id={id}
          value={getCellValue(id)}
          grid={grid}
          onSingleClick={() => handleClick(id)}
          onDoubleClick={() => handleDblClick(id)}
          onMouseDown={() => handleDown(id)}
          onMouseEnter={() => handleEnter(id)}
          onMouseUp={handleUp}
          onEditChange={handleEditChange}
          onEditCommit={commitEdit}
          onEditCancel={cancelEdit}
        />
      );
    }

    rows.push(
      <tr key={r}>
        <RowHeader rowIndex={r} grid={grid} setGrid={setGrid} colCount={colCount} />
        {cells}
      </tr>
    );
  }

  const headerCells: JSX.Element[] = [<th key="blank" />];
  for (let c = 0; c < colCount; c++) {
    headerCells.push(
      <ColumnHeader
        key={c}
        colIndex={c}
        grid={grid}
        setGrid={setGrid}
        rowCount={rowCount}
      />
    );
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const tag = target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (grid.isEditing) return;

    if ((e.key === 'Backspace' || e.key === 'Delete') && grid.selectionRange) {
      if (grid.selectionMode === 'row' || grid.selectionMode === 'column') {
        e.preventDefault();
        const ops: Operation[] = [];
        const { start, end } = grid.selectionRange;
        for (let r = start.row; r <= end.row; r++) {
          for (let c = start.col; c <= end.col; c++) {
            ops.push({ type: 'clearCell', sheetId, row: r, col: c });
          }
        }
        if (ops.length) {
          push(ops);
          await applyOperations(sheetId, ops);
        }
      }
    }
  };

  useEffect(() => {
    wrapperRef.current?.focus();
    if (wrapperRef.current) {
      setScroll({
        left: wrapperRef.current.scrollLeft,
        top: wrapperRef.current.scrollTop
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (!tableRef.current) return;
    const td = tableRef.current.querySelector('td.cell') as HTMLTableCellElement | null;
    const rowHeader = tableRef.current.querySelector('.row-header') as HTMLTableCellElement | null;
    const colHeader = tableRef.current.querySelector('.col-header') as HTMLTableCellElement | null;
    if (td) setCellSize({ width: td.offsetWidth, height: td.offsetHeight });
    if (rowHeader && colHeader) {
      setHeaderSize({ width: rowHeader.offsetWidth, height: colHeader.offsetHeight });
    }
  }, [sheet, grid.viewportColCount, grid.viewportRowCount]);

  const normalizedSelection = useCallback((): SelectionRange | null => {
    if (!grid.selectionRange) return null;
    const { start, end } = grid.selectionRange;
    return {
      start: { row: Math.min(start.row, end.row), col: Math.min(start.col, end.col) },
      end: { row: Math.max(start.row, end.row), col: Math.max(start.col, end.col) }
    };
  }, [grid.selectionRange]);

  const startFill = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const src = normalizedSelection();
    if (!src) return;
    setFillState({ active: true, lock: null, source: src, preview: null });
  };

  const updateFillPreview = (overCell: CellId) => {
    if (!fillState.active || !fillState.source) return;
    const src = fillState.source;
    const base = src.end;
    const dx = overCell.col - base.col;
    const dy = overCell.row - base.row;
    const computedLock = Math.abs(dx) >= Math.abs(dy) ? 'col' : 'row';

    setFillState(prev => {
      if (!prev.source) return prev;
      const lock = prev.lock || computedLock;
      let preview: SelectionRange;
      if (lock === 'col') {
        const targetCol = overCell.col;
        preview = {
          start: { row: prev.source.start.row, col: Math.min(prev.source.start.col, targetCol) },
          end: { row: prev.source.end.row, col: Math.max(prev.source.end.col, targetCol) }
        };
      } else {
        const targetRow = overCell.row;
        preview = {
          start: { row: Math.min(prev.source.start.row, targetRow), col: prev.source.start.col },
          end: { row: Math.max(prev.source.end.row, targetRow), col: prev.source.end.col }
        };
      }
      return { ...prev, lock, preview };
    });
  };

  const stopFill = () => {
    setFillState({ active: false, lock: null, source: null, preview: null });
  };

  const commitFill = async () => {
    const { source, preview } = fillState;
    stopFill();
    if (!sheet || !source || !preview) return;
    const normPreview = {
      start: { row: Math.min(preview.start.row, preview.end.row), col: Math.min(preview.start.col, preview.end.col) },
      end: { row: Math.max(preview.start.row, preview.end.row), col: Math.max(preview.start.col, preview.end.col) }
    };
    const normSource = {
      start: { row: Math.min(source.start.row, source.end.row), col: Math.min(source.start.col, source.end.col) },
      end: { row: Math.max(source.start.row, source.end.row), col: Math.max(source.start.col, source.end.col) }
    };
    if (
      normPreview.start.row === normSource.start.row &&
      normPreview.end.row === normSource.end.row &&
      normPreview.start.col === normSource.start.col &&
      normPreview.end.col === normSource.end.col
    ) {
      return;
    }

    const srcHeight = normSource.end.row - normSource.start.row + 1;
    const srcWidth = normSource.end.col - normSource.start.col + 1;

    const ops: Operation[] = [];

    for (let r = normPreview.start.row; r <= normPreview.end.row; r++) {
      for (let c = normPreview.start.col; c <= normPreview.end.col; c++) {
        const inSource =
          r >= normSource.start.row &&
          r <= normSource.end.row &&
          c >= normSource.start.col &&
          c <= normSource.end.col;
        if (inSource) continue;

        const relRow = r - normSource.start.row;
        const relCol = c - normSource.start.col;
        const srcRow = normSource.start.row + (relRow % srcHeight + srcHeight) % srcHeight;
        const srcCol = normSource.start.col + (relCol % srcWidth + srcWidth) % srcWidth;
        const srcKey = `R${srcRow}C${srcCol}`;
        const srcCell = sheet.cells[srcKey];
        const raw = srcCell?.raw ?? null;
        const rowOffset = r - srcRow;
        const colOffset = c - srcCol;
        let newRaw = raw;
        if (raw && raw.startsWith('=')) {
          newRaw = adjustFormula(raw, rowOffset, colOffset);
        }
        ops.push({ type: 'setCell', sheetId, row: r, col: c, raw: newRaw });
      }
    }

    if (ops.length) {
      push(ops);
      await applyOperations(sheetId, ops);
    }
  };

  useEffect(() => {
    const onMouseUp = () => {
      if (fillState.active) {
        commitFill();
      }
    };
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillState.active, fillState.preview, fillState.source]);

  const selectionBoxStyle = (range: SelectionRange | null) => {
    if (!range) return undefined;
    const norm = {
      start: { row: Math.min(range.start.row, range.end.row), col: Math.min(range.start.col, range.end.col) },
      end: { row: Math.max(range.start.row, range.end.row), col: Math.max(range.start.col, range.end.col) }
    };
    const top = headerSize.height + norm.start.row * cellSize.height - scroll.top;
    const left = headerSize.width + norm.start.col * cellSize.width - scroll.left;
    const width = (norm.end.col - norm.start.col + 1) * cellSize.width;
    const height = (norm.end.row - norm.start.row + 1) * cellSize.height;
    return { top, left, width, height };
  };

  const handleBox = selectionBoxStyle(normalizedSelection());
  const previewBox = selectionBoxStyle(fillState.preview);

  return (
    <div
      className="grid-wrapper"
      tabIndex={0}
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      onMouseDown={() => wrapperRef.current?.focus()}
      onScroll={e =>
        setScroll({
          left: (e.target as HTMLDivElement).scrollLeft,
          top: (e.target as HTMLDivElement).scrollTop
        })
      }
    >
      <table className="grid" ref={tableRef}>
        <thead>
          <tr>{headerCells}</tr>
        </thead>
        <tbody onMouseUp={handleUp}>{rows}</tbody>
      </table>
      {handleBox && (
        <div
          className="selection-overlay"
          style={{
            top: handleBox.top,
            left: handleBox.left,
            width: handleBox.width,
            height: handleBox.height
          }}
        >
          <div className="selection-border" />
          <div
            className="fill-handle"
            onMouseDown={startFill}
            role="presentation"
            title="Fill"
          />
        </div>
      )}
      {previewBox && fillState.active && (
        <div
          className="fill-preview"
          style={{
            top: previewBox.top,
            left: previewBox.left,
            width: previewBox.width,
            height: previewBox.height
          }}
        />
      )}
    </div>
  );
};
