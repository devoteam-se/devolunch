# Devolunch

## Description

Devolunch is an app that presents today's lunch menu on scraped restaurants. Check [scraper](/server/src/scraper/README.md) for how to add more restaurants.

The hosted version can be found at: https://www.malmolunch.se.

## Technologies

Devolunch is built with the following tools:

- Frontend: React v18
- Backend: Node.js 18 w/ express
- Web hosting: Docker in GCP w/ [Cloud Run](https://cloud.google.com/run/docs)

## Setup

### Install dependencies:

```sh
pnpm install
```

## Running locally in development mode

### Run the program:

```sh
pnpm dev
```

## Running locally in production mode

### Run the program in Docker:

```sh
docker-compose up
```

## Deploy to production

Make sure

## TODO

- [ ] Make open source
  - [x] Implement Terraform support
  - [x] Add instructions on how to make a scraper
  - [ ] Move scrape call to Cloud Function
- [x] Add husky/lint-staged and make sure pre-commit is triggered to run lint/tests
- [ ] Write tests
