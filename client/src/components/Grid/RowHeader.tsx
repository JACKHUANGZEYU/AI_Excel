// client/src/components/Grid/RowHeader.tsx
import React from 'react';
import { GridState, handleRowHeaderClick } from '../../state/gridState';
import { isRowInRange } from '../../utils/rangeUtils';

interface Props {
  rowIndex: number;
  grid: GridState;
  setGrid: React.Dispatch<React.SetStateAction<GridState>>;
  colCount: number;
}

export const RowHeader: React.FC<Props> = ({ rowIndex, grid, setGrid, colCount }) => {
  const isSelected =
    (grid.selectionMode === 'row' || grid.selectionMode === 'column' || grid.selectionMode === 'range' || grid.selectionMode === 'cell') &&
    isRowInRange(rowIndex, grid.selectionRange);

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
