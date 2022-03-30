# DevoLunch

## Description
DevoLunch is an lunch app used for providing the todays lunch menus nearby the office.

The hosted version can be found at: https://devolunch-wbsypybpra-ey.a.run.app/.


## Technologies
DevoLunch is built with the following tools:

- Frontend: React v17
- Backend: Node.js 14 w/ express
- Web hosting: GCP w/ [Cloud Run][https://cloud.google.com/run/docs]

## Setup

- Install dependencies:

        npm install

## Running locally in development mode

- Run the program

        npm run dev

## Running locally in production mode

1. Perform the build step:

        npm run gcp-build

2. Run the completed program

        npm start

## Deploy with Google Cloud SDK

1. Initialise your SDK:

        gcloud init

2. Deploying to App Engine:

        gcloud app deploy
