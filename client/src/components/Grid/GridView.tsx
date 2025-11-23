// client/src/components/Grid/GridView.tsx
import React, { useCallback, useState } from 'react';
import { CellId } from '../../shared/types';
import { useSheet } from '../../state/sheetState';
import {
  GridState,
  initialGridState,
  handleCellDoubleClick,
  handleCellMouseDown,
  handleCellMouseMove,
  handleCellMouseUp,
  handleCellSingleClick
} from '../../state/gridState';
import { CellView } from './CellView';
import { RowHeader } from './RowHeader';
import { ColumnHeader } from './ColumnHeader';

export const GridView: React.FC = () => {
  const { sheet } = useSheet();
  const [grid, setGrid] = useState<GridState>(initialGridState);

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

  const handleClick = (id: CellId) => {
    setGrid(prev => handleCellSingleClick(prev, id));
  };

  const handleDblClick = (id: CellId) => {
    setGrid(prev => handleCellDoubleClick(prev, id));
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
        <RowHeader rowIndex={r} />
        {cells}
      </tr>
    );
  }

  const headerCells: JSX.Element[] = [<th key="blank" />];
  for (let c = 0; c < colCount; c++) {
    headerCells.push(<ColumnHeader key={c} colIndex={c} />);
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
