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

# Enable IAM API
resource "google_project_service" "iam" {
  provider           = google-beta
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

# Enable Artifact Registry API
resource "google_project_service" "artifactregistry" {
  provider           = google-beta
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# Enable Cloud Run API
resource "google_project_service" "cloudrun" {
  provider           = google-beta
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

# Enable Cloud Resource Manager API
resource "google_project_service" "resourcemanager" {
  provider           = google-beta
  service            = "cloudresourcemanager.googleapis.com"
  disable_on_destroy = false
}

# This is used so there is some time for the activation of the API's to propagate through
# Google Cloud before actually calling them.
resource "time_sleep" "wait_10_seconds" {
  create_duration = "10s"
  depends_on = [
    google_project_service.iam,
    google_project_service.artifactregistry,
    google_project_service.cloudrun,
    google_project_service.resourcemanager
  ]
}

# Create Artifact Registry Repository for Docker containers
resource "google_artifact_registry_repository" "devolunch_repo" {
  provider = google-beta

  location      = var.region
  repository_id = var.project_id
  description   = "My docker repository"
  format        = "DOCKER"
  depends_on    = [time_sleep.wait_10_seconds]
}

# Create a service account
resource "google_service_account" "docker_pusher" {
  provider = google-beta

  account_id   = "docker-pusher"
  display_name = "Docker Container Pusher"
  depends_on   = [time_sleep.wait_10_seconds]
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

# Deploy image to Cloud Run
resource "google_cloud_run_service" "devolunch" {
  provider = google-beta
  name     = "devolunch"
  location = var.region
  autogenerate_revision_name = true
  
  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
        resources {
          limits = {
            "memory" = "512M"
            "cpu"    = "1"
          }
        }
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "1"
      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }

  lifecycle {
    # Ignore image
    ignore_changes = [
      template[0].spec[0].containers[0].image
    ]
  }

  depends_on = [google_artifact_registry_repository_iam_member.docker_pusher_iam]
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

output "cloud_run_instance_url" {
  value = google_cloud_run_service.devolunch.status.0.url
}