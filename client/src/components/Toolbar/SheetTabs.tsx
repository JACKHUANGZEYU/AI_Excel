// client/src/components/Toolbar/SheetTabs.tsx
import React from 'react';
import { Sheet } from '../../shared/types';

interface Props {
  sheets: Sheet[];
  activeSheetId: string;
  onSelect: (sheetId: string) => void;
}

export const SheetTabs: React.FC<Props> = ({ sheets, activeSheetId, onSelect }) => {
  return (
    <div className="sheet-tabs">
      {sheets.map(s => (
        <button
          key={s.id}
          className={s.id === activeSheetId ? 'sheet-tab sheet-tab--active' : 'sheet-tab'}
          onClick={() => onSelect(s.id)}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
};
