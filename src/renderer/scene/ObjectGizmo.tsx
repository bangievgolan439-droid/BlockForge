import { useEffect, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import type * as THREE from 'three';
import { useAppStore } from '../state/appStore';
import { useSceneStore } from '../state/sceneStore';
import { objectMeshRegistry } from './objectRegistry';

const GIZMO_MODES = new Set(['move', 'rotate', 'scale']);

export default function ObjectGizmo() {
  const selection = useSceneStore((s) => s.selection);
  const toolMode = useAppStore((s) => s.toolMode);
  const [target, setTarget] = useState<THREE.Object3D | null>(null);

  const activeId = selection.length === 1 ? selection[0]! : null;

  useEffect(() => {
    if (!activeId) {
      setTarget(null);
      return;
    }
    setTarget(objectMeshRegistry.get(activeId) ?? null);
  }, [activeId]);

  if (!target || !activeId || !GIZMO_MODES.has(toolMode)) return null;

  const mode = toolMode === 'move' ? 'translate' : toolMode === 'rotate' ? 'rotate' : 'scale';

  const commit = () => {
    useSceneStore.getState().setTransform(activeId, {
      position: [target.position.x, target.position.y, target.position.z],
      rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
      scale: [target.scale.x, target.scale.y, target.scale.z]
    });
  };

  return <TransformControls object={target} mode={mode} space="local" onObjectChange={commit} />;
}
