// client/src/components/AIPanel/AIPanel.tsx
import React, { useState } from 'react';
import { SelectionRange } from '../../shared/types';
import { useAI } from '../../state/aiState';

interface Props {
  sheetId: string;
  selection: SelectionRange | null;
  onRun: () => Promise<void>;
}

export const AIPanel: React.FC<Props> = ({ sheetId, selection, onRun }) => {
  const { apiKey, setApiKey, prompt, setPrompt, lastResult, isRunning } = useAI();
  const [show, setShow] = useState(true);

  if (!show) {
    return (
      <button className="ai-panel-toggle" onClick={() => setShow(true)}>
        AI
      </button>
    );
  }

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <span>AI Assistant</span>
        <button onClick={() => setShow(false)}>×</button>
      </div>

      <div className="ai-section">
        <label>
          API key
          <input
            type="password"
            value={apiKey ?? ''}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Stored locally only"
          />
        </label>
      </div>

      <div className="ai-section">
        <label>
          Prompt
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            placeholder={`E.g. "Summarize this selection"`}
          />
        </label>
      </div>

      <div className="ai-section">
        <div>Sheet: {sheetId}</div>
        <div>
          Selection:{' '}
          {selection
            ? `R${selection.start.row + 1}C${selection.start.col + 1} → R${
                selection.end.row + 1
              }C${selection.end.col + 1}`
            : 'none'}
        </div>
      </div>

      <div className="ai-section">
        <button disabled={!selection || isRunning} onClick={onRun}>
          {isRunning ? 'Processing…' : 'Run AI Command'}
        </button>
      </div>

      {lastResult && (
        <div className="ai-section ai-result">
          <strong>Last result</strong>
          {lastResult.message && <p>{lastResult.message}</p>}
          <p>
            Shape: {lastResult.data.length} ×{' '}
            {lastResult.data[0] ? lastResult.data[0].length : 0}
          </p>
        </div>
      )}
    </div>
  );
};
