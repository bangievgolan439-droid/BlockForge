import { useAppStore } from '../../state/appStore';
import { PALETTE } from '../../state/palette';

export default function MaterialEditor() {
  const activeColor = useAppStore((s) => s.activeColor);
  const setActiveColor = useAppStore((s) => s.setActiveColor);
  const toolMode = useAppStore((s) => s.toolMode);
  const setToolMode = useAppStore((s) => s.setToolMode);

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Material</h3>

      <div className="mb-3 grid grid-cols-9 gap-1">
        {PALETTE.map((p) => (
          <button
            key={p.id}
            title={p.name}
            onClick={() => setActiveColor(p.color)}
            className={`aspect-square rounded-sm border transition-transform ${
              activeColor === p.color ? 'scale-110 border-forge-accent' : 'border-black/30 hover:scale-105'
            }`}
            style={{ backgroundColor: p.color }}
          />
        ))}
      </div>

      <label className="mb-3 flex items-center justify-between text-xs text-white/60">
        Custom color
        <input
          type="color"
          value={activeColor}
          onChange={(e) => setActiveColor(e.target.value)}
          className="h-7 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
        />
      </label>

      {toolMode !== 'paint' ? (
        <button
          onClick={() => setToolMode('paint')}
          className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
        >
          Activate Paint tool (P)
        </button>
      ) : (
        <p className="text-[11px] text-forge-accent">Paint active — click any face to apply this color.</p>
      )}

      <p className="mt-3 text-[11px] text-white/40">
        This color is also what the next spawned object (right-click in Build mode) uses.
      </p>
    </section>
  );
}
