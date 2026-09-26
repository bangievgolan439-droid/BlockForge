import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, SSAO } from '@react-three/postprocessing';
import { useAppStore } from '../state/appStore';
import VoxelWorld from './VoxelWorld';
import PhysicsSandbox from './PhysicsSandbox';
import MovementController from './MovementController';
import PointerLockManager from './PointerLockManager';
import BuildInteraction from './BuildInteraction';
import TargetHighlight from './TargetHighlight';
import SelectionHighlights from './SelectionHighlights';
import CsgPreview from './CsgPreview';
import PhysicsErrorBoundary from './PhysicsErrorBoundary';

export default function SceneRoot() {
  const physicsActive = useAppStore((s) => s.physicsActive);

  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.05, far: 500, position: [0, 2.6, 6] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0d1220']} />
      <fog attach="fog" args={['#0d1220', 40, 220]} />

      <hemisphereLight args={['#bcd7ff', '#26221c', 0.55]} />
      <directionalLight
        position={[30, 45, 20]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      <PointerLockManager />
      <MovementController />
      <BuildInteraction />

      <Suspense fallback={null}>
        {physicsActive ? (
          <PhysicsErrorBoundary fallback={<VoxelWorld />}>
            <PhysicsSandbox />
          </PhysicsErrorBoundary>
        ) : (
          <VoxelWorld />
        )}
      </Suspense>

      <TargetHighlight />
      <SelectionHighlights />
      <CsgPreview />

      <EffectComposer multisampling={0} enableNormalPass>
        <SSAO
          radius={0.35}
          intensity={25}
          luminanceInfluence={0.4}
          bias={0.02}
          worldDistanceThreshold={1}
          worldDistanceFalloff={1}
          worldProximityThreshold={6}
          worldProximityFalloff={1}
        />
      </EffectComposer>
    </Canvas>
  );
}
