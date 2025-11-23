// client/src/components/Grid/ColumnHeader.tsx
import React from 'react';

interface Props {
  colIndex: number;
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

export const ColumnHeader: React.FC<Props> = ({ colIndex }) => {
  return <th className="col-header">{colIndexToLetters(colIndex)}</th>;
};
