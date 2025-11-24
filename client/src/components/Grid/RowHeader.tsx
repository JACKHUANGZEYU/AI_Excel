// client/src/components/Grid/RowHeader.tsx
import React from 'react';
import { GridState, handleRowHeaderClick } from '../../state/gridState';

interface Props {
  rowIndex: number;
  grid: GridState;
  setGrid: React.Dispatch<React.SetStateAction<GridState>>;
  colCount: number;
}

export const RowHeader: React.FC<Props> = ({ rowIndex, grid, setGrid, colCount }) => {
  const isSelected =
    grid.selectionMode === 'row' &&
    grid.selectionRange &&
    rowIndex >= grid.selectionRange.start.row &&
    rowIndex <= grid.selectionRange.end.row;

  const className = ['row-header', isSelected ? 'row-header--selected' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <th
      className={className}
      onClick={() => setGrid(prev => handleRowHeaderClick(prev, rowIndex, colCount))}
    >
      {rowIndex + 1}
    </th>
  );
};
