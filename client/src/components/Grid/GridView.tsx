// client/src/components/Grid/GridView.tsx
import React, { useCallback } from 'react';
import { CellId } from '../../shared/types';
import { useSheet } from '../../state/sheetState';
import {
  handleCellDoubleClick,
  handleCellMouseDown,
  handleCellMouseMove,
  handleCellMouseUp,
  handleCellSingleClick,
  GridState
} from '../../state/gridState';
import { CellView } from './CellView';
import { RowHeader } from './RowHeader';
import { ColumnHeader } from './ColumnHeader';

interface Props {
  grid: GridState;
  setGrid: React.Dispatch<React.SetStateAction<GridState>>;
  onStartEditing?: () => void;
}

export const GridView: React.FC<Props> = ({ grid, setGrid, onStartEditing }) => {
  const { sheet } = useSheet();

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
    setGrid(prev => handleCellSingleClick(prev, id));
  };

  const handleDblClick = (id: CellId) => {
    const raw = getCellRaw(id);
    setGrid(prev => {
      const next = handleCellDoubleClick(prev, id);
      return { ...next, editBuffer: raw ?? '' };
    });
    onStartEditing?.();
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

  return (
    <div className="grid-wrapper">
      <table className="grid">
        <thead>
          <tr>{headerCells}</tr>
        </thead>
        <tbody onMouseUp={handleUp}>{rows}</tbody>
      </table>
    </div>
  );
};
