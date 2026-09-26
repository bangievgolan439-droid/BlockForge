import { useMemo } from 'react';
import type * as THREE from 'three';
import { Physics, RigidBody, InstancedRigidBodies, type InstancedRigidBodyProps } from '@react-three/rapier';
import { useWorldStore, unkey } from '../state/worldStore';
import { useMaterialStore } from '../state/materialStore';
import { getBlockTexture } from './textures';
import './materials/TriplanarMaterial';

/**
 * The world store is never mutated while physics is active — this component only
 * renders a local, physically-simulated copy. Exiting (Enter) simply unmounts it
 * and the untouched VoxelWorld reappears, which is the "revert on exit" behavior.
 */
export default function PhysicsSandbox() {
  const snapshot = useMemo(() => useWorldStore.getState().blocks, []);

  // The lowest existing layer is treated as bedrock and stays fixed — otherwise every
  // block (including the ground under the player) free-falls the instant physics is on.
  const bedrockY = useMemo(() => {
    let min = Infinity;
    for (const key of Object.keys(snapshot)) {
      const y = unkey(key)[1];
      if (y < min) min = y;
    }
    return min === Infinity ? 0 : min;
  }, [snapshot]);

  const byType = useMemo(() => {
    const map = new Map<number, { bedrock: string[]; dynamic: string[] }>();
    for (const [key, typeId] of Object.entries(snapshot)) {
      let bucket = map.get(typeId);
      if (!bucket) {
        bucket = { bedrock: [], dynamic: [] };
        map.set(typeId, bucket);
      }
      const y = unkey(key)[1];
      (y <= bedrockY ? bucket.bedrock : bucket.dynamic).push(key);
    }
    return map;
  }, [snapshot, bedrockY]);

  return (
    <Physics gravity={[0, -9.81, 0]}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, bedrockY - 25, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[500, 1, 500]} />
        </mesh>
      </RigidBody>
      {Array.from(byType.entries()).map(([typeId, buckets]) => (
        <PhysicsBlockType key={typeId} typeId={typeId} buckets={buckets} />
      ))}
    </Physics>
  );
}

function PhysicsBlockType({ typeId, buckets }: { typeId: number; buckets: { bedrock: string[]; dynamic: string[] } }) {
  const color = useMaterialStore((s) => s.resolvedColor(typeId));
  const scale = useMaterialStore((s) => s.resolvedScale(typeId));
  const texture = useMemo(() => getBlockTexture(typeId, color), [typeId, color]);

  return (
    <>
      {buckets.bedrock.length > 0 && (
        <PhysicsInstances
          typeId={typeId}
          blockKeys={buckets.bedrock}
          bodyType="fixed"
          texture={texture}
          scale={scale}
        />
      )}
      {buckets.dynamic.length > 0 && (
        <PhysicsInstances
          typeId={typeId}
          blockKeys={buckets.dynamic}
          bodyType="dynamic"
          texture={texture}
          scale={scale}
        />
      )}
    </>
  );
}

function PhysicsInstances({
  typeId,
  blockKeys,
  bodyType,
  texture,
  scale
}: {
  typeId: number;
  blockKeys: string[];
  bodyType: 'fixed' | 'dynamic';
  texture: THREE.Texture;
  scale: number;
}) {
  const instances = useMemo<InstancedRigidBodyProps[]>(
    () =>
      blockKeys.map((key, i) => {
        const [x, y, z] = unkey(key);
        return { key: `${typeId}-${bodyType}-${i}`, position: [x, y, z] };
      }),
    [blockKeys, typeId, bodyType]
  );

  return (
    <InstancedRigidBodies instances={instances} colliders="cuboid" type={bodyType}>
      <instancedMesh args={[undefined, undefined, blockKeys.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <triplanarMaterial map={texture} scale={scale} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
