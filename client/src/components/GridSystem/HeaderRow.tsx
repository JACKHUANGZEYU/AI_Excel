import React from 'react';
import { SelectionRange } from '../../shared/types';
import { colIndexToLetters } from '../../utils/gridUtils';

interface Props {
  cols: { start: number; end: number };
  colWidth: number;
  headerHeight: number;
  scrollLeft: number;
  selection: SelectionRange | null;
  onClick: (col: number) => void;
}

export const HeaderRow: React.FC<Props> = ({
  cols,
  colWidth,
  headerHeight,
  scrollLeft,
  selection,
  onClick
}) => {
  const nodes: JSX.Element[] = [];
  for (let c = cols.start; c < cols.end; c++) {
    const isSelected =
      selection && c >= selection.start.col && c <= selection.end.col;
    nodes.push(
      <div
        key={`col-${c}`}
        className={`col-header ${isSelected ? 'col-header--selected' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: c * colWidth - scrollLeft,
          width: colWidth,
          height: headerHeight
        }}
        onClick={() => onClick(c)}
      >
        {colIndexToLetters(c)}
      </div>
    );
  }
  return <div style={{ position: 'relative', height: headerHeight }}>{nodes}</div>;
};
