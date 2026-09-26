import { useAppStore } from '../state/appStore';
import { BLOCK_TYPES } from '../state/worldStore';

export default function Hotbar() {
  const hotbarIndex = useAppStore((s) => s.hotbarIndex);
  const setHotbarIndex = useAppStore((s) => s.setHotbarIndex);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center">
      <div className="glass-panel pointer-events-auto flex gap-1.5 rounded-xl p-1.5">
        {BLOCK_TYPES.map((block, i) => {
          const active = i === hotbarIndex;
          return (
            <button
              key={block.id}
              onClick={() => setHotbarIndex(i)}
              className={`relative flex h-12 w-12 flex-col items-center justify-center rounded-lg border transition-all ${
                active
                  ? 'border-forge-accent bg-white/10 shadow-[0_0_0_1px_rgba(94,234,212,0.6)]'
                  : 'border-white/10 bg-black/20 hover:bg-white/5'
              }`}
              title={block.name}
            >
              <span
                className="h-5 w-5 rounded-sm border border-black/30"
                style={{ backgroundColor: block.color }}
              />
              <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-forge-900/90 text-[10px] font-medium text-white/70">
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
