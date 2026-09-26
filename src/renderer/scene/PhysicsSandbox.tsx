import { useEffect, useMemo } from 'react';
import { Physics, RigidBody } from '@react-three/rapier';
import { useSceneStore, type SceneObject } from '../state/sceneStore';
import { buildBufferGeometry } from '../geometry/quadMesh';
import { faceMaterialArray } from './materials/faceMaterialCache';

/**
 * There is no ground in this world, so every object becomes a dynamic rigid body —
 * toggling physics on means "everything you've built now falls," which is the honest
 * consequence of a void with no floor. The scene store is never mutated while active
 * (this renders a local snapshot), so exiting (Enter) just reverts to it for free.
 */
export default function PhysicsSandbox() {
  const snapshot = useMemo(() => Object.values(useSceneStore.getState().objects), []);

  return (
    <Physics gravity={[0, -9.81, 0]}>
      {snapshot.map((object) => (
        <PhysicsObject key={object.id} object={object} />
      ))}
    </Physics>
  );
}

function PhysicsObject({ object }: { object: SceneObject }) {
  const geometry = useMemo(() => buildBufferGeometry(object.faces), [object.faces]);
  const materials = useMemo(() => faceMaterialArray(object.materials), [object.materials]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <RigidBody
      type="dynamic"
      colliders="hull"
      position={object.position}
      rotation={object.rotation}
      linearDamping={0.15}
      angularDamping={0.25}
    >
      <mesh geometry={geometry} material={materials} scale={object.scale} castShadow receiveShadow />
    </RigidBody>
  );
}
