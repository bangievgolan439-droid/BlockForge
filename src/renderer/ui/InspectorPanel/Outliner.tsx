import { useWorldStore } from '../../state/worldStore';
import { useAppStore } from '../../state/appStore';

export default function Outliner() {
  const groups = useWorldStore((s) => s.groups);
  const blockCount = useWorldStore((s) => Object.keys(s.blocks).length);
  const selection = useAppStore((s) => s.selection);
  const setSelection = useAppStore((s) => s.setSelection);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const ungroup = useWorldStore((s) => s.ungroup);

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Outliner</h3>
      <div className="mb-3 flex items-center justify-between text-xs text-white/60">
        <span>
          {blockCount} blocks · {selection.length} selected
        </span>
        {selection.length > 0 && (
          <button onClick={clearSelection} className="text-white/40 hover:text-white/70">
            Clear
          </button>
        )}
      </div>

      <p className="mb-2 text-[11px] text-white/40">
        Shift-click a block to add to selection. Ctrl+G to group. Arrow keys / PageUp / PageDown nudge the
        selection.
      </p>

      <ul className="space-y-1">
        {Object.values(groups).map((group) => (
          <li
            key={group.id}
            className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1.5 text-sm"
          >
            <button
              className="truncate text-left text-white/85 hover:text-forge-accent"
              onClick={() => setSelection(group.blockKeys)}
            >
              {group.name} <span className="text-white/40">({group.blockKeys.length})</span>
            </button>
            <button
              className="ml-2 shrink-0 text-white/40 hover:text-red-400"
              onClick={() => ungroup(group.id)}
              title="Ungroup"
            >
              ✕
            </button>
          </li>
        ))}
        {Object.keys(groups).length === 0 && (
          <li className="text-xs text-white/40">No groups yet. Select blocks and press Ctrl+G.</li>
        )}
      </ul>
    </section>
  );
}
