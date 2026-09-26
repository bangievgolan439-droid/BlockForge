export type BooleanOp = 'union' | 'difference' | 'intersection';
export type Vec3 = [number, number, number];

export interface SerializedMesh {
  positions: Float32Array;
  indices: Uint32Array;
}

interface WorkerResponse {
  id: number;
  ok: boolean;
  result?: SerializedMesh;
  error?: string;
}

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (mesh: SerializedMesh) => void; reject: (err: Error) => void }>();

function ensureWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL('./geometry.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const { id, ok, result, error } = event.data;
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    if (ok && result) entry.resolve(result);
    else entry.reject(new Error(error ?? 'Geometry worker failed'));
  };
  worker.onerror = (event) => {
    for (const [, entry] of pending) entry.reject(new Error(event.message));
    pending.clear();
  };

  return worker;
}

/** Runs a watertight box boolean off the main thread via Manifold3D (WASM). */
export function runBoxBoolean(op: BooleanOp, sizeA: Vec3, centerA: Vec3, sizeB: Vec3, centerB: Vec3): Promise<SerializedMesh> {
  const w = ensureWorker();
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, op, sizeA, centerA, sizeB, centerB });
  });
}
