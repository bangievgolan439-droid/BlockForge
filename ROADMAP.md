# Roadmap

Scope notes and what's next, in rough priority order.

## Near-term

- **Insert CSG results back into the scene.** The Boolean modifier computes a real merged/subtracted/intersected
  mesh from the two selected objects' actual geometry, but the result is currently preview-only (a plain
  triangle-soup `THREE.BufferGeometry`, not editable). Turning it into a real scene object needs either an
  extension to `SceneObject` that accepts arbitrary triangle meshes (not just quad faces), or a
  triangle-to-quad remeshing pass so the result stays extrude/paint-editable like everything else.
- **Per-face texture painting.** Faces currently take a flat color per material slot. A real 2D paint canvas
  (pixels, decals, uploaded images) needs per-face UVs and a texture atlas instead of a solid-color material —
  a bigger architecture change, deliberately deferred.
- **Community Workshop backend.** Prefab save/load/export already works locally (IPC → disk, via
  `window.blockforge.prefabs`). "Browse Community Workshop" in the Prefabs panel is a disabled stub. Needs: an
  actual backend (upload/search/moderate prefab JSON blobs), auth, and a browse/import UI.
- **Concave physics colliders.** Physics Sandbox uses a convex-hull collider per object (Rapier's practical
  choice for dynamic bodies), so a concave shape — anything with an extruded dent, not just an outward bump —
  simulates as its hull, not its true shape. Fine for a "everything falls" sandbox; not accurate for precise
  concave collision.
- **Physics Sandbox at scale.** Every object becomes an individual dynamic rigid body with no distance-based
  culling; a very large scene could get expensive. Consider freezing bodies that have settled, or only
  simulating what's near the player.
- **Edit-tool precision.** Extrude drags along the face normal only, at a fixed sensitivity, with no numeric
  input or snapping (Blender's `E` then typing a distance). Paint applies one flat color per click; no
  eyedropper, no multi-face paint drag.

## Keybinding note

The originating spec pairs Inspector-toggle with both `Tab` and "A", but `A` doubles as the WASD strafe-left key
in Build mode — binding both would break strafing. Shipped with `Tab` only
(`src/renderer/ui/GlobalHotkeys.tsx`).

## Packaging

`npm run package` runs `electron-builder`, but there's no `build` config block in `package.json` yet (icons, app
id, target platforms, code signing). Needed before cutting an actual installer for distribution.
