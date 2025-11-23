// client/src/components/FormulaBar/FormulaBar.tsx
import React, { useEffect } from 'react';
import { useSheet } from '../../state/sheetState';
import {
  GridState,
  handleFormulaBarCommit,
  handleFormulaBarFocus,
  handleFormulaBarInputChange
} from '../../state/gridState';

interface Props {
  sheetId: string;
  grid: GridState;
  setGrid: React.Dispatch<React.SetStateAction<GridState>>;
}

export const FormulaBar: React.FC<Props> = ({ sheetId, grid, setGrid }) => {
  const { sheet, commitEditBuffer } = useSheet();

  useEffect(() => {
    // sync editBuffer with active cell raw when selection changes and not editing
    if (!sheet || !grid.activeCell || grid.isEditing) return;
    const key = `R${grid.activeCell.row}C${grid.activeCell.col}`;
    const cell = sheet.cells[key];
    setGrid(prev => ({
      ...prev,
      editBuffer: cell?.raw ?? '',
      isEditing: false
    }));
  }, [sheetId, sheet, grid.activeCell?.row, grid.activeCell?.col]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFocus = () => {
    setGrid(prev => handleFormulaBarFocus(prev));
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setGrid(prev => handleFormulaBarInputChange(prev, text));
  };

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextGrid = handleFormulaBarCommit(grid);
      setGrid(nextGrid);
      await commitEditBuffer(sheetId, nextGrid);
    }
  };

  return (
    <div className="formula-bar">
      <span className="formula-label">fx</span>
      <input
        className="formula-input"
        value={grid.editBuffer}
        onFocus={onFocus}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
