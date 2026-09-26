import { useEffect } from 'react';
import { useSceneStore } from '../state/sceneStore';
import { extrudeDragRef } from './extrudeDragState';

const EXTRUDE_SENSITIVITY = 0.01;

/**
 * Drives the drag-to-extrude interaction. A face's pointerdown (in SceneObjects.tsx)
 * snapshots the object's pre-drag geometry into extrudeDragRef; from then on this
 * component resets to that snapshot and re-extrudes by the live cumulative delta on
 * every mousemove, so dragging feels continuous instead of compounding each frame.
 */
export default function EditToolsController() {
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const drag = extrudeDragRef.current;
      if (!drag) return;
      const distance = (drag.startClientY - event.clientY) * EXTRUDE_SENSITIVITY;
      const scene = useSceneStore.getState();
      scene.replaceObject(drag.objectId, { faces: drag.preDragFaces, materials: drag.preDragMaterials });
      scene.extrude(drag.objectId, drag.faceId, distance);
    };

    const onUp = () => {
      extrudeDragRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return null;
}
