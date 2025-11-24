"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cellKey = cellKey;
exports.parseCellKey = parseCellKey;
exports.createEmptySheet = createEmptySheet;
exports.getCell = getCell;
exports.setCellRaw = setCellRaw;
function cellKey(id) {
    return `R${id.row}C${id.col}`;
}
function parseCellKey(key) {
    const match = /^R(\d+)C(\d+)$/.exec(key);
    if (!match)
        throw new Error(`Invalid cell key: ${key}`);
    return { row: Number(match[1]), col: Number(match[2]) };
}
function createEmptySheet(id, name, rowCount, colCount) {
    return {
        id,
        name,
        rowCount,
        colCount,
        cells: {}
    };
}
function getCell(sheet, id) {
    const key = cellKey(id);
    let cell = sheet.cells[key];
    if (!cell) {
        cell = {
            id,
            raw: null,
            type: 'empty',
            value: null,
            error: null
        };
        sheet.cells[key] = cell;
    }
    return cell;
}
function setCellRaw(sheet, id, raw) {
    const cell = getCell(sheet, id);
    cell.raw = raw;
}
