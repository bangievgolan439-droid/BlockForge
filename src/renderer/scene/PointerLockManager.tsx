import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../state/appStore';

const LOOK_SENSITIVITY = 0.0022;

export default function PointerLockManager() {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      const e2 = euler.current;
      e2.y -= e.movementX * LOOK_SENSITIVITY;
      e2.x -= e.movementY * LOOK_SENSITIVITY;
      const limit = Math.PI / 2 - 0.01;
      e2.x = Math.max(-limit, Math.min(limit, e2.x));
      camera.quaternion.setFromEuler(e2);
    };

    const onClick = () => {
      if (useAppStore.getState().inspectorOpen) return;
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    };

    const onLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      useAppStore.getState().setPointerLocked(locked);
      if (locked) {
        euler.current.setFromQuaternion(camera.quaternion);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  }, [gl, camera]);

  useEffect(
    () =>
      useAppStore.subscribe((state, prev) => {
        if (state.inspectorOpen && !prev.inspectorOpen && document.pointerLockElement === gl.domElement) {
          document.exitPointerLock();
        }
      }),
    [gl]
  );

  return null;
}
