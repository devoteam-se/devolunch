resource "google_cloudfunctions2_function" "function" {
  name           = "scraper"
  location       = var.region
  project        = var.project_id
  description    = "scrape lunch menus"

  build_config {
    runtime = "nodejs18"
    entry_point = "scrape"
    source {
      storage_source {
        bucket = google_storage_bucket.bucket_cloudfunction.name
        object = google_storage_bucket_object.bucket_object.name
      }
    }
  }

  service_config {
    max_instance_count              = 1
    available_cpu                   = "1"
    available_memory                = "2Gi"
    timeout_seconds                 = 180
    ingress_settings                = "ALLOW_ALL"
    environment_variables           = var.environment_variables
    all_traffic_on_latest_revision  = true
    service_account_email           = google_service_account.service_account.email
  }
}
