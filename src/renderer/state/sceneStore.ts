import { create } from 'zustand';
import type { Vec3 } from '../geometry/vec3';
import { add } from '../geometry/vec3';
import { makeBoxMesh, extrudeFace as extrudeFaceGeom, type QuadFace } from '../geometry/quadMesh';

export interface SceneObject {
  id: string;
  name: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  faces: QuadFace[];
  materials: string[];
}

export interface ObjectGroup {
  id: string;
  name: string;
  objectIds: string[];
}

export interface SerializedPrefab {
  objects: SceneObject[];
}

let idCounter = 0;
function genId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

interface SceneState {
  objects: Record<string, SceneObject>;
  groups: Record<string, ObjectGroup>;
  selection: string[];
  revision: number;

  spawnBox: (position: Vec3, color?: string) => string;
  deleteObject: (id: string) => void;
  setTransform: (id: string, partial: Partial<Pick<SceneObject, 'position' | 'rotation' | 'scale'>>) => void;
  nudgeSelection: (ids: string[], delta: Vec3) => void;
  extrude: (objectId: string, faceId: string, distance: number) => string | null;
  paintFace: (objectId: string, faceId: string, color: string) => void;
  renameObject: (id: string, name: string) => void;
  replaceObject: (id: string, patch: Partial<SceneObject>) => void;

  groupSelection: (objectIds: string[], name?: string) => string;
  ungroup: (groupId: string) => void;

  setSelection: (ids: string[]) => void;
  toggleSelected: (id: string, additive: boolean) => void;
  clearSelection: () => void;

  serializeSelection: (ids: string[]) => SerializedPrefab | null;
  loadObjects: (objects: SceneObject[], spawnAt: Vec3) => string[];
}

export const useSceneStore = create<SceneState>((set, get) => ({
  objects: {},
  groups: {},
  selection: [],
  revision: 0,

  spawnBox: (position, color = '#8a8f98') => {
    const { faces, materialCount } = makeBoxMesh(1);
    const id = genId('obj');
    const materials = Array.from({ length: materialCount }, () => color);
    const obj: SceneObject = {
      id,
      name: `Box.${Object.keys(get().objects).length + 1}`,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      faces,
      materials
    };
    set((state) => ({ objects: { ...state.objects, [id]: obj }, revision: state.revision + 1 }));
    return id;
  },

  deleteObject: (id) =>
    set((state) => {
      if (!(id in state.objects)) return state;
      const next = { ...state.objects };
      delete next[id];
      return {
        objects: next,
        selection: state.selection.filter((s) => s !== id),
        revision: state.revision + 1
      };
    }),

  setTransform: (id, partial) =>
    set((state) => {
      const obj = state.objects[id];
      if (!obj) return state;
      return { objects: { ...state.objects, [id]: { ...obj, ...partial } }, revision: state.revision + 1 };
    }),

  nudgeSelection: (ids, delta) =>
    set((state) => {
      const next = { ...state.objects };
      let changed = false;
      for (const id of ids) {
        const obj = next[id];
        if (!obj) continue;
        next[id] = { ...obj, position: add(obj.position, delta) };
        changed = true;
      }
      if (!changed) return state;
      return { objects: next, revision: state.revision + 1 };
    }),

  extrude: (objectId, faceId, distance) => {
    const obj = get().objects[objectId];
    if (!obj) return null;
    const result = extrudeFaceGeom({ faces: obj.faces }, obj.materials, faceId, distance);
    set((state) => ({
      objects: { ...state.objects, [objectId]: { ...obj, faces: result.faces, materials: result.materials } },
      revision: state.revision + 1
    }));
    return result.newFaceIds[result.newFaceIds.length - 1] ?? null;
  },

  paintFace: (objectId, faceId, color) =>
    set((state) => {
      const obj = state.objects[objectId];
      if (!obj) return state;
      const face = obj.faces.find((f) => f.id === faceId);
      if (!face) return state;
      const materials = [...obj.materials];
      materials[face.materialSlot] = color;
      return { objects: { ...state.objects, [objectId]: { ...obj, materials } }, revision: state.revision + 1 };
    }),

  renameObject: (id, name) =>
    set((state) => {
      const obj = state.objects[id];
      if (!obj) return state;
      return { objects: { ...state.objects, [id]: { ...obj, name } } };
    }),

  replaceObject: (id, patch) =>
    set((state) => {
      const obj = state.objects[id];
      if (!obj) return state;
      return { objects: { ...state.objects, [id]: { ...obj, ...patch } }, revision: state.revision + 1 };
    }),

  groupSelection: (objectIds, name) => {
    const id = genId('grp');
    set((state) => ({
      groups: {
        ...state.groups,
        [id]: { id, name: name ?? `Group.${Object.keys(state.groups).length + 1}`, objectIds: [...objectIds] }
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

  setSelection: (ids) => set({ selection: ids }),

  toggleSelected: (id, additive) =>
    set((state) => {
      const has = state.selection.includes(id);
      if (!additive) {
        return { selection: has && state.selection.length === 1 ? [] : [id] };
      }
      return { selection: has ? state.selection.filter((s) => s !== id) : [...state.selection, id] };
    }),

  clearSelection: () => set({ selection: [] }),

  serializeSelection: (ids) => {
    const state = get();
    const objs = ids.map((id) => state.objects[id]).filter((o): o is SceneObject => Boolean(o));
    if (objs.length === 0) return null;

    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (const o of objs) {
      cx += o.position[0];
      cy += o.position[1];
      cz += o.position[2];
    }
    cx /= objs.length;
    cy /= objs.length;
    cz /= objs.length;

    const relative = objs.map((o) => ({
      ...o,
      position: [o.position[0] - cx, o.position[1] - cy, o.position[2] - cz] as Vec3
    }));

    return { objects: relative };
  },

  loadObjects: (objects, spawnAt) => {
    const newIds: string[] = [];
    set((state) => {
      const next = { ...state.objects };
      for (const o of objects) {
        const id = genId('obj');
        newIds.push(id);
        next[id] = { ...o, id, position: add(o.position, spawnAt) };
      }
      return { objects: next, revision: state.revision + 1 };
    });
    return newIds;
  }
}));
