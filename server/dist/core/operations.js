"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyOperation = applyOperation;
exports.applyOperations = applyOperations;
exports.createDemoSheet = createDemoSheet;
const SheetModel_1 = require("./SheetModel");
const formulaEngine_1 = require("./formulaEngine");
function applyOperation(sheet, op) {
    switch (op.type) {
        case 'setCell': {
            if (op.row == null || op.col == null)
                return sheet;
            const id = { row: op.row, col: op.col };
            (0, SheetModel_1.setCellRaw)(sheet, id, op.raw ?? null);
            (0, formulaEngine_1.recalcSheet)(sheet);
            return sheet;
        }
        case 'clearCell': {
            if (op.row == null || op.col == null)
                return sheet;
            const id = { row: op.row, col: op.col };
            (0, SheetModel_1.setCellRaw)(sheet, id, null);
            (0, formulaEngine_1.recalcSheet)(sheet);
            return sheet;
        }
        case 'insertRow':
        case 'deleteRow':
        case 'swapRows':
        case 'insertColumn':
        case 'deleteColumn':
        case 'swapColumns':
            // TODO: implement full structural operations
            // For now: no-op so that endpoints exist and code compiles.
            return sheet;
        default:
            return sheet;
    }
}
function applyOperations(sheet, ops) {
    for (const op of ops) {
        applyOperation(sheet, op);
    }
    return sheet;
}
// convenience: create demo sheet used on first load
function createDemoSheet(id = 'sheet1') {
    const sheet = (0, SheetModel_1.createEmptySheet)(id, 'Sheet1', 50, 20);
    // add a couple of example values
    const c1 = (0, SheetModel_1.getCell)(sheet, { row: 0, col: 0 });
    c1.raw = '1';
    const c2 = (0, SheetModel_1.getCell)(sheet, { row: 1, col: 0 });
    c2.raw = '2';
    const c3 = (0, SheetModel_1.getCell)(sheet, { row: 2, col: 0 });
    c3.raw = '=A1+A2';
    (0, formulaEngine_1.recalcSheet)(sheet);
    return sheet;
}
