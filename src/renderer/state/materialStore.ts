import { create } from 'zustand';
import { BLOCK_TYPES } from './worldStore';

interface MaterialState {
  colorOverrides: Record<number, string>;
  triplanarScale: Record<number, number>;
  setColorOverride: (typeId: number, color: string) => void;
  setTriplanarScale: (typeId: number, scale: number) => void;
  resolvedColor: (typeId: number) => string;
  resolvedScale: (typeId: number) => number;
}

export const useMaterialStore = create<MaterialState>((set, get) => ({
  colorOverrides: {},
  triplanarScale: {},

  setColorOverride: (typeId, color) =>
    set((state) => ({ colorOverrides: { ...state.colorOverrides, [typeId]: color } })),

  setTriplanarScale: (typeId, scale) =>
    set((state) => ({ triplanarScale: { ...state.triplanarScale, [typeId]: scale } })),

  resolvedColor: (typeId) => {
    const override = get().colorOverrides[typeId];
    if (override) return override;
    return BLOCK_TYPES.find((b) => b.id === typeId)?.color ?? '#ffffff';
  },

  resolvedScale: (typeId) => get().triplanarScale[typeId] ?? 0.5
}));
