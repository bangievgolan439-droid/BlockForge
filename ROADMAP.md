# Roadmap

Scope notes and what's next, in rough priority order.

## Near-term

- **CSG on real selections.** The Modifiers panel currently unions/subtracts/intersects two demo boxes to prove the Manifold3D-in-a-Worker pipeline works end to end. Wiring it to actual selected groups needs a voxels→boundary-mesh step (greedy meshing or per-block box union) before handing geometry to the worker, and a way to drop the CSG result back into the world as a real object rather than a floating preview mesh.
- **Per-face texture painting.** The spec asks for a 2D canvas to paint pixels/decals onto individual selected faces. The current material system is per-block-*type* (one shared procedural texture per type, for the triplanar shader), not per-block-*instance* or per-*face*. Real per-face decals need a per-instance material/UV layer — a bigger architecture change, deliberately deferred.
- **Community Workshop backend.** Prefab save/load/export already works locally (IPC → disk, via `window.blockforge.prefabs`). "Browse Community Workshop" in the Prefabs panel is a disabled stub. Needs: an actual backend (upload/search/moderate prefab JSON blobs), auth, and a browse/import UI.
- **Voxel world scale.** `VoxelWorld` and `PhysicsSandbox` rebuild one `InstancedMesh` per block type on every edit — fine up to a few thousand blocks, not chunked. For a much larger world, move to a chunk grid with dirty-region rebuilds instead of rebuilding whole-type instance arrays.
- **Build-mode collision.** Movement currently does vertical gravity + step-up collision (via a per-column height map) but no real horizontal AABB collision against walls — you can't currently get stuck on a wall, but you also don't get blocked by one at head height. Worth a proper swept-AABB pass if precise building against walls matters.
- **Physics Sandbox scale.** All non-bedrock blocks become individual dynamic rigid bodies; fine for a modest world, but there's no LOD/culling by distance, so a very large structure could get expensive. Consider only simulating blocks within a radius of the player, or freezing bodies that haven't moved.

## Keybinding note

The originating spec pairs Inspector-toggle with both `Tab` and `A`, but `A` doubles as WASD strafe-left in Build mode — binding both would break strafing. Shipped with `Tab` only (`src/renderer/ui/GlobalHotkeys.tsx`). If a second Inspector-toggle key is wanted, pick one that isn't part of WASD (e.g. `` ` `` or `Q`).

## Packaging

`npm run package` runs `electron-builder`, but there's no `build` config block in `package.json` yet (icons, app id, target platforms, code signing). Needed before cutting an actual installer for distribution.
