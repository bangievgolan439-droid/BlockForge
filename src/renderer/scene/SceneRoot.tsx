import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, SSAO } from '@react-three/postprocessing';
import { useAppStore } from '../state/appStore';
import SceneObjects from './SceneObjects';
import PhysicsSandbox from './PhysicsSandbox';
import MovementController from './MovementController';
import PointerLockManager from './PointerLockManager';
import BuildInteraction from './BuildInteraction';
import TargetHighlight from './TargetHighlight';
import SelectionHighlights from './SelectionHighlights';
import CsgPreview from './CsgPreview';
import PhysicsErrorBoundary from './PhysicsErrorBoundary';
import ObjectGizmo from './ObjectGizmo';
import EditToolsController from './EditToolsController';

export default function SceneRoot() {
  const physicsActive = useAppStore((s) => s.physicsActive);

  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.05, far: 500, position: [0, 1.6, 6] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 60, 260]} />

      <hemisphereLight args={['#31405c', '#0a0b0f', 0.5]} />
      <directionalLight
        position={[30, 45, 20]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      {/* Purely visual spatial reference for the void — not solid, nothing rests on it. */}
      <gridHelper args={[400, 400, '#232838', '#161a24']} position={[0, 0, 0]} />

      <PointerLockManager />
      <MovementController />
      <BuildInteraction />
      <EditToolsController />

      <Suspense fallback={null}>
        {physicsActive ? (
          <PhysicsErrorBoundary fallback={<SceneObjects />}>
            <PhysicsSandbox />
          </PhysicsErrorBoundary>
        ) : (
          <SceneObjects />
        )}
      </Suspense>

      <TargetHighlight />
      <SelectionHighlights />
      <ObjectGizmo />
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
