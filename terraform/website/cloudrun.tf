# Enable Cloud Run API
resource "google_project_service" "cloudrun" {
  provider           = google-beta
    service            = "run.googleapis.com"
    disable_on_destroy = false
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

output "cloud_run_instance_url" {
  value = google_cloud_run_service.devolunch.status.0.url
}
