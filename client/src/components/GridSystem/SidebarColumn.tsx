import React from 'react';
import { SelectionRange } from '../../shared/types';

interface Props {
  rows: { start: number; end: number };
  rowHeight: number;
  headerWidth: number;
  scrollTop: number;
  selection: SelectionRange | null;
  onClick: (row: number) => void;
}

export const SidebarColumn: React.FC<Props> = ({
  rows,
  rowHeight,
  headerWidth,
  scrollTop,
  selection,
  onClick
}) => {
  const nodes: JSX.Element[] = [];
  for (let r = rows.start; r < rows.end; r++) {
    const isSelected =
      selection && r >= selection.start.row && r <= selection.end.row;
    nodes.push(
      <div
        key={`row-${r}`}
        className={`row-header ${isSelected ? 'row-header--selected' : ''}`}
        style={{
          position: 'absolute',
          top: r * rowHeight - scrollTop,
          left: 0,
          width: headerWidth,
          height: rowHeight
        }}
        onClick={() => onClick(r)}
      >
        {r + 1}
      </div>
    );
  }
  return <div style={{ position: 'relative', width: headerWidth }}>{nodes}</div>;
};
