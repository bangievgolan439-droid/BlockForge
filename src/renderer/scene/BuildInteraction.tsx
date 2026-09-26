import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../state/appStore';
import { useSceneStore } from '../state/sceneStore';
import { raycastObjects, type ObjectRaycastHit } from './objectRegistry';
import { targetedObjectRef } from './buildTarget';

const MAX_REACH = 30;
const SPAWN_DISTANCE = 4;
const raycaster = new THREE.Raycaster();
raycaster.far = MAX_REACH;
const centerNdc = new THREE.Vector2(0, 0);

export default function BuildInteraction() {
  const { camera, gl } = useThree();
  const hoveredRef = useRef<ObjectRaycastHit | null>(null);

  useFrame(() => {
    const { movementMode, inspectorOpen, pointerLocked } = useAppStore.getState();
    if (movementMode !== 'build' || inspectorOpen || !pointerLocked) {
      hoveredRef.current = null;
      targetedObjectRef.current = null;
      return;
    }

    raycaster.setFromCamera(centerNdc, camera);
    const hit = raycastObjects(raycaster);
    hoveredRef.current = hit;
    targetedObjectRef.current = hit ? { objectId: hit.objectId } : null;
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      const { movementMode, inspectorOpen, activeColor } = useAppStore.getState();
      if (movementMode !== 'build' || inspectorOpen) return;

      const hovered = hoveredRef.current;

      if (event.button === 0) {
        if (hovered) useSceneStore.getState().deleteObject(hovered.objectId);
        return;
      }

      if (event.button === 2) {
        if (hovered) {
          const spawnPoint = hovered.point.clone().addScaledVector(hovered.normal, 0.5);
          useSceneStore.getState().spawnBox([spawnPoint.x, spawnPoint.y, spawnPoint.z], activeColor);
        } else {
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          const spawnPoint = camera.position.clone().addScaledVector(forward, SPAWN_DISTANCE);
          useSceneStore.getState().spawnBox([spawnPoint.x, spawnPoint.y, spawnPoint.z], activeColor);
        }
      }
    };

    const onContextMenu = (event: MouseEvent) => event.preventDefault();

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('contextmenu', onContextMenu);
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gl, camera]);

  return null;
}
