resource "google_cloud_scheduler_job" "job" {
  project          = var.project_id
  region           = var.region
  name             = "scraper-scheduler"
  description      = "Trigger the ${google_cloudfunctions2_function.function.name} Cloud Function every weekday at 10:00"
  schedule         = "0 10 * * 1-5"
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
