import { useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../state/appStore';
import { unkey } from '../state/worldStore';

const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.04, 1.04, 1.04));

export default function SelectionHighlights() {
  const selection = useAppStore((s) => s.selection);
  const positions = useMemo(() => selection.map(unkey), [selection]);

  return (
    <group renderOrder={998}>
      {positions.map((pos, i) => (
        <lineSegments key={selection[i]} position={pos} geometry={edges}>
          <lineBasicMaterial color="#5eead4" depthTest={false} transparent opacity={0.95} />
        </lineSegments>
      ))}
    </group>
  );
}
