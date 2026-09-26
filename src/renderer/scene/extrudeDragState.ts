import type { QuadFace } from '../geometry/quadMesh';

export interface ExtrudeDrag {
  objectId: string;
  faceId: string;
  preDragFaces: QuadFace[];
  preDragMaterials: string[];
  startClientY: number;
}

export const extrudeDragRef: { current: ExtrudeDrag | null } = { current: null };
