import { useSceneStore } from '../../state/sceneStore';
import { useCsgStore } from '../../state/csgStore';
import { objectToWorldTriangleSoup } from '../../geometry/worldMesh';
import { runMeshBoolean, type BooleanOp } from '../../workers/geometryClient';

const OPS: { op: BooleanOp; label: string }[] = [
  { op: 'union', label: 'Union' },
  { op: 'difference', label: 'Subtract' },
  { op: 'intersection', label: 'Intersect' }
];

export default function Modifiers() {
  const selection = useSceneStore((s) => s.selection);
  const objects = useSceneStore((s) => s.objects);
  const busy = useCsgStore((s) => s.busy);
  const error = useCsgStore((s) => s.error);
  const preview = useCsgStore((s) => s.preview);

  const [idA, idB] = selection;
  const objA = idA ? objects[idA] : null;
  const objB = idB ? objects[idB] : null;
  const ready = selection.length === 2 && objA && objB;

  const run = async (op: BooleanOp) => {
    if (!objA || !objB) return;
    useCsgStore.getState().setBusy(true);
    try {
      const a = objectToWorldTriangleSoup(objA);
      const b = objectToWorldTriangleSoup(objB);
      const result = await runMeshBoolean(op, a, b);
      useCsgStore.getState().setPreview(result);
    } catch (err) {
      useCsgStore.getState().setError(err instanceof Error ? err.message : String(err));
    } finally {
      useCsgStore.getState().setBusy(false);
    }
  };

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Boolean Modifier</h3>
      <p className="mb-3 text-[11px] text-white/40">
        Runs a real watertight boolean (Manifold3D, off the main thread) on the two selected objects' actual
        geometry — not a demo. Result renders as a preview mesh at the correct world position.
      </p>

      {!ready ? (
        <p className="text-xs text-white/40">Select exactly two objects to enable a boolean.</p>
      ) : (
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
      )}

      {busy && <p className="mt-2 text-xs text-forge-accent">Computing…</p>}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {preview && !busy && (
        <p className="mt-2 text-xs text-white/50">
          {preview.positions.length / 3} verts · {preview.indices.length / 3} tris — preview only, not yet
          insertable back as an editable object (see ROADMAP.md).
        </p>
      )}
    </section>
  );
}
