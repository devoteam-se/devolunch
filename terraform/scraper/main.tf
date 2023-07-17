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

# Create a policy that allows all users to view data in bucket
resource "google_storage_default_object_access_control" "public_rule" {
  bucket = google_storage_bucket.bucket_json.name
  role   = "READER"
  entity = "allUsers"
}

data "archive_file" "cf_source_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../apps/functions/scraper/build"
  output_path = "${path.module}/tmp/scraper.zip"
  depends_on  = [null_resource.cf_file]
}

# Create a Storage Bucket for the scrape document
resource "google_storage_bucket" "bucket_json" {
  name     = var.storage_bucket_scrape
  location = var.region
  project  = var.project_id
  force_destroy = true
}

locals {
  cf_zip_archive_name = "cf-${data.archive_file.cf_source_zip.output_sha}.zip"
}

# Create Storage Bucket for Cloud Function zip
resource "google_storage_bucket" "bucket_cloudfunction" {
  name     = "${var.project_id}-cf-source"  # Every bucket name must be globally unique
  location = var.region
  project  = var.project_id
  force_destroy = true
  uniform_bucket_level_access = true
  storage_class = "STANDARD"

  versioning {
    enabled = true
  }
}

# Object for Cloud Storage
resource "google_storage_bucket_object" "bucket_object" {
  name          = local.cf_zip_archive_name
  bucket        = google_storage_bucket.bucket_cloudfunction.id
  source        = data.archive_file.cf_source_zip.output_path
  content_type  = "application/zip"
  depends_on    = [data.archive_file.cf_source_zip]
}

resource "null_resource" "cf_file" {
  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.module}/../../apps/functions/scraper
      ./build.sh
    EOT
  }
}

resource "google_service_account" "service_account" {
  project      = var.project_id
  account_id   = "scraper-invoker-sa"
  display_name = "Cloud Function Invoker Service Account"
}

resource "google_project_iam_member" "token_creator" {
  project     = var.project_id
  role        = "roles/iam.serviceAccountTokenCreator"
  member      = "serviceAccount:${google_service_account.service_account.email}"
  depends_on  = [google_service_account.service_account]
}

resource "google_project_iam_member" "invoking" {
  project     = var.project_id
  role        = "roles/run.invoker"
  member      = "serviceAccount:${google_service_account.service_account.email}"
  depends_on  = [google_service_account.service_account]
}

resource "google_storage_bucket_iam_member" "bucket_object_creator" {
  bucket          = google_storage_bucket.bucket_json.name
  role            = "roles/storage.objectAdmin"
  member          = "serviceAccount:${google_service_account.service_account.email}"
  # cache_control   =
  depends_on      = [
    google_service_account.service_account,
    google_storage_bucket.bucket_json
  ]
}

# Create Cloud Function
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
