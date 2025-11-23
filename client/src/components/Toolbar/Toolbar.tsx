// client/src/components/Toolbar/Toolbar.tsx
import React from 'react';

interface Props {
  onUndo: () => void;
  onRedo: () => void;
}

export const Toolbar: React.FC<Props> = ({ onUndo, onRedo }) => {
  return (
    <div className="toolbar">
      <button onClick={onUndo}>Undo</button>
      <button onClick={onRedo}>Redo</button>
    </div>
  );
};
