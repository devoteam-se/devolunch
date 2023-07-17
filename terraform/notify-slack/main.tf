terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "4.65.2"
    }
  }
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Enable Storage Bucket API
resource "google_project_service" "storage" {
  provider           = google-beta
  service            = "storage.googleapis.com"
  disable_on_destroy = false
}

# Enable IAM API
resource "google_project_service" "iam" {
  provider           = google-beta
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

data "archive_file" "cf_source_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../apps/functions/notify-slack/build"
  output_path = "${path.module}/tmp/notify-slack.zip"
  depends_on  = [null_resource.cf_file]
}

locals {
  cf_zip_archive_name = "cf-${data.archive_file.cf_source_zip.output_sha}.zip"
}

# Object for Cloud Storage
resource "google_storage_bucket_object" "bucket_object" {
  name          = local.cf_zip_archive_name
  bucket        = var.storage_bucket_cf
  source        = data.archive_file.cf_source_zip.output_path
  content_type  = "application/zip"
  depends_on    = [data.archive_file.cf_source_zip]
}

resource "null_resource" "cf_file" {
  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.module}/../../apps/functions/notify-slack
      ./build.sh
    EOT
  }
}

resource "google_service_account" "service_account" {
  project      = var.project_id
  account_id   = "notify-slack-function-invoker"
  display_name = "Cloud Function Invoker Service Account"
}

resource "google_project_iam_member" "invoking" {
  project     = var.project_id
  role        = "roles/run.invoker"
  member      = "serviceAccount:${google_service_account.service_account.email}"
  depends_on  = [google_service_account.service_account]
}

resource "google_secret_manager_secret" "slack_channel_id" {
  secret_id = "slackChannelId"
  project = var.project_id

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "slack_channel_id_version" {
  secret = google_secret_manager_secret.slack_channel_id.name

  secret_data = var.slackChannelId
  enabled = true
}

resource "google_secret_manager_secret" "slack_oauth_token" {
  secret_id = "slackOauthToken"
  project = var.project_id

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "slack_oauth_token_version" {
  secret = google_secret_manager_secret.slack_oauth_token.name

  secret_data = var.slackOauthToken
  enabled = true
}

resource "google_secret_manager_secret_iam_member" "secret_slack_oauth_token" {
  secret_id   = google_secret_manager_secret.slack_oauth_token.id
  role        = "roles/secretmanager.secretAccessor"
  member      = "serviceAccount:${google_service_account.service_account.email}"
}

resource "google_secret_manager_secret_iam_member" "secret_slack_channel-id" {
  secret_id   = google_secret_manager_secret.slack_channel_id.id
  role        = "roles/secretmanager.secretAccessor"
  member      = "serviceAccount:${google_service_account.service_account.email}"
}

# Create Cloud Function
resource "google_cloudfunctions2_function" "function" {
  name           = "notify-slack"
  location       = var.region
  project        = var.project_id
  description    = "notify slack on lunch menu"

  build_config {
    runtime = "nodejs18"
    entry_point = "notify-slack"
    source {
      storage_source {
        bucket = var.storage_bucket_cf
        object = google_storage_bucket_object.bucket_object.name
      }
    }
  }

  service_config {
    max_instance_count              = 1
    available_cpu                   = "1"
    available_memory                = "256M"
    timeout_seconds                 = 60
    ingress_settings                = "ALLOW_ALL"
    all_traffic_on_latest_revision  = true
    service_account_email           = google_service_account.service_account.email

    secret_environment_variables {
      project_id  = var.project_id
      version     = "latest"
      key         = "SLACK_CHANNEL_ID"
      secret      = google_secret_manager_secret.slack_channel_id.secret_id
    }
    secret_environment_variables {
      project_id  = var.project_id
      version     = "latest"
      key         = "SLACK_OAUTH_TOKEN"
      secret      = google_secret_manager_secret.slack_oauth_token.secret_id
    }
  }
}

resource "google_cloud_scheduler_job" "job" {
  project          = var.project_id
  region           = var.region
  name             = "notify-slack-scheduler"
  description      = "Trigger the ${google_cloudfunctions2_function.function.name} Cloud Function every weekday at 10:30"
  schedule         = "30 10 * * 1-5"
  time_zone        = "Europe/Stockholm"
  attempt_deadline = "320s"

  http_target {
    http_method = "POST"
    uri         = google_cloudfunctions2_function.function.service_config[0].uri

    oidc_token {
      service_account_email = google_service_account.service_account.email
    }
  }
}

output "function_uri" {
  value = google_cloudfunctions2_function.function.service_config[0].uri
}
