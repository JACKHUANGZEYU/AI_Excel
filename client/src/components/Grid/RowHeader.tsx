// client/src/components/Grid/RowHeader.tsx
import React from 'react';

interface Props {
  rowIndex: number;
}

export const RowHeader: React.FC<Props> = ({ rowIndex }) => {
  return <th className="row-header">{rowIndex + 1}</th>;
};
