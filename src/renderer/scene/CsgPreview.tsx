import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useCsgStore } from '../state/csgStore';

/**
 * Renders the last Manifold3D boolean-op result. The worker receives world-space
 * triangle soups (see objectToWorldTriangleSoup), so the result comes back already in
 * world space — this mesh renders at the identity transform, no extra offset needed.
 */
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

  useEffect(() => {
    return () => geometry?.dispose();
  }, [geometry]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#5eead4" roughness={0.3} metalness={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}
