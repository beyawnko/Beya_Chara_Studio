# agents.md — Execution Instructions for Agents

## Objective
Maintain and extend a GLB-only web application (React + Vite + Three.js) that builds character morphs, supports VRM/FBX/GLB import, performs head/body retargeting, and exports UE 5.6-ready GLBs. Keep tests green, enforce lint, and prioritize performance and UX.

## Golden rules
1. **Don’t mutate Zustand state directly.** Always use the provided setters or `setState` with functional updates.
2. **Never bake world transforms into skinned geometry.** Keep geometry in local space.
3. **Topology first.** Any morph or variant must match vertex + index counts; fail fast with clear messages.
4. **Workers for heavy math.** Diffing, similarity, and remapping belong off the main thread.
5. **ARKit names are canonical.** Keep exact spellings for the 52 shapes.
6. **UE export is Z-up, ×100 scale.** Don’t change these defaults unless a feature flag is added.
7. **Tests before features.** Add Vitest specs as you go; keep the CI pipeline green.

## Daily flow
- `pnpm i`, `pnpm dev` for local work.
- Add/update unit tests in `tests/` for each new feature.
- Run `pnpm lint` and `pnpm format:check` before commits.
- `pnpm test` (Vitest), `pnpm test:e2e` (Playwright) locally.
- Push to a PR; GitHub Actions will run lint + unit + e2e.

## Code style
- TypeScript, React functional components, hooks-only.
- No direct DOM unless absolutely necessary; prefer React bindings.
- Use `MeshStandardMaterial` for PBR preview; apply IBL via `drei/Environment`.
- Keep workers pure; pass transferable typed arrays when possible.

## Feature checklists
- **Importers:** FBX/GLTF/VRM work; head/body tracks; VRM presets extracted.
- **Morphs:** Relative deltas; normalized normal diffs; dedupe similarity; morph categories.
- **Retarget:** Auto map + preset + manual overrides; neck attach w/ offsets; worker remap; visual highlight.
- **ARKit:** Coverage report; procedural subset synthesis; map VRM presets when present.
- **Export:** Per-part and combined; obey material masks; Z-up + ×100; morphs embedded.

## Review gates
- All PRs must pass: `pnpm lint`, `pnpm test`, `pnpm test:e2e`.
- For large meshes/tools, include perf notes in the PR description and, if possible, timings vs. previous main.

## Backlog grooming
- Use the Roadmap/TODO in `agent_handoff.md` and update it each sprint.
- Keep preset maps and skeleton aliases in small, testable modules.

## Changelog — 2025‑08‑10

### Fixed material handling in `Viewport`

In response to an upstream bug report, the application now correctly respects meshes that carry multiple materials. Previously, the `Viewport` component would blindly replace the `material` property with a single `MeshStandardMaterial`, causing group assignments to be lost and breaking head/body masking. We introduced a new helper module `src/lib/materials.ts` containing:

- `toStandardMaterial(m, created)`: upgrades any material to a `MeshStandardMaterial`, lightly preserving `color` and `map` when present and pushing new materials into `created` for disposal.
- `normalizeMeshMaterials(mesh, created)`: handles both single materials and arrays, calling `toStandardMaterial` appropriately and ensuring array lengths remain unchanged.

`Viewport.tsx` now imports `normalizeMeshMaterials` and applies it within its `useEffect` that traverses meshes. All newly created materials are disposed of on cleanup.

### Added unit tests

Added `tests/materials.spec.ts` to validate the new helpers. The tests cover:

- No replacement when a mesh already has a `MeshStandardMaterial`.
- Upgrading non‑standard materials while preserving the `color` property.
- Upgrading an array of materials without collapsing it and ensuring only non‑standard entries are replaced.

All tests currently pass under Vitest (`pnpm test`).

## Material handling policy

- **Always use `MeshStandardMaterial`.** When importing arbitrary GLB/FBX/VRM files, any materials that aren’t already `MeshStandardMaterial` or `MeshPhysicalMaterial` are upgraded via `toStandardMaterial`. This ensures consistent PBR preview, IBL support, and compatibility with our masking logic.
- **Preserve basic properties.** When upgrading, attempt to copy `color` and `map` if defined on the original material. Do not attempt to copy unsupported fields like emissive, wireframe, etc.
- **Respect material arrays.** Never collapse an array of materials into a single one; instead map each element through the upgrade. Maintain group indices so that geometry subranges continue to reference the correct material.
- **Track disposables.** Any materials created during normalization are collected into a `created` array. The caller must dispose them on unmount to avoid GPU leaks.

## QA checklist

When working on material‑related changes, follow this checklist before opening a PR:

1. **Load a GLB with multiple submaterials.** Verify that the head/body/base masking still functions on each submesh and that group counts remain correct.
2. **Check color and texture preservation.** When upgrading from a non‑standard material (e.g. `MeshBasicMaterial` or `MeshLambertMaterial`), confirm that base colors and diffuse maps carry over.
3. **Monitor GPU resource usage.** Use browser devtools to ensure no material or texture leaks occur when switching between heads/bodies or unloading the scene.
4. **Run unit tests.** Execute `pnpm test` and ensure that all existing and new specs pass.
5. **Lint and format.** Run `pnpm lint` and `pnpm format:check` to enforce code style.

## Next iterations & improvements

- **Stable material slot IDs.** Avoid using `name#index` to generate material keys, as names may not be unique across imported models. Introduce a deterministic ID based on group indices.
- **Color space and encoding.** Enforce correct sRGB handling when loading textures and set renderer outputEncoding to `sRGBEncoding`. Include unit tests verifying that colors aren’t washed out.
- **Environment control.** Offer a dropdown to select between built‑in HDR environments or upload a custom HDRI. Cache prefiltered maps with PMREMGenerator to reduce load times.
- **Workerize heavy operations.** Offload expensive geometry diffs, material remapping, and GLB export preparation to web workers via Comlink to keep the main thread responsive.
- **Seam blending.** Explore blending normals and vertex positions along the neck seam to avoid visible discontinuities when combining head and body meshes.
- **ARKit auto‑mapping table.** Build a table that maps common VRM blendshapes to ARKit names with editable overrides. Use Playwright to automate a full import→mask→export flow and assert that exported GLBs contain the correct number of materials.
- **Dev HUD.** Surface a small overlay in development mode that lists GPU memory usage, material counts, and texture counts to aid in leak detection.

## Test driven development task queue

1. **Material slot IDs** — Write a unit test that ensures `materialAssign` keys remain stable across reloads and multiple imports. Only then refactor the key generation logic.
2. **sRGB conversion** — Add a test that loads a texture with a known RGB value and verifies that after loading, the resulting material displays the correct color under the renderer’s encoding settings.
3. **HDR environment selector** — Add a React test to assert that selecting different environments updates the scene background and reflections appropriately. Implement the component once the test fails.
4. **Retarget seam blending** — Write a unit test that constructs a simple neck seam and expects the blended seam to minimize normal discontinuities. Then prototype the blending algorithm in a worker.
5. **Playwright export test** — Extend `e2e/smoke.spec.ts` to import a GLB with three materials, mask the head, export the combined GLB, and check via `glb-roundtrip.spec.ts` that material counts and mask assignments are intact.
