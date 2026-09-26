import { useEffect, useState } from 'react';
import { useSceneStore, type SerializedPrefab } from '../../state/sceneStore';

export default function PrefabPanel() {
  const selection = useSceneStore((s) => s.selection);
  const serializeSelection = useSceneStore((s) => s.serializeSelection);
  const loadObjects = useSceneStore((s) => s.loadObjects);

  const [name, setName] = useState('');
  const [prefabs, setPrefabs] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const bridgeAvailable = typeof window !== 'undefined' && Boolean(window.blockforge);

  const refresh = () => {
    if (!bridgeAvailable) return;
    window.blockforge.prefabs.list().then(setPrefabs).catch(() => setPrefabs([]));
  };

  useEffect(refresh, [bridgeAvailable]);

  const save = async () => {
    if (!bridgeAvailable) {
      setStatus('Prefab storage needs the Electron shell (not available in this preview).');
      return;
    }
    if (!name.trim()) {
      setStatus('Give the prefab a name first.');
      return;
    }
    const serialized = serializeSelection(selection);
    if (!serialized) {
      setStatus('Select at least one object first.');
      return;
    }
    try {
      await window.blockforge.prefabs.save(name.trim(), serialized);
      setStatus(`Saved "${name.trim()}".`);
      setName('');
      refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    }
  };

  const load = async (prefabName: string) => {
    if (!bridgeAvailable) return;
    try {
      const data = (await window.blockforge.prefabs.load(prefabName)) as SerializedPrefab;
      loadObjects(data.objects, [0, 2, 0]);
      setStatus(`Loaded "${prefabName}".`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Prefabs</h3>

      <div className="mb-2 flex gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Prefab name"
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white/85 placeholder:text-white/30"
        />
        <button
          onClick={save}
          className="shrink-0 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
        >
          Save
        </button>
      </div>

      <p className="mb-2 text-[11px] text-white/40">Saves the current selection ({selection.length} objects).</p>

      <ul className="mb-3 space-y-1">
        {prefabs.map((p) => (
          <li key={p} className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1.5 text-sm">
            <span className="truncate text-white/85">{p}</span>
            <button className="text-white/40 hover:text-forge-accent" onClick={() => load(p)}>
              Load
            </button>
          </li>
        ))}
        {prefabs.length === 0 && <li className="text-xs text-white/40">No saved prefabs yet.</li>}
      </ul>

      <button
        disabled
        title="Coming soon — shared prefab search/browse backend"
        className="w-full cursor-not-allowed rounded-md border border-white/5 bg-white/[0.02] px-2 py-1.5 text-xs text-white/30"
      >
        Browse Community Workshop (coming soon)
      </button>

      {status && <p className="mt-2 text-[11px] text-white/50">{status}</p>}
    </section>
  );
}
