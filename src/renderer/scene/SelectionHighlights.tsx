import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../state/sceneStore';
import { objectMeshRegistry } from './objectRegistry';

const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));

const worldPos = new THREE.Vector3();
const worldQuat = new THREE.Quaternion();
const worldScale = new THREE.Vector3();
const size = new THREE.Vector3();
const center = new THREE.Vector3();

export default function SelectionHighlights() {
  const selection = useSceneStore((s) => s.selection);

  return (
    <group renderOrder={998}>
      {selection.map((id) => (
        <SelectedObjectOutline key={id} objectId={id} />
      ))}
    </group>
  );
}

function SelectedObjectOutline({ objectId }: { objectId: string }) {
  const ref = useRef<THREE.LineSegments>(null);

  useFrame(() => {
    const highlight = ref.current;
    if (!highlight) return;

    const mesh = objectMeshRegistry.get(objectId);
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
    highlight.scale.set(size.x * worldScale.x * 1.04, size.y * worldScale.y * 1.04, size.z * worldScale.z * 1.04);
  });

  return (
    <lineSegments ref={ref} geometry={edgesGeometry} frustumCulled={false}>
      <lineBasicMaterial color="#fbbf24" depthTest={false} transparent opacity={0.95} />
    </lineSegments>
  );
}
