import { useLayoutEffect, useMemo, useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../state/appStore';
import { useWorldStore, unkey } from '../state/worldStore';
import { useMaterialStore } from '../state/materialStore';
import { getBlockTexture } from './textures';
import { voxelRegistry } from './voxelRegistry';
import './materials/TriplanarMaterial';

const dummy = new THREE.Object3D();

export default function VoxelWorld() {
  const blocks = useWorldStore((s) => s.blocks);

  const byType = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const [key, typeId] of Object.entries(blocks)) {
      const arr = map.get(typeId);
      if (arr) arr.push(key);
      else map.set(typeId, [key]);
    }
    return map;
  }, [blocks]);

  return (
    <group>
      {Array.from(byType.entries()).map(([typeId, keys]) => (
        <BlockTypeInstances key={typeId} typeId={typeId} blockKeys={keys} />
      ))}
    </group>
  );
}

function BlockTypeInstances({ typeId, blockKeys }: { typeId: number; blockKeys: string[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const color = useMaterialStore((s) => s.resolvedColor(typeId));
  const scale = useMaterialStore((s) => s.resolvedScale(typeId));
  const texture = useMemo(() => getBlockTexture(typeId, color), [typeId, color]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    blockKeys.forEach((key, i) => {
      const [x, y, z] = unkey(key);
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();

    voxelRegistry.set(typeId, { mesh, keys: blockKeys });
    return () => {
      voxelRegistry.delete(typeId);
    };
  }, [blockKeys, typeId]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!useAppStore.getState().inspectorOpen) return;
    event.stopPropagation();
    if (event.instanceId === undefined) return;
    const key = blockKeys[event.instanceId];
    if (!key) return;
    useAppStore.getState().toggleSelected(key, event.shiftKey);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, blockKeys.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
      onPointerDown={handlePointerDown}
    >
      <boxGeometry args={[1, 1, 1]} />
      <triplanarMaterial map={texture} scale={scale} />
    </instancedMesh>
  );
}
