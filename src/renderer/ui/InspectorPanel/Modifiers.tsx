import { useState } from 'react';
import { runBoxBoolean, type BooleanOp } from '../../workers/geometryClient';
import { useCsgStore } from '../../state/csgStore';

const OPS: { op: BooleanOp; label: string }[] = [
  { op: 'union', label: 'Union' },
  { op: 'difference', label: 'Subtract' },
  { op: 'intersection', label: 'Intersect' }
];

export default function Modifiers() {
  const busy = useCsgStore((s) => s.busy);
  const error = useCsgStore((s) => s.error);
  const preview = useCsgStore((s) => s.preview);
  const [overlap, setOverlap] = useState(0.5);

  const run = async (op: BooleanOp) => {
    useCsgStore.getState().setBusy(true);
    try {
      const result = await runBoxBoolean(op, [1.2, 1.2, 1.2], [-overlap / 2, 0, 0], [1.2, 1.2, 1.2], [overlap / 2, 0, 0]);
      useCsgStore.getState().setPreview(result);
    } catch (err) {
      useCsgStore.getState().setError(err instanceof Error ? err.message : String(err));
    } finally {
      useCsgStore.getState().setBusy(false);
    }
  };

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Modifiers</h3>
      <p className="mb-3 text-[11px] text-white/40">
        CSG prototype: booleans run watertight via Manifold3D (WASM) on a Web Worker, off the main thread. The
        result renders as a preview mesh floating above the world.
      </p>

      <label className="mb-2 block text-xs text-white/60">
        Box overlap: {overlap.toFixed(2)}
        <input
          type="range"
          min={-0.5}
          max={1.5}
          step={0.05}
          value={overlap}
          onChange={(e) => setOverlap(Number(e.target.value))}
          className="mt-1 w-full accent-forge-accent"
        />
      </label>

      <div className="flex gap-2">
        {OPS.map(({ op, label }) => (
          <button
            key={op}
            onClick={() => run(op)}
            disabled={busy}
            className="flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            {label}
          </button>
        ))}
      </div>

      {busy && <p className="mt-2 text-xs text-forge-accent">Computing…</p>}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {preview && !busy && (
        <p className="mt-2 text-xs text-white/50">
          {preview.positions.length / 3} verts · {preview.indices.length / 3} tris
        </p>
      )}
    </section>
  );
}
