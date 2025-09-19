# Architecture

Components
- Client (React + Vite): Renders daily menus; calls the server API.
- Server (Express): Serves the client build and exposes API endpoints. Can serve images.
- Scraper (Cloud Functions v2): Aggregates menus daily and writes `scrape.json` to Cloud Storage.
- Notify Slack (Cloud Functions v2): Posts a daily summary to Slack using `scrape.json`.
- Shared package: Provides typed models and cross-runtime logger.

Mermaid overview
```mermaid
flowchart LR
  subgraph GCP
    F1[Scraper CF] -- write --> B[(GCS Bucket)]
    F2[Notify Slack CF] -- read --> B
  end

  C[Client (React)] -- fetch --> S[Server (Express)]
  S -- read --> B

  classDef svc fill:#eef,stroke:#88f;
  class F1,F2,S,C svc;
```

Data flow (daily)
1) Scheduler triggers the Scraper CF
2) Scraper gathers menus (HTML → PDF → Vision) and writes `scrape.json` to GCS
3) Server reads `scrape.json` from GCS for API responses
4) Notify Slack reads the same file and posts a Markdown summary

Schedules
- Scraper: triggered daily via Cloud Scheduler (see Terraform)
- Notify Slack: triggered after scrape via Scheduler/CI (see Terraform)

Configuration & secrets
- Scraper: `DEFAULT_LANGUAGE`, `TRANSLATE_LANGUAGES`, `USE_CONTENT_CLEANER`, `OPENAI_API_KEY`
- Server: standard web config + `LOG_LEVEL`
- Notify Slack: `SLACK_OAUTH_TOKEN`, `SLACK_CHANNEL_ID`
- Secrets are injected via CI/terraform; never committed.

Logging & observability
- Node services import `@devolunch/shared/logger/node` (Pino with GCP severity mapping)
- Client uses `@devolunch/shared/logger/browser`
- Avoid `console.*` in Node code; use logger.

Error handling
- Scraper retries via multi-step strategy (text → pdf → images → delayed retry)
- Server returns clear status codes; logs warning/errors with context
- Notify Slack logs failures with structured error objects

Environments
- Development: local runs (Functions Framework), scraper writes local `scrape.json`
- Production: Cloud Functions + Cloud Run; artifacts read/written via GCS
