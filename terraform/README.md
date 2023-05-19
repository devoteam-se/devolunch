# Deploy

## Scraper

Go to `/terraform/scraper` and check that the variables are correct in `variables.tf` and make sure to copy `terraform.tfvars.examples` and name it `terraform.tfvars`. Verify that the languages you want to use are correct.

When done, run these commands in that directory to deploy to GCP:

```sh
$ terraform init
$ terraform apply
```

#### Manual trigger

Go to Cloud Scheduler in your project and select the `scrape-scheduler` and trigger it manually.

## Website

When you first deploy the website a hello world example is deployed on Cloud Run. The actual deploy only happens when someone pushes changes to the repository. I'm working on fixing this.

Verify that the scraper is up and running, and that the Cloud Schedule to trigger a scrape as been run.
Next, go to `/terraform/website` and check that the variables are correct in `variables.tf`.

When done, run these commands in that directory to deploy to GCP:

```sh
$ terraform init
$ terraform apply
```

You should get a link back as output to the deployed Cloud Run instance.

## Slack notifier

Verify that the scraper is up and running, and that the Cloud Schedule to trigger a scrape as been run.
Go to `/terraform/notify-slack` and check that the variables are correct in `variables.tf` and make sure to copy `terraform.tfvars.examples` and name it `terraform.tfvars`. Verify that the Slack channel ID and the Slack OAuth token are correct.

When done, run these commands in that directory to deploy to GCP:

```sh
$ terraform init
$ terraform apply
```

#### Manual trigger

Go to Cloud Scheduler in your project and select the `slack-notifier-scheduler` and trigger it manually.
