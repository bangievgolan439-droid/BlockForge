import * as THREE from 'three';

export interface VoxelRegistryEntry {
  mesh: THREE.InstancedMesh;
  keys: string[];
}

export const voxelRegistry = new Map<number, VoxelRegistryEntry>();

export function raycastVoxels(
  raycaster: THREE.Raycaster
): { key: string; point: THREE.Vector3; normal: THREE.Vector3 } | null {
  let closest: { distance: number; key: string; point: THREE.Vector3; normal: THREE.Vector3 } | null = null;

  for (const entry of voxelRegistry.values()) {
    const hits = raycaster.intersectObject(entry.mesh, false);
    for (const hit of hits) {
      if (hit.instanceId === undefined || !hit.face) continue;
      if (closest && hit.distance >= closest.distance) continue;
      const key = entry.keys[hit.instanceId];
      if (key === undefined) continue;
      closest = {
        distance: hit.distance,
        key,
        point: hit.point.clone(),
        normal: hit.face.normal.clone()
      };
    }
  }

  if (!closest) return null;
  return { key: closest.key, point: closest.point, normal: closest.normal };
}
