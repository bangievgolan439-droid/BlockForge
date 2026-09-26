import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../state/appStore';
import { isKeyPressed } from './keyboard';

const BUILD_SPEED = 6;
const BUILD_VERTICAL_SPEED = 4;
const SPRINT_MULTIPLIER = 1.6;
const UP = new THREE.Vector3(0, 1, 0);

/**
 * There is no ground in this world — it's a void the player builds into. Build mode
 * therefore has no gravity/floor collision, just level flight (WASD is horizontal-only,
 * relative to look yaw; Space/Shift move straight up/down). Spectator mode additionally
 * follows the camera's full look direction (including pitch), for fast free-roam.
 */
export default function MovementController() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.6, 6);
  }, [camera]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (useAppStore.getState().movementMode !== 'spectator') return;
      useAppStore.getState().adjustSpectatorSpeed(e.deltaY);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const { movementMode, inspectorOpen, pointerLocked, spectatorSpeed } = useAppStore.getState();
    if (inspectorOpen || !pointerLocked) return;

    if (movementMode === 'spectator') {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

      const move = new THREE.Vector3();
      if (isKeyPressed('KeyW')) move.add(forward);
      if (isKeyPressed('KeyS')) move.sub(forward);
      if (isKeyPressed('KeyD')) move.add(right);
      if (isKeyPressed('KeyA')) move.sub(right);
      if (isKeyPressed('Space')) move.y += 1;
      if (isKeyPressed('ShiftLeft') || isKeyPressed('ShiftRight')) move.y -= 1;
      if (move.lengthSq() > 0) move.normalize();

      camera.position.addScaledVector(move, spectatorSpeed * dt);
      return;
    }

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, UP).normalize();

    const move = new THREE.Vector3();
    if (isKeyPressed('KeyW')) move.add(forward);
    if (isKeyPressed('KeyS')) move.sub(forward);
    if (isKeyPressed('KeyD')) move.add(right);
    if (isKeyPressed('KeyA')) move.sub(right);
    if (move.lengthSq() > 0) move.normalize();

    const sprinting = isKeyPressed('ShiftLeft') || isKeyPressed('ShiftRight');
    const speed = BUILD_SPEED * (sprinting ? SPRINT_MULTIPLIER : 1);
    camera.position.addScaledVector(move, speed * dt);

    if (isKeyPressed('Space')) camera.position.y += BUILD_VERTICAL_SPEED * dt;
    if (isKeyPressed('ControlLeft') || isKeyPressed('ControlRight')) camera.position.y -= BUILD_VERTICAL_SPEED * dt;
  });

  return null;
}
