# Contributing to Devolunch

We appreciate any kind of contributions to Devolunch 🤗

# Code / Development

All code is Javascript with a touch of Typescript magic.
We follow the [Conventional Commits](https://www.conventionalcommits.org) guidelines.

## Forking/Cloning

If you are not part of our organisation, we recommend you fork the repository to push changes to your personal fork. When you want to share what you have done, open a pull request from your user-owned fork.

If you are part of the Jayway/Devoteam organisation, you can clone the repository and create a branch to work on, and when you want to share what you have done, open a pull request from your branch.

## Setup Development Environment

### Website

1. Install dependencies
   ```sh
   pnpm install
   ```
2. Run the server and the client
   ```sh
   pnpm dev
   ```
3. If you want to run the program in Docker (not necessary):
   ```sh
   docker-compose up
   ```

That's it!

### Scraper and Slack notifier

Go to their respective directories ([./server/functions/scraper/](./server/functions/scraper/) and [./server/functions/notify-slack/](./server/functions/notify-slack/))

1. Install dependencies
   ```sh
   pnpm install
   ```
2. Build Typescript to Javascript (named compile since Cloud Functions runs `build` automatically when deploying it)
   ```sh
   pnpm compile
   ```
3. Run it
   ```sh
   pnpm dev
   ```

## Adding more restaurants in Malmö

If you want to add more restaurants to our lovely city of Malmö, head over to [the scraper](./server/functions/scraper/) for instructions.
