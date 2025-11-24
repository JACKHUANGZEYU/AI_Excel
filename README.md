
cd ~/ai-excel/client
npm run dev


cd ~/ai-excel/server
npm run dev




# AI Excel

Lightweight, Excel-style web spreadsheet with an AI assist stub. React + Vite front end, Express + TypeScript back end. Implements core grid selection/editing, formula parsing, undo/redo, row/column selection, and an Excel-like fill-handle with relative formula adjustment.

## Purpose
- Recreate familiar spreadsheet UX (cell editing, selection shading, formula bar, row/column headers, fill handle).
- Provide a thin API surface for sheet CRUD and AI-assisted commands (stubbed for now, API-key pluggable).
- Serve as a base for richer AI-powered spreadsheet workflows.

## Project layout
```
ai-excel/
├── client/                 # Vite + React UI
│   ├── src/
│   │   ├── App.tsx         # App composition with providers + layout
│   │   ├── main.tsx        # React bootstrap
│   │   ├── styles.css      # Global styles, grid/selection/fill visuals
│   │   ├── components/
│   │   │   ├── Grid/
│   │   │   │   ├── GridView.tsx     # Grid rendering, selection overlay, fill handle, ghost preview
│   │   │   │   ├── CellView.tsx     # Cell display + inline input for double-click edits
│   │   │   │   ├── RowHeader.tsx    # Row labels + selection shading/handling
│   │   │   │   ├── ColumnHeader.tsx # Column labels + selection shading/handling
│   │   │   ├── FormulaBar/FormulaBar.tsx  # fx input; syncs with active cell, commits on Enter/blur
│   │   │   ├── AIPanel/AIPanel.tsx        # API key + prompt UI; runs AI command stub
│   │   │   └── Toolbar/Toolbar.tsx        # Undo/redo buttons
│   │   ├── services/apiClient.ts  # REST calls to backend (sheets, operations, AI command)
│   │   ├── state/
│   │   │   ├── gridState.ts       # Selection/edit state, keyboard nav, row/col selection, fill drag logic
│   │   │   ├── sheetState.tsx     # Sheet data provider, commit/apply operations
│   │   │   ├── aiState.tsx        # AI prompt/key state, run AI command
│   │   │   └── undoRedoState.tsx  # Undo/redo stacks for operations
│   │   ├── shared/types.ts        # Shared types (cells, operations, AI request/response)
│   │   ├── utils/
│   │   │   ├── rangeUtils.ts      # Range helpers (in-range checks, etc.)
│   │   │   └── formulaUtils.ts    # adjustFormula for relative ref translation during fill
│   ├── vite.config.ts     # Dev proxy to backend
│   └── package.json       # React deps
├── server/                # Express + TS API
│   ├── src/
│   │   ├── index.ts       # Express app wiring, CORS, routers
│   │   ├── routes/
│   │   │   ├── sheets.ts  # Sheet CRUD + operations endpoints
│   │   │   ├── ai.ts      # AI command stub (returns ops/message)
│   │   │   └── formulas.ts# Formula debug stub
│   │   ├── core/
│   │   │   ├── SheetModel.ts     # Sheet factory + cell getters/setters
│   │   │   ├── operations.ts     # Apply operations, demo sheet seed
│   │   │   ├── formulaEngine.ts  # Basic formula evaluator with A1 parsing
│   │   │   └── db/SheetRepo.ts   # In-memory sheet storage
│   │   └── shared/types.ts       # Server-side shared types (mirrors client)
│   └── package.json      # Express deps
├── layout.pdf            # Original layout/structure reference
├── package.json          # Root scripts (optionally add concurrently, etc.)
└── README.md             # This doc
```

## Key features implemented
- Cell selection + shading: active cell outline; range shading; row/column headers shade with selection.
- Editing:
  - Single-click + formula bar: shows raw value/formula; edits commit on Enter or blur.
  - Double-click in-cell: inline input with caret at end; commits on Enter/blur, Esc cancels.
- Row/column selection: header click selects entire row/col; Backspace/Delete clears contents.
- Undo/redo: stacks of operations applied against sheet.
- AI panel: stores API key locally, accepts prompt + selection, calls backend stub, applies returned ops.
- Fill handle (Excel-style):
  - Blue handle on selection bottom-right; crosshair cursor.
  - Axis-locked drag (dominant axis); dashed ghost target range.
  - Data propagation: literals cloned; formulas adjusted with relative A1 translation via `adjustFormula`.
- Formula evaluation (server): basic A1 parsing with arithmetic; errors captured.

## Run / Dev
```bash
# install
npm install
cd server && npm install
cd ../client && npm install

# dev servers (from ai-excel/)
npm run dev   # or run server: npm run dev --workspace server, client: npm run dev --workspace client

# build
cd server && npm run build
cd ../client && npm run build
```

Dev URLs:
- Client: http://localhost:5173
- API: proxied via /api to http://localhost:4000 (see client/vite.config.ts)

## Notes / Next steps
- AI endpoint is stubbed; wire to your provider inside `server/src/routes/ai.ts` using forwarded `apiKey`.
- Gemini model override: `/api/ai-operation` defaults to `gemini-1.5-flash` (v1beta). Override via `process.env.GEMINI_MODEL` or pass `model` in the request body (e.g., `gemini-2.5-flash`); Gemini 2.x models use the v1 endpoint automatically.
- Structural operations (insert/delete rows/cols, reorder) are placeholders in `gridState.ts` / `operations.ts`.
- Selection/scroll handling uses measured cell/header sizes; if styling changes, verify handle/overlay alignment.
