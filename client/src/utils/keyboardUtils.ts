// client/src/utils/keyboardUtils.ts
import { ArrowDirection, EnterDirection, TabDirection } from '../state/gridState';

export function mapKeyToNavigation(
  event: React.KeyboardEvent
):
  | { type: 'arrow'; direction: ArrowDirection }
  | { type: 'enter'; direction: EnterDirection }
  | { type: 'tab'; direction: TabDirection }
  | null {
  const { key, shiftKey } = event;
  if (key === 'ArrowUp') return { type: 'arrow', direction: 'up' };
  if (key === 'ArrowDown') return { type: 'arrow', direction: 'down' };
  if (key === 'ArrowLeft') return { type: 'arrow', direction: 'left' };
  if (key === 'ArrowRight') return { type: 'arrow', direction: 'right' };
  if (key === 'Enter') return { type: 'enter', direction: shiftKey ? 'up' : 'down' };
  if (key === 'Tab') return { type: 'tab', direction: shiftKey ? 'backward' : 'forward' };
  return null;
}
