import * as THREE from 'three';

const cache = new Map<string, THREE.Texture>();

function hash2(x: number, y: number, seed: number): number {
  const v = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return v - Math.floor(v);
}

/**
 * Procedurally generates a tileable noise texture per block type at runtime.
 * Avoids bundling any external art assets (keeps the project 100% self-contained / license-clean).
 */
export function getBlockTexture(id: number, colorHex: string): THREE.Texture {
  const cacheKey = `${id}:${colorHex}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');

  const base = new THREE.Color(colorHex);
  const image = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = hash2(x, y, id);
      const shade = 0.82 + n * 0.32;
      const i = (y * size + x) * 4;
      image.data[i] = Math.min(255, Math.round(base.r * 255 * shade));
      image.data[i + 1] = Math.min(255, Math.round(base.g * 255 * shade));
      image.data[i + 2] = Math.min(255, Math.round(base.b * 255 * shade));
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.SRGBColorSpace;

  cache.set(cacheKey, texture);
  return texture;
}
