import { create } from 'zustand';

export interface BlockTypeDef {
  id: number;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
}

export const BLOCK_TYPES: BlockTypeDef[] = [
  { id: 1, name: 'Stone', color: '#8a8f98', roughness: 0.9, metalness: 0.0 },
  { id: 2, name: 'Dirt', color: '#7a5230', roughness: 1.0, metalness: 0.0 },
  { id: 3, name: 'Grass', color: '#4f9e3a', roughness: 0.95, metalness: 0.0 },
  { id: 4, name: 'Wood', color: '#9c6b3c', roughness: 0.8, metalness: 0.0 },
  { id: 5, name: 'Sand', color: '#dcc27a', roughness: 1.0, metalness: 0.0 },
  { id: 6, name: 'Brick', color: '#a24936', roughness: 0.85, metalness: 0.0 },
  { id: 7, name: 'Glass', color: '#bfe3f0', roughness: 0.1, metalness: 0.0 },
  { id: 8, name: 'Metal', color: '#c7ccd6', roughness: 0.35, metalness: 0.85 },
  { id: 9, name: 'Glow', color: '#5eead4', roughness: 0.6, metalness: 0.0 }
];

export function blockTypeById(id: number): BlockTypeDef {
  return BLOCK_TYPES.find((b) => b.id === id) ?? BLOCK_TYPES[0]!;
}

export type BlockKey = string;

export function keyFor(x: number, y: number, z: number): BlockKey {
  return `${x},${y},${z}`;
}

export function unkey(key: BlockKey): [number, number, number] {
  const [x, y, z] = key.split(',').map(Number) as [number, number, number];
  return [x, y, z];
}

export interface PrefabGroup {
  id: string;
  name: string;
  blockKeys: BlockKey[];
}

function colKey(x: number, z: number): string {
  return `${x},${z}`;
}

interface WorldState {
  blocks: Record<BlockKey, number>;
  columns: Record<string, number[]>;
  groups: Record<string, PrefabGroup>;
  revision: number;

  placeBlock: (x: number, y: number, z: number, typeId: number) => void;
  removeBlock: (x: number, y: number, z: number) => void;
  getBlock: (x: number, y: number, z: number) => number | undefined;
  heightAt: (x: number, z: number) => number;
  groupSelection: (blockKeys: BlockKey[], name?: string) => string;
  ungroup: (groupId: string) => void;
  loadWorld: (blocks: Record<BlockKey, number>) => void;
  serializeKeys: (keys: BlockKey[]) => { blocks: Record<BlockKey, number>; origin: [number, number, number] } | null;
  serializeGroup: (groupId: string) => { blocks: Record<BlockKey, number>; origin: [number, number, number] } | null;
  nudgeBlocks: (keys: BlockKey[], dx: number, dy: number, dz: number) => BlockKey[];
  placePrefab: (blocks: Record<BlockKey, number>, offset: [number, number, number]) => void;
}

function insertSorted(arr: number[], value: number): number[] {
  const idx = arr.findIndex((v) => v > value);
  if (idx === -1) return [...arr, value];
  return [...arr.slice(0, idx), value, ...arr.slice(idx)];
}

function removeSorted(arr: number[], value: number): number[] {
  const idx = arr.indexOf(value);
  if (idx === -1) return arr;
  return [...arr.slice(0, idx), ...arr.slice(idx + 1)];
}

function buildDefaultWorld(): { blocks: Record<BlockKey, number>; columns: Record<string, number[]> } {
  const blocks: Record<BlockKey, number> = {};
  const columns: Record<string, number[]> = {};
  const size = 12;
  for (let x = -size; x <= size; x++) {
    for (let z = -size; z <= size; z++) {
      blocks[keyFor(x, -1, z)] = 3;
      blocks[keyFor(x, -2, z)] = 2;
      columns[colKey(x, z)] = [-2, -1];
    }
  }
  return { blocks, columns };
}

const { blocks: initialBlocks, columns: initialColumns } = buildDefaultWorld();

