# Devolunch

<a href="https://github.com/jayway/devolunch/blob/main/LICENSE.md"><img src="https://img.shields.io/npm/l/heroicons.svg" alt="License"></a>

Devolunch is an app that presents today's lunch menu on scraped restaurants. It's hosted on [Google Cloud Platform](https://cloud.google.com/).

The working version can be found at: https://www.malmolunch.se.

This repository consist of three services.

- [Scraper](#scraper)
- [Website](#website)
- [Slack notifier](#slack-notifier)

If you want to deploy it to GCP, head over to [./terraform](./terraform/).

## <a name="scraper">Scraper</a>

This service is using Puppeteer to scrape all the restaurants that exists in [./apps/functions/scraper/src/restaurants](./apps/functions/scraper/src/restaurants), and saves the output to a `.json` file hosted on a Google Cloud Bucket (to reduce cost).

It's hosted on a Google Cloud Functions v2 and triggered daily at 10:00 using a Google Cloud Scheduler.

Check out [the scraper](./apps/functions/scraper) on how to add restaurants.

#### **Technologies:**

- [Node](https://nodejs.org/en) w/ [Typescript](https://www.typescriptlang.org/)
- [puppeteer](https://pptr.dev/)
- [pdf-parse](https://gitlab.com/autokent/pdf-parse)
- [Cloud Functions v2](https://cloud.google.com/functions)
- [Cloud Scheduler](https://cloud.google.com/scheduler)
- [Cloud Storage Buckets](https://cloud.google.com/storage/docs/json_api/v1/buckets)
- [Terraform](https://www.terraform.io/)

## <a name="website">Website</a>

_Needs Scraper to work_

The website is a React app built with Typescript that presents the lunch menu of the scraped restaurants.
It's hosted on Cloud Run and is served by a simple Node express app.

#### **Technologies:**

- [React](https://react.dev/) w/ [Typescript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Node](https://nodejs.org/en) w/ [Express](https://expressjs.com/)
- [Docker](https://www.docker.com/) image on [Artifact Registry](https://cloud.google.com/artifact-registry)
- [Cloud Run](https://cloud.google.com/run)
- [Terraform](https://www.terraform.io/)

## <a name="notify-slack">Slack notifier</a>

_Needs Scraper to work_

The Slack notifier is a simple service that retrieves the data scraped by the [Scraper](#scraper) and posts it to a Slack channel. The Terraform setup is configured to create a Google Cloud Scheduler which sends a message at 10:30 AM to the specified Slack channel.

#### **Technologies:**

- [Node](https://nodejs.org/en) w/ [Typescript](https://www.typescriptlang.org/)
- [Cloud Functions v2](https://cloud.google.com/functions)
- [Cloud Scheduler](https://cloud.google.com/scheduler)
- [Terraform](https://www.terraform.io/)

# Contribute

<a href="https://github.com/jayway/devolunch/pulls" target="_blank"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>

Excited to work alongside you! Follow the instructions in [CONTRIBUTING](./CONTRIBUTING.md) and code away.

# TODO

- [x] Make open source
  - [x] Implement Terraform support
  - [x] Add instructions on how to make a scraper
  - [x] Move scrape call to Cloud Function
  - [x] Add deploy on Github release
  - [x] Block main branch from anyone outside of the org (unless default)
- [x] Add husky/lint-staged and make sure pre-commit is triggered to run lint/tests
- [x] Add API definition
- [x] Add API versioning
- [x] Change filesOverride to be read from environment instead of code
- [x] Change scraper to run PDF parse from within `browserScrapeFunction`
- [x] Fix shared npm packages for functions
- [x] Host images in a bucket
- [x] Add a separate service account for Cloud Run instead of using the default Compute Engine service account
- [x] Add Cloud Function deploy step
- [x] Serve images via the backend
