import { create } from 'zustand';
import { PALETTE } from './palette';

export type MovementMode = 'build' | 'spectator';
export type ToolMode = 'select' | 'move' | 'rotate' | 'scale' | 'extrude' | 'paint';

export const HOTBAR_SIZE = 9;

export interface AppState {
  movementMode: MovementMode;
  inspectorOpen: boolean;
  physicsActive: boolean;
  pointerLocked: boolean;
  hotbarIndex: number;
  spectatorSpeed: number;
  toolMode: ToolMode;
  activeColor: string;

  setPointerLocked: (locked: boolean) => void;
  setHotbarIndex: (index: number) => void;
  toggleInspector: () => void;
  toggleSpectator: () => void;
  togglePhysics: () => void;
  adjustSpectatorSpeed: (deltaScroll: number) => void;
  setToolMode: (mode: ToolMode) => void;
  setActiveColor: (color: string) => void;
}

const MIN_SPECTATOR_SPEED = 2;
const MAX_SPECTATOR_SPEED = 120;

export const useAppStore = create<AppState>((set, get) => ({
  movementMode: 'build',
  inspectorOpen: false,
  physicsActive: false,
  pointerLocked: false,
  hotbarIndex: 0,
  spectatorSpeed: 12,
  toolMode: 'select',
  activeColor: PALETTE[0]!.color,

  setPointerLocked: (locked) => set({ pointerLocked: locked }),

  setHotbarIndex: (index) => {
    if (index < 0 || index >= HOTBAR_SIZE) return;
    const color = PALETTE[index]?.color;
    set({ hotbarIndex: index, ...(color ? { activeColor: color } : {}) });
  },

  toggleInspector: () =>
    set((state) => ({
      inspectorOpen: !state.inspectorOpen
    })),

  toggleSpectator: () =>
    set((state) => ({
      movementMode: state.movementMode === 'build' ? 'spectator' : 'build',
      inspectorOpen: false
    })),

  togglePhysics: () => set((state) => ({ physicsActive: !state.physicsActive })),

  adjustSpectatorSpeed: (deltaScroll) => {
    const current = get().spectatorSpeed;
    const next = Math.min(MAX_SPECTATOR_SPEED, Math.max(MIN_SPECTATOR_SPEED, current * (1 - deltaScroll * 0.001)));
    set({ spectatorSpeed: next });
  },

  setToolMode: (mode) => set({ toolMode: mode }),
  setActiveColor: (color) => set({ activeColor: color })
}));
