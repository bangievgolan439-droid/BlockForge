import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { targetedObjectRef } from './buildTarget';
import { objectMeshRegistry } from './objectRegistry';

const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));

const worldPos = new THREE.Vector3();
const worldQuat = new THREE.Quaternion();
const worldScale = new THREE.Vector3();
const size = new THREE.Vector3();
const center = new THREE.Vector3();

export default function TargetHighlight() {
  const ref = useRef<THREE.LineSegments>(null);

  useFrame(() => {
    const highlight = ref.current;
    if (!highlight) return;

    const target = targetedObjectRef.current;
    const mesh = target ? objectMeshRegistry.get(target.objectId) : undefined;
    const bbox = mesh?.geometry.boundingBox;
    if (!mesh || !bbox) {
      highlight.visible = false;
      return;
    }

    highlight.visible = true;
    mesh.matrixWorld.decompose(worldPos, worldQuat, worldScale);
    bbox.getSize(size);
    bbox.getCenter(center);

    const centerWorldOffset = center.clone().multiply(worldScale).applyQuaternion(worldQuat);
    highlight.position.copy(worldPos).add(centerWorldOffset);
    highlight.quaternion.copy(worldQuat);
    highlight.scale.set(size.x * worldScale.x * 1.02, size.y * worldScale.y * 1.02, size.z * worldScale.z * 1.02);
  });

  return (
    <lineSegments ref={ref} geometry={edgesGeometry} renderOrder={999} frustumCulled={false}>
      <lineBasicMaterial color="#5eead4" transparent opacity={0.9} depthTest={false} />
    </lineSegments>
  );
}
