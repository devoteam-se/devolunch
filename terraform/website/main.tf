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

# Enable Cloud Resource Manager API
resource "google_project_service" "resourcemanager" {
  provider           = google-beta
  service            = "cloudresourcemanager.googleapis.com"
  disable_on_destroy = false
}
