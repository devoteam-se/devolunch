variable "project_id" {
  description = "The name of the project"
  type        = string
  default     = "devolunch"
}

variable "region" {
  description = "The default compute region"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "The default compute zone"
  type        = string
  default     = "europe-west1"
}

variable "docker_image" {
  description = "The name of the Docker image in the Artifact Registry repository to be deployed to Cloud Run"
  type        = string
  default     = "devolunch"
}
