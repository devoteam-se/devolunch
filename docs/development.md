# Development Guide

Monorepo basics
- Package manager: pnpm (Node ≥ 22)
- Orchestration: Turborepo
- Workspaces:
  - apps/client — React + Vite
  - apps/server — Express API
  - apps/functions/scraper — GCF v2 scraper
  - apps/functions/notify-slack — GCF v2 Slack notifier
  - packages/shared — shared types and logger

Common commands (root)
- `pnpm dev` — run dev processes (Turbo)
- `pnpm build` — build all (Turbo)
- `pnpm typecheck` — run TypeScript checks (Turbo)
- `pnpm lint` — lint (ESLint flat config)
- `pnpm test` — run tests (Turbo; Vitest for client)
- `pnpm clean` — clean outputs (dist/build)

Per-project examples
- Client: `pnpm -F @devolunch/client dev | build | test`
- Server: `pnpm -F @devolunch/server dev | build`
- Scraper: `pnpm -F scraper-cloud-function start | scrape | build`

Logging
- Node targets (server/functions): `@devolunch/shared/logger/node`
- Client: `@devolunch/shared/logger/browser`
- Avoid `console.*` in server code; browser `console` may be used inside `page.evaluate()` only.

Husky hooks
- pre-commit: `pnpm lint` + `pnpm typecheck`
- pre-push: `pnpm test` + `pnpm build`
- commit-msg: Conventional Commits enforced

TypeScript
- Strict settings enabled: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- Shared subpath imports supported via paths/typesVersions

CI
- `.github/workflows/install-and-test.yaml` runs lint, typecheck, tests, coverage, and audit
- Deploy workflows under `.github/workflows/*deploy*`

