import { useAppStore, type ToolMode } from '../../state/appStore';

const TOOLS: { mode: ToolMode; label: string; hint: string }[] = [
  { mode: 'select', label: 'Select', hint: 'Q' },
  { mode: 'move', label: 'Move', hint: 'G' },
  { mode: 'rotate', label: 'Rotate', hint: 'R' },
  { mode: 'scale', label: 'Scale', hint: 'S' },
  { mode: 'extrude', label: 'Extrude', hint: 'E' },
  { mode: 'paint', label: 'Paint', hint: 'P' }
];

export default function ToolModeBar() {
  const toolMode = useAppStore((s) => s.toolMode);
  const setToolMode = useAppStore((s) => s.setToolMode);

  return (
    <div className="glass-panel pointer-events-auto flex flex-col gap-1 rounded-xl p-1.5">
      {TOOLS.map((tool) => {
        const active = toolMode === tool.mode;
        return (
          <button
            key={tool.mode}
            onClick={() => setToolMode(tool.mode)}
            title={`${tool.label} (${tool.hint})`}
            className={`flex w-11 flex-col items-center rounded-lg border px-1 py-1.5 text-[10px] transition-colors ${
              active
                ? 'border-forge-accent bg-white/10 text-forge-accent'
                : 'border-white/10 bg-black/20 text-white/60 hover:bg-white/5'
            }`}
          >
            <span className="text-[13px] font-semibold">{tool.hint}</span>
            <span className="mt-0.5 leading-none">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
