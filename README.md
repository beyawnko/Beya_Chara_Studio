# GLB-only Character Morph Creator

[![CI](https://github.com/beyawnko/Beya_Chara_Studio/actions/workflows/ci.yml/badge.svg)](https://github.com/beyawnko/Beya_Chara_Studio/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/beyawnko/Beya_Chara_Studio/branch/main/graph/badge.svg?token=<CODECOV_TOKEN>)](https://codecov.io/gh/<your-username>/<repo-name>)

Live demo (GitHub Pages): https://beyawnko.github.io/Beya_Chara_Studio/

## Scripts
- `pnpm dev` — start Vite dev server
- `pnpm test` — run unit tests (Vitest)
- `pnpm test:coverage` — run tests with coverage (v8 provider)
- `pnpm test:e2e` — Playwright smoke tests
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm build` — production build
- `pnpm deploy` — publish `dist/` to `gh-pages` (local; CI also deploys on main/master)

## CI
- GitHub Actions (`.github/workflows/ci.yml`) runs lint, unit, coverage, e2e, and deploys Pages on main/master.
- To enable **Codecov**, add a `CODECOV_TOKEN` secret in your repo settings.

## Pages base path
- Vite `base` is controlled by `GITHUB_PAGES_BASE`. CI sets it to `/${repo}/`.
- For local deploys, run: `GITHUB_PAGES_BASE=/Beya_Chara_Studio/ pnpm build && pnpm deploy`
