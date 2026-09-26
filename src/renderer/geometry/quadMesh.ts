import * as THREE from 'three';
import { type Vec3, add, sub, scale, cross, normalize } from './vec3';

export interface QuadFace {
  id: string;
  /** Local-space corners, CCW winding as seen from outside the solid. */
  corners: [Vec3, Vec3, Vec3, Vec3];
  materialSlot: number;
}

export interface QuadMesh {
  faces: QuadFace[];
}

let faceIdCounter = 0;
function nextFaceId(): string {
  faceIdCounter += 1;
  return `face_${faceIdCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Builds one quad face from its outward normal. u/v are derived so that u x v is a
 * positive multiple of the normal, which guarantees the returned corners are wound
 * CCW as seen from outside — this same guarantee is what makes extrude's side-wall
 * winding work out correctly (see extrudeFace below).
 */
function makeFace(normal: Vec3, size: number, materialSlot: number): QuadFace {
  const n = normalize(normal);
  const helper: Vec3 = Math.abs(n[1]) < 0.99 ? [0, 1, 0] : [1, 0, 0];
  const uHat = normalize(cross(helper, n));
  const vHat = cross(n, uHat);
  const u = scale(uHat, size / 2);
  const v = scale(vHat, size / 2);
  const center = scale(n, size / 2);

  const corners: [Vec3, Vec3, Vec3, Vec3] = [
    sub(sub(center, u), v),
    sub(add(center, u), v),
    add(add(center, u), v),
    add(sub(center, u), v)
  ];

  return { id: nextFaceId(), corners, materialSlot };
}

export function makeBoxMesh(size = 1): { faces: QuadFace[]; materialCount: number } {
  const normals: Vec3[] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ];
  const faces = normals.map((n, i) => makeFace(n, size, i));
  return { faces, materialCount: 6 };
}

export function faceNormal(face: QuadFace): Vec3 {
  const [c0, c1, , c3] = face.corners;
  return normalize(cross(sub(c1, c0), sub(c3, c0)));
}

export function faceCenter(face: QuadFace): Vec3 {
  const [c0, c1, c2, c3] = face.corners;
  return scale(add(add(c0, c1), add(c2, c3)), 0.25);
}

/**
 * Extrudes one face outward (or inward, for a negative distance) along its normal.
 * The original face becomes the new cap; four new side faces stitch the old ring to
 * the new one. Faces never share vertices (each owns its own 4 corners, even where
 * they coincide with a neighbor's), so this never distorts any other face.
 */
export function extrudeFace(
  mesh: QuadMesh,
  materials: string[],
  faceId: string,
  distance: number
): { faces: QuadFace[]; materials: string[]; newFaceIds: string[] } {
  const faceIndex = mesh.faces.findIndex((f) => f.id === faceId);
  if (faceIndex === -1) return { faces: mesh.faces, materials, newFaceIds: [] };

  const face = mesh.faces[faceIndex]!;
  const normal = faceNormal(face);
  const offset = scale(normal, distance);
  const oldRing = face.corners;
  const newRing = oldRing.map((c) => add(c, offset)) as [Vec3, Vec3, Vec3, Vec3];

  const nextMaterials = [...materials];
  const baseColor = materials[face.materialSlot] ?? '#8a8f98';
  const newFaceIds: string[] = [];

  const sideFaces: QuadFace[] = [0, 1, 2, 3].map((i) => {
    const a = oldRing[i]!;
    const b = oldRing[(i + 1) % 4]!;
    const bTop = newRing[(i + 1) % 4]!;
    const aTop = newRing[i]!;
    const slot = nextMaterials.length;
    nextMaterials.push(baseColor);
    const id = nextFaceId();
    newFaceIds.push(id);
    return { id, corners: [a, b, bTop, aTop], materialSlot: slot };
  });

  const cappedFace: QuadFace = { ...face, corners: newRing };
  newFaceIds.push(face.id);

  const faces = [...mesh.faces];
  faces[faceIndex] = cappedFace;
  faces.push(...sideFaces);

  return { faces, materials: nextMaterials, newFaceIds };
}

export function deleteFace(mesh: QuadMesh, faceId: string): QuadFace[] {
  return mesh.faces.filter((f) => f.id !== faceId);
}

/**
 * Builds a flat-shaded, per-face-grouped BufferGeometry. Each face's 2 triangles form
 * their own material group so a Mesh can carry one material per face for painting.
 */
export function buildBufferGeometry(faces: QuadFace[]): THREE.BufferGeometry {
  const positions = new Float32Array(faces.length * 6 * 3);
  let offset = 0;

  faces.forEach((face) => {
    const [c0, c1, c2, c3] = face.corners;
    const tri = [c0, c1, c2, c0, c2, c3];
    for (const [x, y, z] of tri) {
      positions[offset] = x;
      positions[offset + 1] = y;
      positions[offset + 2] = z;
      offset += 3;
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  let start = 0;
  faces.forEach((face) => {
    // materialIndex must be the face's material SLOT (the index into the mesh's
    // material array), not its position in the faces array — those diverge once a
    // face has been painted or extruded (slots are assigned as they're created).
    geometry.addGroup(start, 6, face.materialSlot);
    start += 6;
  });

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Maps a raycast `faceIndex` (three.js triangle index) back to our QuadFace. */
export function triangleIndexToFace(faces: QuadFace[], triangleIndex: number): QuadFace | null {
  const faceIdx = Math.floor(triangleIndex / 2);
  return faces[faceIdx] ?? null;
}
