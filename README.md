# Devolunch

## Description

Devolunch is an app that presents today's lunch menu on scraped restaurants. It's hosted on [Google Cloud Platform](https://cloud.google.com/).

The working version can be found at: https://www.malmolunch.se.

This repository consist of three services.

- Scraper
- Website
- Slack notifier

### <a name="scraper">Scraper</a>

This service is using Puppeteer to scrape all the restaurants that exists in [/server/functions/scraper/src/restaurants](/server/functions/scraper/src/restaurants), and saves them to a `.json` file hosted on a Google Cloud bucket (to reduce cost).

It's hosted on a Google Cloud Functions v2 and triggered daily at 10:00 using a Google Cloud Scheduler.

Check out [the scraper](/server/src/scraper/README.md) for how to add restaurants.

#### **Technologies**

- [Node](https://nodejs.org/en) w/ [Typescript](https://www.typescriptlang.org/)
- [puppeteer](https://pptr.dev/)
- [pdf-parse](https://gitlab.com/autokent/pdf-parse)
- [Cloud Functions v2](https://cloud.google.com/functions)
- [Cloud Scheduler](https://cloud.google.com/scheduler)
- [Cloud Storage Buckets](https://cloud.google.com/storage/docs/json_api/v1/buckets)
- [Terraform](https://www.terraform.io/)

### <a name="website">Website</a>

_Needs Scraper to work_

The website is a React app built with Typescript that presents the lunch menu of the scraped restaurants.
It's hosted on Cloud Run and is served by a simple Node express app.

#### **Technologies**

- [React](https://react.dev/) w/ [Typescript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Node](https://nodejs.org/en) w/ [Express](https://expressjs.com/)
- [Docker](https://www.docker.com/) image on [Artifact Registry](https://cloud.google.com/artifact-registry)
- [Cloud Run](https://cloud.google.com/run)
- [Terraform](https://www.terraform.io/)

### <a name="notify-slack">Slack notifier</a>

_Needs Scraper to work_

The Slack notifier is a simple service that retrieves the data Scraped by the and posts it to a Slack channel. The Terraform setup is configured to create a Google Cloud Scheduler which sends a message at 10:30 AM to the specified Slack channel.

#### **Technologies**

- [Node](https://nodejs.org/en) w/ [Typescript](https://www.typescriptlang.org/)
- [Cloud Functions v2](https://cloud.google.com/functions)
- [Cloud Scheduler](https://cloud.google.com/scheduler)
- [Terraform](https://www.terraform.io/)

# Setup

## Locally

### Install dependencies:

```sh
pnpm install
```

## Running locally in development mode

### Run the server and the client

```sh
pnpm dev
```

### Run the program in Docker:

```sh
docker-compose up
```

## Deploy

### Scraper

Go to `/terraform/scraper` and check that the variables are correct in `variables.tf` and make sure to copy `terraform.tfvars.examples` and name it `terraform.tfvars`. Verify that the languages you want to use are correct.

When done, run these commands in that directory to deploy:

```sh
$ terraform init
$ terraform apply
```

To trigger a manual Scrape go to Cloud Scheduler in your project and trigger it manually.

### Website

Verify that the scraper is up and running, and that the Cloud Schedule to trigger a scrape as been run.
Next, go to `/terraform/website` and check that the variables are correct in `variables.tf`.

When done, run these commands in that directory to deploy:

```sh
$ terraform init
$ terraform apply
```

You should get a link back as output to the deployed Cloud Run instance.

### Slack notifier

Verify that the scraper is up and running, and that the Cloud Schedule to trigger a scrape as been run.
Go to `/terraform/notify-slack` and check that the variables are correct in `variables.tf` and make sure to copy `terraform.tfvars.examples` and name it `terraform.tfvars`. Verify that the Slack channel ID and the Slack OAuth token are correct.

When done, run these commands in that directory to deploy:

```sh
$ terraform init
$ terraform apply
```

To trigger a manual Slack notification go to Cloud Scheduler in your project and trigger it manually.

# TODO

- [ ] Make open source
  - [x] Implement Terraform support
  - [x] Add instructions on how to make a scraper
  - [x] Move scrape call to Cloud Function
- [x] Add husky/lint-staged and make sure pre-commit is triggered to run lint/tests
- [ ] Write tests
