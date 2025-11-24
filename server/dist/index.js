"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sheets_1 = __importDefault(require("./routes/sheets"));
const ai_1 = __importDefault(require("./routes/ai"));
const formulas_1 = __importDefault(require("./routes/formulas"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
app.use(express_1.default.json());
app.use('/api/sheets', sheets_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/formulas', formulas_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
