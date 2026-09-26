# BlockForge

A continuous-mesh modeling tool with an FPS-style navigation layer — closer to Blender-in-first-person than
Minecraft. You spawn into an empty void and build by placing, extruding, and painting free-floating mesh objects.

## Stack

- **Shell:** Electron (contextIsolation on, sandboxed preload, no Node in the renderer)
- **UI:** React + TypeScript (strict) + Tailwind CSS
- **State:** Zustand (`appStore` for mode/tool/UI state, `sceneStore` for scene objects, `csgStore` for the CSG
  preview)
- **3D:** Three.js via `@react-three/fiber`, `@react-three/drei` (TransformControls), `@react-three/postprocessing`
  (SSAO)
- **Physics:** Rapier via `@react-three/rapier`
- **CSG:** Manifold3D (WASM), run in a dedicated Web Worker, operating on real selected objects' geometry
- **Build tooling:** `electron-vite` (Vite for main/preload/renderer)

## Running it

```bash
npm install
npm run dev       # Electron + Vite dev server, hot reload
npm run typecheck # tsc --noEmit
npm run build      # production build to out/
npm run package     # build + electron-builder (installer)
```

## Controls

| Input | Effect |
| --- | --- |
| `WASD` + mouse (click to lock pointer) | Move / look, Build mode. No gravity — it's a void, not ground you stand on. |
| `Space` / `Ctrl` | Up / down (Build mode) |
| `1`–`9` | Pick the active color (used for both spawning and painting) |
| Left click | Delete the targeted object |
| Right click | Spawn a box — attached to the targeted face, or floating in front of you if aimed at nothing |
| `Tab` | Toggle Inspector mode (mouse unlocks, Blender-style glass panels slide in) |
| `V` | Toggle Spectator mode (noclip fly; scroll wheel = speed) |
| `Enter` | Toggle Physics Sandbox (everything becomes a real rigid body; reverts on exit) |
| `Q` / `G` / `R` / `S` / `E` / `P` (Inspector) | Select / Move / Rotate / Scale / Extrude / Paint tool |
| Click an object (Inspector, Select tool) | Select it — Shift-click to add to selection |
| Click + drag a face (Extrude tool) | Extrude that face along its normal |
| Click a face (Paint tool) | Apply the active color to just that face |
| `Ctrl+G` / `Delete` (Inspector) | Group selection / delete selection |
| Arrow keys / `PageUp` / `PageDown` (Inspector) | Nudge the selection by one unit |

> The spec that inspired this paired the Inspector toggle with both `Tab` and `A` — but `A` is also the Build-mode
> strafe-left key, so binding both would make it impossible to strafe left. Only `Tab` is wired up; see
> `ROADMAP.md`.

## Architecture: quad-face objects, not voxels

Each scene object (`src/renderer/state/sceneStore.ts`) owns a small list of quad faces
(`src/renderer/geometry/quadMesh.ts`), each with its **own** 4 corner vertices — faces never share vertices with
their neighbors, even where they're positionally coincident. That's what makes extrude safe: pushing one face's
4 vertices outward and stitching 4 new side walls can never distort a neighboring face, and it's what gives every
face an independent material slot for per-face painting (`THREE.BufferGeometry` groups, one material per face).
Object-level transform (position/rotation/scale) is kept separate from this local face data, exactly like
Blender's object-mode vs. edit-mode split, so `TransformControls` can move a whole object without touching its
mesh.

## What's actually implemented vs. scaffolded

Genuinely working, not stubbed:

- The Build / Inspector / Spectator / Physics Sandbox mode state machine.
- Free placement: right-click attaches a new box to whatever face you're aiming at (or floats one in front of you
  in open void); left-click deletes the targeted object. Nothing is grid-snapped.
- Real extrude: drag a face in the Extrude tool to push it out (or pull it in), rebuilding that object's geometry
  live. Verified end-to-end, not just wired up.
- Real per-face painting: the Paint tool assigns the active color to exactly the face you click, independent of
  every other face on that object.
- A working `TransformControls` gizmo (Move/Rotate/Scale) on the selected object, Blender-keyed (G/R/S).
- A real Manifold3D boolean modifier: Union/Subtract/Intersect run against the two selected objects' **actual**
  world-space geometry (via a Web Worker), not a canned demo. Verified to produce a real merged mesh.
- Physics Sandbox: every object becomes a real dynamic rigid body (convex hull collider) — there's no ground, so
  toggling physics means everything genuinely falls. The scene store is never mutated while it's active, so
  exiting reverts for free.
- A hand-written triplanar `ShaderMaterial` for the void's spatial reference grid and general shading groundwork
  (kept in the codebase; current object faces use flat colors — see ROADMAP.md).
- Grouping, multi-select, arrow-key nudging, and named prefabs (saved to disk via IPC, reloadable into the
  scene).

Scaffolded / intentionally out of scope for this pass — see `ROADMAP.md`: inserting a CSG boolean result back
into the scene as an editable object (currently preview-only), a per-face texture-paint canvas (pixels/decals,
not just flat color), and a real Community Workshop backend.

## Project layout

```
electron/           Main process + sandboxed preload (IPC bridge for prefab file I/O)
src/renderer/
  state/             Zustand stores (appStore, sceneStore, csgStore, palette)
  geometry/          Pure geometry helpers: quad-face mesh, extrude, world-space flattening for CSG
  scene/             Three.js/R3F components (object rendering, controllers, materials, physics, gizmo, CSG)
  ui/                DOM overlay (HUD, hotbar, Blender-style Inspector panels)
  workers/            Manifold3D CSG worker + typed client
```
