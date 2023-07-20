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
