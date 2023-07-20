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
  depends_on      = [
    google_service_account.service_account,
    google_storage_bucket.bucket_json
  ]
}
