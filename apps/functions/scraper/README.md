Scraper

Overview
- Google Cloud Function (v2) that scrapes restaurant lunch menus and writes a daily JSON to Cloud Storage.
- Headless navigation via Puppeteer with multiple extraction strategies:
  - Text extraction from HTML (content cleaner reduces noise)
  - PDF extraction: pdf-parse first; fallback to pdfjs-dist for image-based PDFs
  - Image extraction via OpenAI Vision when needed
- Structured logging via @devolunch/shared/logger (Pino), designed for GCP logs.

Local Development
- Start HTTP function locally: `pnpm -F scraper-cloud-function start` (functions-framework on port 8081)
- Run one-off scrape: `pnpm -F scraper-cloud-function scrape`
- Build only: `pnpm -F scraper-cloud-function build`
- During development, the result is also written to `apps/functions/scraper/scrape.json` (ignored by git).

Configuration
- Env vars (see `src/config.ts`):
  - `NODE_ENV`: set to `development` for local runs (enables local file output)
  - `DEFAULT_LANGUAGE` (default: `sv`)
  - `TRANSLATE_LANGUAGES` (comma-separated, default: `en`)
  - `USE_CONTENT_CLEANER` (default: true; set `false` to disable)
- Secrets/credentials: use your local environment or GCP runtime config for Google APIs and OpenAI.
- Logging level via `LOG_LEVEL` (info by default).

How Extraction Works
1) Try extracting dishes from cleaned page text (fastest path)
2) Detect and parse PDFs when helpful (pdf-parse; fallback to PDF.js)
3) If images likely contain the menu, use OpenAI Vision to extract text
4) If dynamic content loads slowly, wait and retry text extraction
5) Translate dishes to additional languages if configured
6) Upload `scrape.json` to the configured bucket in non-development mode

Restaurant Metadata
- Restaurants are defined in `src/restaurants.ts` as `RestaurantMetaProps[]`.
- Minimal example:
  ```ts
  {
    title: 'Example Restaurant',
    url: 'https://example.com/lunch',
    imageUrl: 'https://example.com/cover.jpg',
    googleMapsUrl: 'https://maps.app.goo.gl/...',
    coordinate: { lat: 55.6, lon: 13.0 },
  }
  ```
- Helpful optional fields:
  - `useContentCleaner?: boolean` — override global content cleaner per restaurant
  - `unknownMealDefault?: 'veg' | 'meat' | 'fish' | 'vegan' | 'misc'` — fallback type when classification is unclear
  - `multiLocation?`: handle chains with multiple branches
    - `type: 'shared'` — scrape once, reuse dishes across all provided locations
    - `type: 'filtered'` — scrape once; use regex filters to narrow content per location
      - Each location can specify a `locationFilter` (regex or alternation string)
    - `type: 'separate'` — each location has its own `url` and is scraped separately

Output
- Development: writes `scrape.json` next to the source for quick inspection
- Production: uploads `scrape.json` to the `devolunchv2` bucket (see `storage` integration in `src/scraper.ts`)

Logging
- Uses shared Pino logger with GCP severity mapping:
  - Server-side: `import { logger } from '@devolunch/shared/logger/node'`
  - Avoid `console.*` in server code; browser `console.*` may appear inside `page.evaluate()` only

Notes
- PDF parsing is opportunistic; the scraper picks the best available source (text/PDF/images).
- When running locally, ensure Puppeteer can install a Chrome binary (handled by `gcp-build` and `postinstall`).
