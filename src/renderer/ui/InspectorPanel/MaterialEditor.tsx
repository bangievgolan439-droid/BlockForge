import { useState } from 'react';
import { BLOCK_TYPES } from '../../state/worldStore';
import { useMaterialStore } from '../../state/materialStore';

export default function MaterialEditor() {
  const [typeId, setTypeId] = useState(BLOCK_TYPES[0]!.id);
  const color = useMaterialStore((s) => s.resolvedColor(typeId));
  const scale = useMaterialStore((s) => s.resolvedScale(typeId));
  const setColorOverride = useMaterialStore((s) => s.setColorOverride);
  const setTriplanarScale = useMaterialStore((s) => s.setTriplanarScale);

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Material Editor</h3>

      <select
        value={typeId}
        onChange={(e) => setTypeId(Number(e.target.value))}
        className="mb-3 w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white/85"
      >
        {BLOCK_TYPES.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <label className="mb-3 flex items-center justify-between text-xs text-white/60">
        Base color
        <input
          type="color"
          value={color}
          onChange={(e) => setColorOverride(typeId, e.target.value)}
          className="h-7 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
        />
      </label>

      <label className="block text-xs text-white/60">
        Triplanar tiling: {scale.toFixed(2)}
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.05}
          value={scale}
          onChange={(e) => setTriplanarScale(typeId, Number(e.target.value))}
          className="mt-1 w-full accent-forge-accent"
        />
      </label>

      <p className="mt-3 text-[11px] text-white/40">
        Updates every placed block of this type instantly — the world-space triplanar shader means a stretched
        or sheared face never smears the texture.
      </p>
    </section>
  );
}
