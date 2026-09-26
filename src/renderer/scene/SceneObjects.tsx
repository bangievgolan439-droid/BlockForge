import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../state/sceneStore';
import { useAppStore } from '../state/appStore';
import { buildBufferGeometry, triangleIndexToFace } from '../geometry/quadMesh';
import { faceMaterialArray } from './materials/faceMaterialCache';
import { objectMeshRegistry } from './objectRegistry';
import { extrudeDragRef } from './extrudeDragState';
import './materials/TriplanarMaterial';

export default function SceneObjects() {
  const objectIds = useSceneStore((s) => Object.keys(s.objects));

  return (
    <group>
      {objectIds.map((id) => (
        <SceneObjectMesh key={id} objectId={id} />
      ))}
    </group>
  );
}

function SceneObjectMesh({ objectId }: { objectId: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const object = useSceneStore((s) => s.objects[objectId]);
  const toolMode = useAppStore((s) => s.toolMode);
  const inspectorOpen = useAppStore((s) => s.inspectorOpen);

  const geometry = useMemo(() => (object ? buildBufferGeometry(object.faces) : null), [object?.faces]);
  const materials = useMemo(() => (object ? faceMaterialArray(object.materials) : []), [object?.materials]);

  // Each recomputed geometry is a fresh BufferGeometry (built outside JSX), which R3F
  // won't auto-dispose — do it ourselves whenever it's replaced or the mesh unmounts.
  useEffect(() => {
    return () => geometry?.dispose();
  }, [geometry]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    objectMeshRegistry.set(objectId, mesh);
    return () => {
      objectMeshRegistry.delete(objectId);
    };
  }, [objectId]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (mesh) mesh.updateMatrixWorld(true);
  }, [object?.position, object?.rotation, object?.scale]);

  if (!object || !geometry) return null;

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!inspectorOpen) return;
    event.stopPropagation();

    if (toolMode === 'paint') {
      if (event.faceIndex == null) return;
      const face = triangleIndexToFace(object.faces, event.faceIndex);
      if (!face) return;
      useSceneStore.getState().paintFace(objectId, face.id, useAppStore.getState().activeColor);
      return;
    }

    if (toolMode === 'extrude') {
      if (event.faceIndex == null) return;
      const face = triangleIndexToFace(object.faces, event.faceIndex);
      if (!face) return;
      extrudeDragRef.current = {
        objectId,
        faceId: face.id,
        preDragFaces: object.faces,
        preDragMaterials: object.materials,
        startClientY: event.nativeEvent.clientY
      };
      return;
    }

    useSceneStore.getState().toggleSelected(objectId, event.shiftKey);
  };

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={materials}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      castShadow
      receiveShadow
      onPointerDown={handlePointerDown}
    />
  );
}
