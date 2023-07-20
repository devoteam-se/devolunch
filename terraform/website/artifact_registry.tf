# Enable Artifact Registry API
resource "google_project_service" "artifactregistry" {
  provider           = google-beta
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# Create Artifact Registry Repository for Docker containers
resource "google_artifact_registry_repository" "devolunch_repo" {
  provider = google-beta

  location      = var.region
  repository_id = var.project_id
  description   = "My docker repository"
  format        = "DOCKER"
}
