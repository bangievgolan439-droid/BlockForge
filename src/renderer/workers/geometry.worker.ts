/// <reference lib="webworker" />
import Module, { type ManifoldToplevel } from 'manifold-3d';

export type BooleanOp = 'union' | 'difference' | 'intersection';
export type Vec3 = [number, number, number];

export interface SerializedMesh {
  positions: Float32Array;
  indices: Uint32Array;
}

interface RunRequest {
  id: number;
  op: BooleanOp;
  sizeA: Vec3;
  centerA: Vec3;
  sizeB: Vec3;
  centerB: Vec3;
}

interface RunResponse {
  id: number;
  ok: boolean;
  result?: SerializedMesh;
  error?: string;
}

let wasmPromise: Promise<ManifoldToplevel> | null = null;

async function getWasm(): Promise<ManifoldToplevel> {
  if (!wasmPromise) {
    wasmPromise = Module().then((wasm) => {
      wasm.setup();
      return wasm;
    });
  }
  return wasmPromise;
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, op, sizeA, centerA, sizeB, centerB } = event.data;

  try {
    const wasm = await getWasm();
    const { Manifold } = wasm;

    // Manifold.cube() is used (rather than a hand-built mesh) so the input
    // geometry is guaranteed watertight and correctly wound by construction.
    const a = Manifold.cube(sizeA, false).translate(centerA);
    const b = Manifold.cube(sizeB, false).translate(centerB);

    const result = op === 'union' ? a.add(b) : op === 'difference' ? a.subtract(b) : a.intersect(b);

    const outMesh = result.getMesh();
    const positions = new Float32Array(outMesh.vertProperties);
    const indices = new Uint32Array(outMesh.triVerts);

    a.delete();
    b.delete();
    result.delete();

    const response: RunResponse = { id, ok: true, result: { positions, indices } };
    (self as unknown as Worker).postMessage(response, [positions.buffer, indices.buffer]);
  } catch (err) {
    const response: RunResponse = { id, ok: false, error: err instanceof Error ? err.message : String(err) };
    (self as unknown as Worker).postMessage(response);
  }
};
