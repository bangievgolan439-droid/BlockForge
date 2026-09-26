import { useMemo } from 'react';
import * as THREE from 'three';
import { useCsgStore } from '../state/csgStore';

/** Renders the last Manifold3D boolean-op result, floating above the world as a visible pipeline proof. */
export default function CsgPreview() {
  const preview = useCsgStore((s) => s.preview);

  const geometry = useMemo(() => {
    if (!preview) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(preview.positions, 3));
    geo.setIndex(new THREE.BufferAttribute(preview.indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [preview]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} position={[0, 5, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#5eead4" roughness={0.3} metalness={0.15} />
    </mesh>
  );
}
