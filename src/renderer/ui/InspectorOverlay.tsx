import { useAppStore } from '../state/appStore';
import Outliner from './InspectorPanel/Outliner';
import PropertiesPanel from './InspectorPanel/PropertiesPanel';
import Modifiers from './InspectorPanel/Modifiers';
import MaterialEditor from './InspectorPanel/MaterialEditor';
import PrefabPanel from './InspectorPanel/PrefabPanel';
import ToolModeBar from './InspectorPanel/ToolModeBar';

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

      <div
        className={`fixed left-72 top-1/2 -translate-y-1/2 pl-3 transition-transform duration-300 ease-out ${
          inspectorOpen ? 'translate-x-0' : '-translate-x-[calc(100%+18rem)]'
        }`}
      >
        <ToolModeBar />
      </div>

      <aside
        className={`glass-panel pointer-events-auto fixed right-0 top-0 flex h-full w-80 flex-col gap-6 overflow-y-auto p-4 transition-transform duration-300 ease-out ${
          inspectorOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <PropertiesPanel />
        <div className="h-px bg-white/10" />
        <Modifiers />
        <div className="h-px bg-white/10" />
        <MaterialEditor />
      </aside>
    </>
  );
}
