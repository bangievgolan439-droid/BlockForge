import { useAppStore } from '../state/appStore';
import Outliner from './InspectorPanel/Outliner';
import Modifiers from './InspectorPanel/Modifiers';
import MaterialEditor from './InspectorPanel/MaterialEditor';
import PrefabPanel from './InspectorPanel/PrefabPanel';

export default function InspectorOverlay() {
  const inspectorOpen = useAppStore((s) => s.inspectorOpen);

  return (
    <>
      <aside
        className={`glass-panel pointer-events-auto fixed left-0 top-0 h-full w-72 overflow-y-auto p-4 transition-transform duration-300 ease-out ${
          inspectorOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Outliner />
        <div className="my-4 h-px bg-white/10" />
        <PrefabPanel />
      </aside>

      <aside
        className={`glass-panel pointer-events-auto fixed right-0 top-0 flex h-full w-80 flex-col gap-6 overflow-y-auto p-4 transition-transform duration-300 ease-out ${
          inspectorOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Modifiers />
        <div className="h-px bg-white/10" />
        <MaterialEditor />
      </aside>
    </>
  );
}
