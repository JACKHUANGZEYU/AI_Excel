// client/src/components/Grid/CellView.tsx
import React, { useEffect, useRef } from 'react';
import { CellId } from '../../shared/types';
import { GridState } from '../../state/gridState';
import { isCellInRange, isSingleCellRange } from '../../utils/rangeUtils';

interface Props {
  id: CellId;
  value: string | number | boolean | null;
  grid: GridState;
  onSingleClick: () => void;
  onDoubleClick: () => void;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
  onEditChange: (value: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
}

export const CellView: React.FC<Props> = ({
  id,
  value,
  grid,
  onSingleClick,
  onDoubleClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onEditChange,
  onEditCommit,
  onEditCancel
}) => {
  const isActive =
    grid.activeCell &&
    grid.activeCell.row === id.row &&
    grid.activeCell.col === id.col;

  const showSelectionFill =
    !isSingleCellRange(grid.selectionRange) && isCellInRange(id, grid.selectionRange);

  const isSelected = showSelectionFill;

  const isEditingCell = isActive && grid.isEditing && grid.editSource === 'cell';
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingCell && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }, [isEditingCell]);

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
      {isEditingCell ? (
        <input
          ref={inputRef}
          className="cell-input"
          value={grid.editBuffer}
          onChange={e => onEditChange(e.target.value)}
          onBlur={onEditCommit}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onEditCommit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onEditCancel();
            }
            e.stopPropagation();
          }}
        />
      ) : (
        value ?? ''
      )}
    </td>
  );
};
