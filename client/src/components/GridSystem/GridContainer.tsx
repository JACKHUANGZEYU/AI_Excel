import React, { useMemo, useRef, useState } from 'react';
import { GridState } from '../../state/gridState';
import { normalizeSelection, computeVisibleCells } from '../../utils/gridUtils';
import { useVirtualScroll } from './useVirtualScroll';
import { useSheet } from '../../state/sheetState';
import { useUndoRedo } from '../../state/undoRedoState';
import { HeaderRow } from './HeaderRow';
import { SidebarColumn } from './SidebarColumn';
import { MainGrid } from './MainGrid';
import { Operation } from '../../shared/types';
import './styles.css';

const ROW_HEIGHT = 20;
const COL_WIDTH = 70;
const HEADER_HEIGHT = 24;
const HEADER_WIDTH = 50;
const VISIBLE_CELL_LIMIT = 2000;

interface Props {
  sheetId: string;
  grid: GridState;
  setGrid: React.Dispatch<React.SetStateAction<GridState>>;
}

export const GridContainer: React.FC<Props> = ({ sheetId, grid, setGrid }) => {
  const { sheet, applyOperations, commitEditBuffer } = useSheet();
  const { push } = useUndoRedo();
  const mainRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const rowCount = sheet?.rowCount ?? 0;
  const colCount = sheet?.colCount ?? 0;

  const { scroll, viewport, ranges, onScroll, isScrolling } = useVirtualScroll({
    rowCount,
    colCount,
    rowHeight: ROW_HEIGHT * scale,
    colWidth: COL_WIDTH * scale,
    baseOverscan: 10,
    fastOverscan: 3,
    containerRef: mainRef
  });

  const selection = useMemo(() => normalizeSelection(grid.selectionRange), [grid.selectionRange]);

  const handleHeaderColClick = (col: number) => {
    setGrid(prev => ({
      ...prev,
      selectionRange: { start: { row: 0, col }, end: { row: rowCount - 1, col } },
      selectionMode: 'column',
      activeCell: { row: 0, col }
    }));
  };

  const handleSidebarRowClick = (row: number) => {
    setGrid(prev => ({
      ...prev,
      selectionRange: { start: { row, col: 0 }, end: { row, col: colCount - 1 } },
      selectionMode: 'row',
      activeCell: { row, col: 0 }
    }));
  };

  const applyOps = async (ops: Operation[]) => {
    await applyOperations(sheetId, ops);
  };

  const onWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const nextScale = Math.min(3, Math.max(0.3, scale * delta));
    const visibleCells = computeVisibleCells(
      viewport,
      COL_WIDTH,
      ROW_HEIGHT,
      nextScale
    );
    if (visibleCells > VISIBLE_CELL_LIMIT) {
      alert('Zoom limit reached for performance safety.');
      return;
    }
    setScale(nextScale);
  };

  return (
    <div className="grid-shell">
      <div className="pane-dead" style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }} />
      <div className="pane-col-header" style={{ height: HEADER_HEIGHT }}>
        <HeaderRow
          cols={ranges.cols}
          colWidth={COL_WIDTH * scale}
          headerHeight={HEADER_HEIGHT}
          scrollLeft={scroll.left}
          selection={selection}
          onClick={handleHeaderColClick}
        />
      </div>
      <div className="pane-row-sidebar" style={{ width: HEADER_WIDTH }}>
        <SidebarColumn
          rows={ranges.rows}
          rowHeight={ROW_HEIGHT * scale}
          headerWidth={HEADER_WIDTH}
          scrollTop={scroll.top}
          selection={selection}
          onClick={handleSidebarRowClick}
        />
      </div>
      <div className="pane-main-wrapper">
        <MainGrid
          sheetId={sheetId}
          sheetRowCount={rowCount}
          sheetColCount={colCount}
          grid={grid}
          setGrid={setGrid}
          scroll={scroll}
          ranges={ranges}
          isScrolling={isScrolling}
          onScroll={onScroll}
          onWheelZoom={onWheelZoom}
          rowHeight={ROW_HEIGHT * scale}
          colWidth={COL_WIDTH * scale}
          headerSizes={{ height: HEADER_HEIGHT, width: HEADER_WIDTH }}
          sheet={sheet}
          applyOps={applyOps}
          commitEditBuffer={commitEditBuffer}
          pushOps={push}
          containerRef={mainRef}
        />
      </div>
    </div>
  );
};
