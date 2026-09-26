import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { targetedCellRef } from './buildTarget';

export default function TargetHighlight() {
  const ref = useRef<THREE.LineSegments>(null);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const cell = targetedCellRef.current;
    if (!cell) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    mesh.position.set(cell[0], cell[1], cell[2]);
  });

  return (
    <lineSegments ref={ref} renderOrder={999}>
      <edgesGeometry args={[new THREE.BoxGeometry(1.002, 1.002, 1.002)]} />
      <lineBasicMaterial color="#0a0b0f" transparent opacity={0.85} depthTest={false} />
    </lineSegments>
  );
}
