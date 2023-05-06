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

- Install dependencies:

        pnpm install

## Running locally in development mode

- Run the program:

        pnpm dev

## Running locally in production mode

- Run the program in Docker:

        docker-compose up

## Deploy to production

Push the code to `master`-branch

## TODO

- [ ] Make open source
  - [ ] Implement Terraform support
  - [x] Add instructions on how to make a scraper
- [x] Add husky/lint-staged and make sure pre-commit is triggered to run lint/tests
- [ ] Write tests
