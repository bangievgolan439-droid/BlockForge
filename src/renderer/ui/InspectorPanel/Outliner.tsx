import { useSceneStore } from '../../state/sceneStore';

export default function Outliner() {
  const objects = useSceneStore((s) => s.objects);
  const groups = useSceneStore((s) => s.groups);
  const selection = useSceneStore((s) => s.selection);
  const setSelection = useSceneStore((s) => s.setSelection);
  const toggleSelected = useSceneStore((s) => s.toggleSelected);
  const clearSelection = useSceneStore((s) => s.clearSelection);
  const deleteObject = useSceneStore((s) => s.deleteObject);
  const renameObject = useSceneStore((s) => s.renameObject);
  const ungroup = useSceneStore((s) => s.ungroup);

  const objectList = Object.values(objects);
  const groupedIds = new Set(Object.values(groups).flatMap((g) => g.objectIds));
  const ungroupedObjects = objectList.filter((o) => !groupedIds.has(o.id));

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Outliner</h3>
      <div className="mb-3 flex items-center justify-between text-xs text-white/60">
        <span>
          {objectList.length} object{objectList.length === 1 ? '' : 's'} · {selection.length} selected
        </span>
        {selection.length > 0 && (
          <button onClick={clearSelection} className="text-white/40 hover:text-white/70">
            Clear
          </button>
        )}
      </div>

      <p className="mb-2 text-[11px] text-white/40">
        Click an object to select · Shift-click to add · Ctrl+G to group · Delete to remove.
      </p>

      <ul className="max-h-64 space-y-1 overflow-y-auto">
        {Object.values(groups).map((group) => (
          <li key={group.id} className="rounded-md bg-white/[0.03] p-1.5">
            <div className="mb-1 flex items-center justify-between px-1">
              <button
                className="truncate text-left text-xs font-medium text-white/70 hover:text-forge-accent"
                onClick={() => setSelection(group.objectIds)}
              >
                📁 {group.name}
              </button>
              <button className="text-white/30 hover:text-red-400" onClick={() => ungroup(group.id)} title="Ungroup">
                ✕
              </button>
            </div>
            {group.objectIds.map((id) => {
              const obj = objects[id];
              if (!obj) return null;
              return (
                <ObjectRow
                  key={id}
                  name={obj.name}
                  selected={selection.includes(id)}
                  onClick={(additive) => toggleSelected(id, additive)}
                  onDelete={() => deleteObject(id)}
                  onRename={(name) => renameObject(id, name)}
                  indent
                />
              );
            })}
          </li>
        ))}

        {ungroupedObjects.map((obj) => (
          <ObjectRow
            key={obj.id}
            name={obj.name}
            selected={selection.includes(obj.id)}
            onClick={(additive) => toggleSelected(obj.id, additive)}
            onDelete={() => deleteObject(obj.id)}
            onRename={(name) => renameObject(obj.id, name)}
          />
        ))}

        {objectList.length === 0 && (
          <li className="text-xs text-white/40">Empty void. Right-click to spawn your first anchor object.</li>
        )}
      </ul>
    </section>
  );
}

function ObjectRow({
  name,
  selected,
  indent,
  onClick,
  onDelete,
  onRename
}: {
  name: string;
  selected: boolean;
  indent?: boolean;
  onClick: (additive: boolean) => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}) {
  return (
    <div
      className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
        selected ? 'bg-forge-accent/15 text-forge-accent' : 'bg-white/5 text-white/85 hover:bg-white/10'
      } ${indent ? 'ml-3' : ''}`}
    >
      <button
        className="min-w-0 flex-1 truncate text-left"
        onClick={(e) => onClick(e.shiftKey)}
        onDoubleClick={() => {
          const next = window.prompt('Rename object', name);
          if (next && next.trim()) onRename(next.trim());
        }}
      >
        {name}
      </button>
      <button
        className="ml-2 shrink-0 text-white/30 opacity-0 hover:text-red-400 group-hover:opacity-100"
        onClick={onDelete}
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}
