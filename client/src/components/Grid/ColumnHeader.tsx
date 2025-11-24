// client/src/components/Grid/ColumnHeader.tsx
import React from 'react';
import { GridState, handleColumnHeaderClick } from '../../state/gridState';
import { isColInRange } from '../../utils/rangeUtils';

interface Props {
  colIndex: number;
  grid: GridState;
  setGrid: React.Dispatch<React.SetStateAction<GridState>>;
  rowCount: number;
}

function colIndexToLetters(index: number): string {
  let col = index + 1;
  let s = '';
  while (col > 0) {
    const rem = (col - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    col = Math.floor((col - 1) / 26);
  }
  return s;
}

export const ColumnHeader: React.FC<Props> = ({
  colIndex,
  grid,
  setGrid,
  rowCount
}) => {
  const isSelected =
    (grid.selectionMode === 'column' || grid.selectionMode === 'row' || grid.selectionMode === 'range' || grid.selectionMode === 'cell') &&
    isColInRange(colIndex, grid.selectionRange);

  const className = ['col-header', isSelected ? 'col-header--selected' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <th
      className={className}
      onClick={() => setGrid(prev => handleColumnHeaderClick(prev, colIndex, rowCount))}
    >
      {colIndexToLetters(colIndex)}
    </th>
  );
};
