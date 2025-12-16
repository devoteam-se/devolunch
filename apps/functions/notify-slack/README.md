# Notify Slack Cloud Function

Overview
- Google Cloud Function (v2) that posts the daily lunch menu to a Slack channel.
- Reads the aggregated `scrape.json` produced by the scraper from a Google Cloud Storage bucket.
- Uses structured logging via `@devolunch/shared/logger/node` (Pino for GCP).

Quick Start (local)
- Install deps: `pnpm -F notify-slack-cloud-function install`
- Configure env: copy `.env.example` → `.env` and fill:
  - `SLACK_OAUTH_TOKEN`
  - `SLACK_CHANNEL_ID`
  - `NODE_ENV=development` (optional for local)
- Start locally (Functions Framework):
  - `pnpm -F notify-slack-cloud-function start`
  - Exposes the HTTP function at `http://localhost:8080` by default. Target name: `notify-slack`.

What it does
- Downloads `scrape.json` from the `devolunchv2` bucket.
- Sorts restaurants by number of available dishes (desc), then by distance when present.
- Renders a concise Markdown summary in both Swedish and English.
- Posts the Markdown as a Slack file (type `post`) to the configured channel.

Configuration
- Source bucket: hard-coded to `devolunchv2` (see `src/index.ts`).
- Env vars (validated in `src/config.ts`):
  - `SLACK_OAUTH_TOKEN` (required)
  - `SLACK_CHANNEL_ID` (required)
  - `NODE_ENV` (optional; `development` enables dev behaviors if any)

Scripts
- `pnpm -F notify-slack-cloud-function build` — compile TypeScript to `dist`
- `pnpm -F notify-slack-cloud-function typecheck` — run TypeScript type-checks
- `pnpm -F notify-slack-cloud-function lint` — lint sources
- `pnpm -F notify-slack-cloud-function format` — format with Prettier
- `pnpm -F notify-slack-cloud-function start` — build + run via Functions Framework

Deployment
- Terraform: see `terraform/notify-slack` for infra and variables.
- GitHub Actions: `.github/workflows/deploy-notify-slack.yaml` provisions the function via Terraform and uses Secrets for Slack credentials.

Logging
- Import `logger` from `@devolunch/shared/logger/node`.
- Avoid `console.*` in server code. Use the logger for `info`, `warn`, `error`, and `debug`.

Notes
- This function expects the scraper to have already published a fresh `scrape.json` to the bucket.
- You can test end-to-end locally by running the scraper locally in development mode (which writes a local `scrape.json`) and temporarily adjusting the function to read from a local file, or by uploading a test file to the bucket.
