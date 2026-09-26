import { create } from 'zustand';
import type { SerializedMesh } from '../workers/geometryClient';

interface CsgState {
  preview: SerializedMesh | null;
  busy: boolean;
  error: string | null;
  setPreview: (mesh: SerializedMesh | null) => void;
  setBusy: (busy: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCsgStore = create<CsgState>((set) => ({
  preview: null,
  busy: false,
  error: null,
  setPreview: (preview) => set({ preview, error: null }),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error })
}));
