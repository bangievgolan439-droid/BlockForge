import * as THREE from 'three';
import type { SceneObject } from '../state/sceneStore';

export interface TriangleSoup {
  positions: Float32Array;
  indices: Uint32Array;
}

/**
 * Flattens an object's local quad faces into a world-space triangle soup, ready to hand
 * to Manifold's Mesh constructor (after `.merge()` welds the coincident face-boundary
 * vertices our flat-shaded representation stores separately).
 */
export function objectToWorldTriangleSoup(object: SceneObject): TriangleSoup {
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...object.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...object.rotation)),
    new THREE.Vector3(...object.scale)
  );

  const positions = new Float32Array(object.faces.length * 6 * 3);
  let offset = 0;
  const v = new THREE.Vector3();

  for (const face of object.faces) {
    const [c0, c1, c2, c3] = face.corners;
    const triangles = [c0, c1, c2, c0, c2, c3];
    for (const corner of triangles) {
      v.set(corner[0], corner[1], corner[2]).applyMatrix4(matrix);
      positions[offset] = v.x;
      positions[offset + 1] = v.y;
      positions[offset + 2] = v.z;
      offset += 3;
    }
  }

  const indices = new Uint32Array(positions.length / 3);
  for (let i = 0; i < indices.length; i++) indices[i] = i;

  return { positions, indices };
}
