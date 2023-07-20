# Enable IAM API
resource "google_project_service" "iam" {
  provider           = google-beta
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

# Create a service account
resource "google_service_account" "docker_pusher" {
  provider = google-beta

  account_id   = "docker-pusher"
  display_name = "Docker Container Pusher"
}

# Give service account permission to push to the Artifact Registry Repository
resource "google_artifact_registry_repository_iam_member" "docker_pusher_iam" {
  provider = google-beta

  location   = google_artifact_registry_repository.devolunch_repo.location
  repository = google_artifact_registry_repository.devolunch_repo.repository_id
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.docker_pusher.email}"
  depends_on = [
    google_artifact_registry_repository.devolunch_repo,
    google_service_account.docker_pusher
  ]
}

# Create a policy that allows all users to invoke the API
data "google_iam_policy" "noauth" {
  provider = google-beta
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

# Apply the no-authentication policy to our Cloud Run Service.
resource "google_cloud_run_service_iam_policy" "noauth" {
  provider = google-beta
  location = var.region
  project  = var.project_id
  service  = google_cloud_run_service.devolunch.name

  policy_data = data.google_iam_policy.noauth.policy_data
}
