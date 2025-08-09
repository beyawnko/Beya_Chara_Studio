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