export const useWorldStore = create<WorldState>((set, get) => ({
  blocks: initialBlocks,
  columns: initialColumns,
  groups: {},
  revision: 0,

  placeBlock: (x, y, z, typeId) =>
    set((state) => {
      const ck = colKey(x, z);
      const existingColumn = state.columns[ck] ?? [];
      return {
        blocks: { ...state.blocks, [keyFor(x, y, z)]: typeId },
        columns: { ...state.columns, [ck]: insertSorted(existingColumn, y) },
        revision: state.revision + 1
      };
    }),

  removeBlock: (x, y, z) =>
    set((state) => {
      const key = keyFor(x, y, z);
      if (!(key in state.blocks)) return state;
      const next = { ...state.blocks };
      delete next[key];
      const ck = colKey(x, z);
      const existingColumn = state.columns[ck] ?? [];
      return {
        blocks: next,
        columns: { ...state.columns, [ck]: removeSorted(existingColumn, y) },
        revision: state.revision + 1
      };
    }),

  getBlock: (x, y, z) => get().blocks[keyFor(x, y, z)],

  heightAt: (x, z) => {
    const col = get().columns[colKey(x, z)];
    if (!col || col.length === 0) return -Infinity;
    return col[col.length - 1]!;
  },

  groupSelection: (blockKeys, name) => {
    const id = `grp_${Math.random().toString(36).slice(2, 10)}`;
    set((state) => ({
      groups: {
        ...state.groups,
        [id]: { id, name: name ?? `Group ${Object.keys(state.groups).length + 1}`, blockKeys: [...blockKeys] }
      }
    }));
    return id;
  },

  ungroup: (groupId) =>
    set((state) => {
      const next = { ...state.groups };
      delete next[groupId];
      return { groups: next };
    }),

  loadWorld: (blocks) => {
    const columns: Record<string, number[]> = {};
    for (const key of Object.keys(blocks)) {
      const [x, y, z] = unkey(key);
      const ck = colKey(x, z);
      columns[ck] = insertSorted(columns[ck] ?? [], y);
    }
    set({ blocks, columns, revision: get().revision + 1 });
  },

  serializeKeys: (keys) => {
    if (keys.length === 0) return null;
    const blocks = get().blocks;
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    for (const key of keys) {
      const [x, y, z] = unkey(key);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
    }
    const out: Record<BlockKey, number> = {};
    for (const key of keys) {
      const typeId = blocks[key];
      if (typeId === undefined) continue;
      const [x, y, z] = unkey(key);
      out[keyFor(x - minX, y - minY, z - minZ)] = typeId;
    }
    return { blocks: out, origin: [minX, minY, minZ] };
  },

  serializeGroup: (groupId) => {
    const group = get().groups[groupId];
    if (!group) return null;
    return get().serializeKeys(group.blockKeys);
  },

  nudgeBlocks: (keys, dx, dy, dz) => {
    const state = get();
    const moves = keys
      .map((k) => {
        const [x, y, z] = unkey(k);
        const typeId = state.blocks[k];
        if (typeId === undefined) return null;
        return { oldKey: k, newKey: keyFor(x + dx, y + dy, z + dz), typeId };
      })
      .filter((m): m is { oldKey: string; newKey: string; typeId: number } => m !== null);

    const nextBlocks = { ...state.blocks };
    for (const m of moves) delete nextBlocks[m.oldKey];
    for (const m of moves) nextBlocks[m.newKey] = m.typeId;

    const columns: Record<string, number[]> = {};
    for (const key of Object.keys(nextBlocks)) {
      const [x, y, z] = unkey(key);
      const ck = colKey(x, z);
      columns[ck] = insertSorted(columns[ck] ?? [], y);
    }

    set({ blocks: nextBlocks, columns, revision: state.revision + 1 });
    return moves.map((m) => m.newKey);
  },

  placePrefab: (blocks, offset) => {
    const [ox, oy, oz] = offset;
    const state = get();
    const nextBlocks = { ...state.blocks };
    const columns = { ...state.columns };

    for (const [key, typeId] of Object.entries(blocks)) {
      const [x, y, z] = unkey(key);
      const wx = x + ox;
      const wy = y + oy;
      const wz = z + oz;
      nextBlocks[keyFor(wx, wy, wz)] = typeId;
      const ck = colKey(wx, wz);
      columns[ck] = insertSorted(columns[ck] ?? [], wy);
    }

    set({ blocks: nextBlocks, columns, revision: state.revision + 1 });
  }
}));
