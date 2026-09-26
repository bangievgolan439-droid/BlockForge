import SceneRoot from './scene/SceneRoot';
import Crosshair from './ui/Crosshair';
import Hotbar from './ui/Hotbar';
import ModeHUD from './ui/ModeHUD';
import InspectorOverlay from './ui/InspectorOverlay';
import GlobalHotkeys from './ui/GlobalHotkeys';
import { useAppStore } from './state/appStore';

export default function App() {
  const inspectorOpen = useAppStore((s) => s.inspectorOpen);

  return (
    <div className="relative h-screen w-screen bg-forge-950">
      <SceneRoot />
      <GlobalHotkeys />

      {!inspectorOpen && (
        <>
          <Crosshair />
          <Hotbar />
        </>
      )}

      <ModeHUD />
      <InspectorOverlay />
    </div>
  );
}
