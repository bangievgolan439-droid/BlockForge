import { useAppStore } from '../state/appStore';

export default function ModeHUD() {
  const movementMode = useAppStore((s) => s.movementMode);
  const physicsActive = useAppStore((s) => s.physicsActive);
  const pointerLocked = useAppStore((s) => s.pointerLocked);
  const inspectorOpen = useAppStore((s) => s.inspectorOpen);
  const spectatorSpeed = useAppStore((s) => s.spectatorSpeed);

  const badges: string[] = [];
  if (movementMode === 'spectator') badges.push(`Spectator · ${spectatorSpeed.toFixed(0)} m/s`);
  if (physicsActive) badges.push('Physics Sandbox');

  return (
    <div className="pointer-events-none fixed left-4 top-4 flex flex-col gap-1.5">
      {badges.map((label) => (
        <span
          key={label}
          className="glass-panel rounded-full px-3 py-1 text-xs font-medium tracking-wide text-forge-accent"
        >
          {label}
        </span>
      ))}

      {!pointerLocked && !inspectorOpen && (
        <span className="glass-panel mt-1 rounded-lg px-3 py-1.5 text-xs text-white/70">
          Click to look around · Tab for Inspector · V for Spectator · Enter for Physics
        </span>
      )}
    </div>
  );
}
