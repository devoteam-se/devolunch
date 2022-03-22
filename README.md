# DevoLunch

## Description
DevoLunch is an lunch app used for providing the todays lunch menus nearby the office.

The hosted version can be found at: https://devolunch.web.app/.


## Technologies
DevoLunch is built with the following tools:

- Frontend: React
- Backend: NodeJS/Express
- Web hosting: GCP - [App Engine][appengine]

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

[appengine]: https://cloud.google.com/appengine/docs/standard/nodejs