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
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const FormulaBar: React.FC<Props> = ({ sheetId, grid, setGrid, inputRef }) => {
  const { sheet, commitEditBuffer } = useSheet();

  const commitFromBar = async () => {
    const nextGrid = handleFormulaBarCommit(grid);
    setGrid(nextGrid);
    await commitEditBuffer(sheetId, nextGrid);
  };

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
  }, [sheetId, sheet, grid.activeCell?.row, grid.activeCell?.col, grid.isEditing, setGrid]);

  useEffect(() => {
    if (grid.editSource === 'formula' && inputRef?.current) {
      const el = inputRef.current;
      const len = el.value.length;
      el.setSelectionRange(len, len);
      el.focus();
    }
  }, [grid.editSource, inputRef]);

  const onFocus = () => {
    const key = grid.activeCell
      ? `R${grid.activeCell.row}C${grid.activeCell.col}`
      : null;
    setGrid(prev => {
      const raw = key && sheet ? sheet.cells[key]?.raw ?? '' : prev.editBuffer;
      return {
        ...handleFormulaBarFocus(prev),
        editBuffer: raw
      };
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setGrid(prev => handleFormulaBarInputChange(prev, text));
  };

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await commitFromBar();
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
        onBlur={commitFromBar}
        ref={inputRef}
      />
    </div>
  );
};
