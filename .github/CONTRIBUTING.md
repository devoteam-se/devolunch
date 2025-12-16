# Contributing to Devolunch

We appreciate any kind of contributions to Devolunch 🤗

## Code / Development

- TypeScript-first codebase (client/server/functions)
- Conventional Commits enforced via a commit-msg hook
- See development details in [docs/development.md](../docs/development.md)

## Forking/Cloning

- Outside contributors: fork the repo and open PRs from your fork
- Org members: branch in-repo and open PRs from branches

## Local Setup

1. Install dependencies
   ```sh
   pnpm install
   ```
2. Run dev
   ```sh
   pnpm dev
   ```
3. Optional Docker
   ```sh
   docker-compose up
   ```

## Functions (Scraper & Slack Notifier)

See their readmes:
- Scraper: apps/functions/scraper/README.md
- Notify Slack: apps/functions/notify-slack/README.md

## Adding restaurants

Add entries to apps/functions/scraper/src/restaurants.ts. See the Scraper README for examples.
