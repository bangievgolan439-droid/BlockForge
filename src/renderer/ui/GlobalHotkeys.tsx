import { useEffect } from 'react';
import { useAppStore } from '../state/appStore';
import { useWorldStore } from '../state/worldStore';

const DIGIT_CODES = [
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9'
];

const NUDGE_KEYS: Record<string, [number, number, number]> = {
  ArrowUp: [0, 0, -1],
  ArrowDown: [0, 0, 1],
  ArrowLeft: [-1, 0, 0],
  ArrowRight: [1, 0, 0],
  PageUp: [0, 1, 0],
  PageDown: [0, -1, 0]
};

/**
 * Note: the design spec pairs Inspector-toggle with both Tab and "A", but A is
 * also the WASD strafe-left key in Build mode — binding both would make it
 * impossible to strafe left. Tab alone is used here; see ROADMAP.md.
 */
export default function GlobalHotkeys() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const digitIndex = DIGIT_CODES.indexOf(e.code);
      if (digitIndex !== -1) {
        useAppStore.getState().setHotbarIndex(digitIndex);
        return;
      }

      if (e.code === 'Tab') {
        e.preventDefault();
        useAppStore.getState().toggleInspector();
        return;
      }

      if (e.code === 'KeyV') {
        useAppStore.getState().toggleSpectator();
        return;
      }

      if (e.code === 'Enter') {
        useAppStore.getState().togglePhysics();
        return;
      }

      if (e.code === 'KeyG' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const selection = useAppStore.getState().selection;
        if (selection.length > 0) {
          useWorldStore.getState().groupSelection(selection);
        }
        return;
      }

      if (useAppStore.getState().inspectorOpen && e.code in NUDGE_KEYS) {
        e.preventDefault();
        const selection = useAppStore.getState().selection;
        if (selection.length === 0) return;
        const [dx, dy, dz] = NUDGE_KEYS[e.code]!;
        const newKeys = useWorldStore.getState().nudgeBlocks(selection, dx, dy, dz);
        useAppStore.getState().setSelection(newKeys);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
}
