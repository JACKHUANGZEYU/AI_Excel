// client/src/components/Grid/CellView.tsx
import React from 'react';
import { CellId } from '../../shared/types';
import { GridState } from '../../state/gridState';
import { isCellInRange } from '../../utils/rangeUtils';

interface Props {
  id: CellId;
  value: string | number | boolean | null;
  grid: GridState;
  onSingleClick: () => void;
  onDoubleClick: () => void;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
}

export const CellView: React.FC<Props> = ({
  id,
  value,
  grid,
  onSingleClick,
  onDoubleClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp
}) => {
  const isActive =
    grid.activeCell &&
    grid.activeCell.row === id.row &&
    grid.activeCell.col === id.col;

  const isSelected = isCellInRange(id, grid.selectionRange);

  const className = [
    'cell',
    isActive ? 'cell--active' : '',
    isSelected ? 'cell--selected' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <td
      className={className}
      onClick={onSingleClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
    >
      {value ?? ''}
    </td>
  );
};
