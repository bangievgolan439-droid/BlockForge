import { useSceneStore } from '../../state/sceneStore';
import type { Vec3 } from '../../geometry/vec3';

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

export default function PropertiesPanel() {
  const selection = useSceneStore((s) => s.selection);
  const objects = useSceneStore((s) => s.objects);
  const setTransform = useSceneStore((s) => s.setTransform);

  const activeId = selection.length === 1 ? selection[0]! : null;
  const object = activeId ? objects[activeId] : null;

  if (!object) {
    return (
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Properties</h3>
        <p className="text-xs text-white/40">Select a single object to edit its transform.</p>
      </section>
    );
  }

  const updateVec = (key: 'position' | 'rotation' | 'scale', axis: 0 | 1 | 2, raw: number) => {
    const value = key === 'rotation' ? raw * DEG_TO_RAD : raw;
    const next = [...object[key]] as Vec3;
    next[axis] = value;
    setTransform(object.id, { [key]: next });
  };

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Properties</h3>
      <p className="mb-3 truncate text-sm font-medium text-white/85">{object.name}</p>

      <VectorField label="Position" values={object.position} onChange={(axis, v) => updateVec('position', axis, v)} step={0.1} />
      <VectorField
        label="Rotation"
        values={object.rotation.map((r) => r * RAD_TO_DEG) as Vec3}
        onChange={(axis, v) => updateVec('rotation', axis, v)}
        step={1}
        suffix="°"
      />
      <VectorField label="Scale" values={object.scale} onChange={(axis, v) => updateVec('scale', axis, v)} step={0.05} min={0.05} />
    </section>
  );
}

function VectorField({
  label,
  values,
  onChange,
  step,
  suffix,
  min
}: {
  label: string;
  values: Vec3;
  onChange: (axis: 0 | 1 | 2, value: number) => void;
  step: number;
  suffix?: string;
  min?: number;
}) {
  const axisLabels = ['X', 'Y', 'Z'] as const;
  return (
    <div className="mb-3">
      <div className="mb-1 text-[11px] font-medium text-white/50">{label}</div>
      <div className="grid grid-cols-3 gap-1.5">
        {axisLabels.map((axisLabel, i) => (
          <label key={axisLabel} className="flex items-center rounded-md border border-white/10 bg-black/30 px-1.5">
            <span className="mr-1 text-[10px] text-white/40">{axisLabel}</span>
            <input
              type="number"
              step={step}
              min={min}
              value={Number(values[i as 0 | 1 | 2].toFixed(3))}
              onChange={(e) => onChange(i as 0 | 1 | 2, Number(e.target.value))}
              className="w-full min-w-0 bg-transparent py-1 text-xs text-white/85 outline-none"
            />
            {suffix && <span className="text-[10px] text-white/30">{suffix}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}
