// Utilities for adjusting A1-style formulas by a row/col offset

const CELL_REF_RE = /\b([A-Z]+)(\d+)\b/g;

function colLettersToIndex(letters: string): number {
  let col = 0;
  for (const ch of letters) {
    col = col * 26 + (ch.charCodeAt(0) - 64); // 'A' -> 1
  }
  return col - 1; // 0-based
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

export function adjustFormula(formula: string, rowOffset: number, colOffset: number): string {
  if (!formula.startsWith('=')) return formula;
  return formula.replace(CELL_REF_RE, (_m, colLetters, rowStr) => {
    const baseRow = Number(rowStr) - 1;
    const baseCol = colLettersToIndex(colLetters);
    const newRow = baseRow + rowOffset;
    const newCol = baseCol + colOffset;
    if (newRow < 0 || newCol < 0) return `${colLetters}${rowStr}`; // avoid negative refs
    return `${colIndexToLetters(newCol)}${newRow + 1}`;
  });
}

