# Infrastructure (WIP)

- Terraform under `terraform/` manages:
  - Cloud Run (website)
  - Cloud Functions v2 (scraper, notify-slack)
  - Cloud Scheduler (scraper trigger)
  - Cloud Storage (bucket for `scrape.json` and images)
- GitHub Actions deploy workflows call Terraform modules with appropriate secrets.

