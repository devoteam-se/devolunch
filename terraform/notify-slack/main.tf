terraform {
  backend "gcs" {
    bucket  = "devolunch-terraform-state"
    prefix  = "terraform/state/notify-slack"
  }

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
