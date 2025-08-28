# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Vue 3 + uni-app source. Key folders: `pages/` (routes via `pages.json`), `components/`, `store/` (Pinia), `service/` (API), `utils/`, `layouts/`, `style/`, `types/`.
- Config: `manifest.json`, `pages.json`, `vite.config.ts`, `uno.config.ts`, `pages.config.ts`, `manifest.config.ts`.
- Ops & assets: `deploy/`, `server-config/`, `env/` (environment files), `static/`, `docs/`, build output in `dist/`.

## Build, Test, and Development Commands
- `pnpm dev:h5`: Run H5 dev server (also `pnpm dev` for default env).
- `pnpm build:h5`: Build H5 bundle to `dist/` (use `:test` for test mode).
- `pnpm dev:mp-weixin` / `pnpm build:mp-weixin`: Mini Program targets; other targets available (`dev:app`, `dev:mp-*`).
- `pnpm type-check`: TypeScript type checking via `vue-tsc`.
- Node ≥ 18 and pnpm ≥ 7.30 required. pnpm is enforced (`preinstall: only-allow pnpm`).

## Coding Style & Naming Conventions
- Formatting: Prettier (2-space tabs, single quotes, no semicolons). Run is automated via Husky + lint-staged.
- Linting: ESLint (TypeScript, Vue 3, import rules) and Stylelint (CSS/SCSS/Vue). Fixes applied on commit.
- Components: PascalCase filenames (`UserCard.vue`); composables in `hooks/` as `useXxx.ts`; stores in `store/` as `useXxxStore.ts`.
- Imports: no file extensions for TS/TSX; alias-safe via TS resolver.

## Testing Guidelines
- No unit test runner is configured. For E2E, uni-automator is available in devDependencies; integrate before use.
- If adding tests, colocate as `*.spec.ts` next to source, keep fast and deterministic.

## Commit & Pull Request Guidelines
- Conventional Commits enforced by Commitlint + Husky. Types include: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`, `revert`, `perf`, `wip`, `workflow`, `types`.
- Scope: use top-level `src` folder (singular), e.g., `feat(store): add auth state` or `fix(service): retry upload`.
- Use `pnpm cz` to compose messages. Small, focused commits preferred.
- PRs: include description, linked issues, target platform(s) (H5/mp/app), screenshots for UI, and steps to verify. Ensure `pnpm type-check` passes.

## Security & Configuration Tips
- Do not commit secrets. Place environment-specific values in `env/` and platform configs; review `nginx.conf` and deploy scripts before release.
- Validate route and permission changes in `pages.json` and `manifest.json` for all targets.
