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
