# BlockForge

An FPS-style block builder (Minecraft-like) with a continuous-mesh modeling layer (Blender-like) bolted on, built as a desktop app.

## Stack

- **Shell:** Electron (contextIsolation on, sandboxed preload, no Node in the renderer)
- **UI:** React + TypeScript (strict) + Tailwind CSS
- **State:** Zustand (`appStore` for mode/UI state, `worldStore` for the voxel grid, `materialStore` for live material edits, `csgStore` for the CSG preview)
- **3D:** Three.js via `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` (SSAO)
- **Physics:** Rapier via `@react-three/rapier`
- **CSG:** Manifold3D (WASM), run in a dedicated Web Worker
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
| `WASD` + mouse (click to lock pointer) | Move / look, Build mode |
| `1`–`9` | Select hotbar block type |
| Left click | Break the targeted block |
| Right click | Place the selected block on the targeted face |
| `Tab` | Toggle Inspector mode (mouse unlocks, glass panels slide in) |
| `V` | Toggle Spectator mode (noclip fly; scroll wheel = speed) |
| `Enter` | Toggle Physics Sandbox (real gravity on the world; reverts on exit) |
| Shift-click a block (Inspector) | Add/remove it from the selection |
| `Ctrl+G` (Inspector) | Group the current selection |
| Arrow keys / `PageUp` / `PageDown` (Inspector) | Nudge the selection by one block |

> The spec that inspired this paired the Inspector toggle with both `Tab` and `A` — but `A` is also the Build-mode strafe-left key, so binding both would make it impossible to strafe left. Only `Tab` is wired up; see `ROADMAP.md`.

## What's actually implemented vs. scaffolded

This is a first, real milestone — not the full spec at production depth. Genuinely working:

- The Build / Inspector / Spectator / Physics Sandbox mode state machine, with correct pointer-lock handling per mode.
- A voxel world (`InstancedMesh` per block type) with placement/removal, gravity + step-collision walking, and noclip flight.
- A hand-written triplanar `ShaderMaterial` (world-space UVs blended by face normal) driving procedurally-generated block textures — stretching or shearing a face never smears the texture, which also makes it reusable once real continuous meshes exist.
- SSAO postprocessing.
- Physics Sandbox: the world is handed to Rapier as instanced rigid bodies (the lowest existing layer stays fixed as "bedrock" so the ground doesn't just vanish); the store is never mutated while it's active, so exiting reverts cleanly for free.
- Grouping, multi-select, arrow-key nudging, and named prefabs (saved to disk via IPC, reloadable into the world).
- A working Manifold3D CSG pipeline: boolean union/subtract/intersect on two boxes, computed off the main thread in a Web Worker, rendered live as a preview mesh. This proves the WASM-in-Electron-in-a-worker pipeline end to end; it is not yet wired to arbitrary selections.
- Live Material Editor: color and triplanar tiling per block type, applied instantly to every placed block of that type.

Scaffolded / intentionally out of scope for this pass — see `ROADMAP.md` for the reasoning and next steps: the per-face texture-paint canvas, a real Community Workshop backend, and running CSG ops against arbitrary in-world selections rather than the two-box demo.

## Project layout

```
electron/           Main process + sandboxed preload (IPC bridge for prefab file I/O)
src/renderer/
  state/             Zustand stores
  scene/             Three.js/R3F components (world, controllers, materials, physics)
  ui/                DOM overlay (HUD, hotbar, Inspector panels)
  workers/            Manifold3D CSG worker + typed client
```
