import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../state/appStore';
import { useWorldStore } from '../state/worldStore';
import { isKeyPressed } from './keyboard';

const GRAVITY = -28;
const JUMP_SPEED = 9;
const WALK_SPEED = 6;
const SPRINT_MULTIPLIER = 1.6;
const PLAYER_EYE_HEIGHT = 1.6;
const STEP_TOLERANCE = 1.05;
const UP = new THREE.Vector3(0, 1, 0);

export default function MovementController() {
  const { camera } = useThree();
  const velocityY = useRef(0);
  const grounded = useRef(false);

  useEffect(() => {
    camera.position.set(0, 1 + PLAYER_EYE_HEIGHT, 6);
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

    // Build mode: horizontal-only walk direction, gravity + simple step-blocking collision.
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
    const speed = WALK_SPEED * (sprinting ? SPRINT_MULTIPLIER : 1);

    const feetY = camera.position.y - PLAYER_EYE_HEIGHT;
    const heightAt = useWorldStore.getState().heightAt;

    const canStandAt = (x: number, z: number) => {
      const top = heightAt(Math.round(x), Math.round(z));
      return top === -Infinity || top <= feetY + STEP_TOLERANCE;
    };

    const nextX = camera.position.x + move.x * speed * dt;
    const nextZ = camera.position.z + move.z * speed * dt;
    if (canStandAt(nextX, camera.position.z)) camera.position.x = nextX;
    if (canStandAt(camera.position.x, nextZ)) camera.position.z = nextZ;

    if (isKeyPressed('Space') && grounded.current) {
      velocityY.current = JUMP_SPEED;
      grounded.current = false;
    }

    velocityY.current += GRAVITY * dt;
    const groundTop = heightAt(Math.round(camera.position.x), Math.round(camera.position.z));
    const groundEyeY = (groundTop === -Infinity ? -40 : groundTop + 1) + PLAYER_EYE_HEIGHT;

    let nextY = camera.position.y + velocityY.current * dt;
    if (nextY <= groundEyeY) {
      nextY = groundEyeY;
      velocityY.current = 0;
      grounded.current = true;
    } else {
      grounded.current = false;
    }
    camera.position.y = nextY;
  });

  return null;
}
