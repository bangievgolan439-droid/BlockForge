import { create } from 'zustand';

export type MovementMode = 'build' | 'spectator';

export const HOTBAR_SIZE = 9;

export interface AppState {
  movementMode: MovementMode;
  inspectorOpen: boolean;
  physicsActive: boolean;
  pointerLocked: boolean;
  hotbarIndex: number;
  spectatorSpeed: number;
  selection: string[];

  setPointerLocked: (locked: boolean) => void;
  setHotbarIndex: (index: number) => void;
  toggleInspector: () => void;
  toggleSpectator: () => void;
  togglePhysics: () => void;
  adjustSpectatorSpeed: (deltaScroll: number) => void;
  setSelection: (ids: string[]) => void;
  toggleSelected: (id: string, additive: boolean) => void;
  clearSelection: () => void;
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
  selection: [],

  setPointerLocked: (locked) => set({ pointerLocked: locked }),

  setHotbarIndex: (index) => {
    if (index < 0 || index >= HOTBAR_SIZE) return;
    set({ hotbarIndex: index });
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

  setSelection: (ids) => set({ selection: ids }),

  toggleSelected: (id, additive) =>
    set((state) => {
      const has = state.selection.includes(id);
      if (!additive) {
        return { selection: has && state.selection.length === 1 ? [] : [id] };
      }
      return {
        selection: has ? state.selection.filter((s) => s !== id) : [...state.selection, id]
      };
    }),

  clearSelection: () => set({ selection: [] })
}));
