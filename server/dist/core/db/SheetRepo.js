"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheetRepo = void 0;
const operations_1 = require("../operations");
const operations_2 = require("../operations");
const formulaEngine_1 = require("../formulaEngine");
const SheetModel_1 = require("../SheetModel");
class SheetRepo {
    constructor() {
        this.sheets = new Map();
    }
    getOrCreateSheet(sheetId) {
        let sheet = this.sheets.get(sheetId);
        if (!sheet) {
            sheet = (0, operations_1.createDemoSheet)(sheetId);
            this.sheets.set(sheetId, sheet);
        }
        return sheet;
    }
    getSheet(sheetId) {
        return this.getOrCreateSheet(sheetId);
    }
    updateCell(sheetId, row, col, raw) {
        const sheet = this.getOrCreateSheet(sheetId);
        (0, SheetModel_1.setCellRaw)(sheet, { row, col }, raw);
        (0, formulaEngine_1.recalcCellAndSheet)(sheet, { row, col });
        return sheet;
    }
    batchUpdateCells(sheetId, updates) {
        const sheet = this.getOrCreateSheet(sheetId);
        for (const u of updates) {
            (0, SheetModel_1.setCellRaw)(sheet, { row: u.row, col: u.col }, u.raw);
        }
        (0, formulaEngine_1.recalcSheet)(sheet);
        return sheet;
    }
    applyOperations(sheetId, ops) {
        const sheet = this.getOrCreateSheet(sheetId);
        (0, operations_2.applyOperations)(sheet, ops);
        return sheet;
    }
}
exports.sheetRepo = new SheetRepo();
