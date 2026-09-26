export default function Crosshair() {
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
      <div className="relative h-5 w-5">
        <span className="absolute left-1/2 top-1/2 h-0.5 w-3.5 -translate-x-1/2 -translate-y-1/2 bg-white/85 shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
        <span className="absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-white/85 shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
      </div>
    </div>
  );
}
