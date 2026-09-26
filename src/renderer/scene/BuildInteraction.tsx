import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../state/appStore';
import { useWorldStore, unkey } from '../state/worldStore';
import { raycastVoxels } from './voxelRegistry';
import { targetedCellRef } from './buildTarget';

const MAX_REACH = 8;
const raycaster = new THREE.Raycaster();
raycaster.far = MAX_REACH;
const centerNdc = new THREE.Vector2(0, 0);

export default function BuildInteraction() {
  const { camera, gl } = useThree();
  const hoveredRef = useRef<{ key: string; normal: THREE.Vector3 } | null>(null);

  useFrame(() => {
    const { movementMode, inspectorOpen, pointerLocked } = useAppStore.getState();
    if (movementMode !== 'build' || inspectorOpen || !pointerLocked) {
      hoveredRef.current = null;
      targetedCellRef.current = null;
      return;
    }

    raycaster.setFromCamera(centerNdc, camera);
    const hit = raycastVoxels(raycaster);
    if (!hit) {
      hoveredRef.current = null;
      targetedCellRef.current = null;
      return;
    }

    hoveredRef.current = { key: hit.key, normal: hit.normal };
    targetedCellRef.current = unkey(hit.key);
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      const { movementMode, inspectorOpen, hotbarIndex } = useAppStore.getState();
      if (movementMode !== 'build' || inspectorOpen) return;

      const hovered = hoveredRef.current;
      if (!hovered) return;

      const [x, y, z] = unkey(hovered.key);

      if (event.button === 0) {
        useWorldStore.getState().removeBlock(x, y, z);
      } else if (event.button === 2) {
        const nx = x + Math.round(hovered.normal.x);
        const ny = y + Math.round(hovered.normal.y);
        const nz = z + Math.round(hovered.normal.z);
        const typeId = hotbarIndex + 1;
        useWorldStore.getState().placeBlock(nx, ny, nz, typeId);
      }
    };

    const onContextMenu = (event: MouseEvent) => event.preventDefault();

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('contextmenu', onContextMenu);
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gl]);

  return null;
}
