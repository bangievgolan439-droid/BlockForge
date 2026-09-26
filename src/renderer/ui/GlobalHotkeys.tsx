import { useEffect } from 'react';
import { useAppStore, type ToolMode } from '../state/appStore';
import { useSceneStore } from '../state/sceneStore';

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

const TOOL_KEYS: Record<string, ToolMode> = {
  KeyQ: 'select',
  KeyG: 'move',
  KeyR: 'rotate',
  KeyS: 'scale',
  KeyE: 'extrude',
  KeyP: 'paint'
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

      const inspectorOpen = useAppStore.getState().inspectorOpen;
      if (!inspectorOpen) return;

      if (e.code === 'KeyG' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const selection = useSceneStore.getState().selection;
        if (selection.length > 0) useSceneStore.getState().groupSelection(selection);
        return;
      }

      if (e.code in TOOL_KEYS && !e.ctrlKey && !e.metaKey) {
        useAppStore.getState().setToolMode(TOOL_KEYS[e.code]!);
        return;
      }

      if (e.code === 'Delete' || e.code === 'Backspace') {
        const selection = useSceneStore.getState().selection;
        for (const id of selection) useSceneStore.getState().deleteObject(id);
        return;
      }

      if (e.code in NUDGE_KEYS) {
        e.preventDefault();
        const selection = useSceneStore.getState().selection;
        if (selection.length === 0) return;
        const delta = NUDGE_KEYS[e.code]!;
        useSceneStore.getState().nudgeSelection(selection, delta);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
}
