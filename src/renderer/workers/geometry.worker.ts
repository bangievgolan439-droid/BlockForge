/// <reference lib="webworker" />
import Module, { type ManifoldToplevel } from 'manifold-3d';

export type BooleanOp = 'union' | 'difference' | 'intersection';

export interface SerializedMesh {
  positions: Float32Array;
  indices: Uint32Array;
}

interface RunRequest {
  id: number;
  op: BooleanOp;
  a: SerializedMesh;
  b: SerializedMesh;
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
  const { id, op, a, b } = event.data;

  try {
    const wasm = await getWasm();
    const { Manifold, Mesh } = wasm;

    // Our source meshes are flat-shaded (each face owns its own corner vertices, even
    // where they coincide with a neighbor's) — merge() welds those coincident positions
    // so the result is a proper watertight 2-manifold Manifold can operate on.
    const meshA = new Mesh({ numProp: 3, vertProperties: a.positions, triVerts: a.indices });
    meshA.merge();
    const meshB = new Mesh({ numProp: 3, vertProperties: b.positions, triVerts: b.indices });
    meshB.merge();

    const manifoldA = new Manifold(meshA);
    const manifoldB = new Manifold(meshB);

    const result =
      op === 'union' ? manifoldA.add(manifoldB) : op === 'difference' ? manifoldA.subtract(manifoldB) : manifoldA.intersect(manifoldB);

    const outMesh = result.getMesh();
    const positions = new Float32Array(outMesh.vertProperties);
    const indices = new Uint32Array(outMesh.triVerts);

    manifoldA.delete();
    manifoldB.delete();
    result.delete();

    const response: RunResponse = { id, ok: true, result: { positions, indices } };
    (self as unknown as Worker).postMessage(response, [positions.buffer, indices.buffer]);
  } catch (err) {
    const response: RunResponse = { id, ok: false, error: err instanceof Error ? err.message : String(err) };
    (self as unknown as Worker).postMessage(response);
  }
};
