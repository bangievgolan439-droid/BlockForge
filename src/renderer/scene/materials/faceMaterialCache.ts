import * as THREE from 'three';
import { getBlockTexture } from '../textures';
import { TriplanarMaterialImpl, type TriplanarMaterialInstance } from './TriplanarMaterial';

const cache = new Map<string, TriplanarMaterialInstance>();

function hashColor(color: string): number {
  let h = 0;
  for (let i = 0; i < color.length; i++) h = (h * 31 + color.charCodeAt(i)) | 0;
  return h >>> 0;
}

/** One triplanar material per distinct color, shared across every face/object using it. */
export function getFaceMaterial(color: string): TriplanarMaterialInstance {
  const cached = cache.get(color);
  if (cached) return cached;

  const material = new TriplanarMaterialImpl() as TriplanarMaterialInstance;
  material.map = getBlockTexture(hashColor(color), color);
  material.scale = 0.5;
  cache.set(color, material);
  return material;
}

export function faceMaterialArray(colors: string[]): THREE.Material[] {
  return colors.map(getFaceMaterial);
}
