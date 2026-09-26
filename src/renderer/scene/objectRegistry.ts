import * as THREE from 'three';
import { useSceneStore } from '../state/sceneStore';
import { triangleIndexToFace } from '../geometry/quadMesh';

export const objectMeshRegistry = new Map<string, THREE.Mesh>();

export interface ObjectRaycastHit {
  objectId: string;
  faceId: string;
  point: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
}

export function raycastObjects(raycaster: THREE.Raycaster): ObjectRaycastHit | null {
  let closest: ObjectRaycastHit | null = null;

  for (const [objectId, mesh] of objectMeshRegistry) {
    const hits = raycaster.intersectObject(mesh, false);
    for (const hit of hits) {
      if (hit.faceIndex == null || !hit.face) continue;
      if (closest && hit.distance >= closest.distance) continue;

      const obj = useSceneStore.getState().objects[objectId];
      if (!obj) continue;
      const face = triangleIndexToFace(obj.faces, hit.faceIndex);
      if (!face) continue;

      // face.normal from three.js raycasting is in local object space — transform it
      // to world space so callers get the direction the face actually points after
      // this object's own rotation/scale.
      const worldNormal = hit.face.normal.clone().transformDirection(mesh.matrixWorld);

      closest = {
        objectId,
        faceId: face.id,
        point: hit.point.clone(),
        normal: worldNormal,
        distance: hit.distance
      };
    }
  }

  return closest;
}
