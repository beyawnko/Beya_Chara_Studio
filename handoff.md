# Agent Handoff: GLB-only Character Morph Creator (React + Vite + Three.js)

**Scope:** Web app for assembling morph targets from base + variant character meshes (GLB/FBX/VRM), with head/body separation, VRoid head-to-body retargeting, ARKit morph synthesis, and UE 5.6–ready GLB export.

## Architecture (high level)

- **UI:** React + Vite. Components under `src/components/` (Viewport, FileDrop, ExportPanel, RetargetPanel, BoneMapEditor, MaterialSplitPanel, ARKitPanel).
- **3D:** Three.js + @react-three/fiber + drei (OrbitControls, Environment).
- **State:** Zustand (persisted). Keys: `base`, `head`, `body`, `morphKeys`, `morphWeights`, `materialAssign`, `boneMap`, `headOffset`, `errors`, selections for bone highlighting.
- **Workers:** Comlink worker pool. Tasks: topology compare, morph diffs, cosine similarity, skinIndex remap.
- **Importers:** `loadAny` supports **FBX / GLB / GLTF / VRM**. Skinned-mesh safe: geometry stays in local space; object transforms reset for preview.
- **Morphs:** Variants → relative morph deltas (`position` + normalized `normal` diffs) with similarity dedupe and categorization via skin weights.
- **VRM presets:** Extracted from VRM 0.x (`extensions.VRM.blendShapeMaster`) and 1.0 (`extensions.VRMC_vrm.expressions.preset`).
- **ARKit:** 52-name list + generators: (A) coverage analyzer from VRM presets, (B) procedural synthesis of a subset (jaw open, blinks, brow inner up, smiles).
- **Retargeting:** VRoid head→body: auto alias map, Bone Map editor overrides, workerized rebind, neck attach + offsets, visual source/target bone highlighter.
- **Export:** UE-friendly GLB with Z-up, ×100 scale; per-part or combined head+body (material masks).

## Key files

- `src/lib/importers.ts` — unified import path (FBX/GLB/GLTF/VRM)
- `src/lib/morphs.ts` — workerized diffs, similarity, attach + metadata
- `src/lib/pool.ts` — Comlink worker pool
- `src/workers/morph.worker.ts` — diff + topology + cosineSim (normalized normals)
- `src/workers/retarget.worker.ts` — skinIndex remap
- `src/lib/retarget.ts` — suggestBoneMap, align (with offsets), rebind
- `src/lib/retargetPresets.ts` — VRM→UE5/Mixamo/MMD maps
- `src/lib/arkit.ts` / `src/lib/arkitSynthesis.ts` — coverage + procedural morph generation
- `src/lib/exportGLB.ts` / `src/lib/exportGLBCombined.ts` — export buffers and download helpers
- `src/state/useCharacterStore.ts` — app state (persisted)
- `src/components/*` — UI panels and viewport; `Viewport` includes gizmo + bone highlighter

## Tests (Vitest + Playwright)

- Unit: morph attach, ARKit set, skeleton detection, VRM preset extraction, store persistence, retarget presets, GLB round-trip.
- E2E: `e2e/smoke.spec.ts` ensures app renders.
- Run: `pnpm test` (unit), `pnpm test:e2e` (Playwright). CI installs Playwright browsers automatically.

## Style & lint

- ESLint (TS + React) and Prettier included. Run `pnpm lint`, `pnpm lint:fix`, `pnpm format`.
- EditorConfig sets LF, 2-space, no trailing spaces in common files.

## Roadmap & TODOs

- **ARKit synthesis**: expand coverage (jaw sideways, funnels/puckers, cheek squint, nose sneer) with region masks and procedural fields.
- **Workerize synthesis** for large meshes; throttle UI updates with requestAnimationFrame.
- **Advanced material split**: automatic Head/Body detection via material names and UV islands.
- **Retarget QA report**: unmapped bones, many-to-one mappings, percentage of vertices falling back to neck.
- **Bone chain visualization**: `SkeletonHelper` overlay + chain coloring for mapped pairs.
- **Save/Load mappings** to JSON; preset library per target skeleton.
- **Performance budgets**: synthetic meshes 200k–500k vertices; worker pool sizing UI.
- **UE import preset doc**: checklist for UE morph import flags, tangent space options, and material merging.
- **Digital Tailor**: garment fitting scaffold added; implement pin UI, cloth solver, and export pipeline.
- Code review addressed: consolidated FileDrop kind mapping, garment handling moved into `onFiles`, shared error helper, semantic button styles, and refactored `onFiles` to avoid duplication.
- Follow-up: removed broad type assertion in `onFiles` by explicitly handling head/body base assignments.

## Deployment

- Local: `pnpm dev` → http://localhost:5173
- Build: `pnpm build` → dist/
- CI: GitHub Actions (`.github/workflows/ci.yml`) runs lint + unit + e2e on Node 20 / pnpm 9.

## Notes for maintainers

- Keep skinned geometry in **local space**—avoid applying world matrices pre-bind.
- When adding new morph synthesis ops, prefer writing to a fresh `Float32Array` and `attachMorph` with `morphTargetsRelative = true`.
- Always check topology parity (vertex/index counts) when adding morphs or variants.
- For head→body rebinds, maintain a strict, explicit name map; default fallback to **neck** keeps things stable if partial.
