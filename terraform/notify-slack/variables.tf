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

variable "storage_bucket_scrape" {
  description = "The name of the bucket containing the scraped restaurants"
  type        = string
  default     = "devolunchv2"
}

variable "storage_bucket_cf" {
  description = "The name of the bucket containing the zip file containing the code"
  type        = string
  default     = "devolunch-cf-source"
}

variable "slackChannelId" {
  description = "Slack channel ID"
  type        = string
}

variable "slackOauthToken" {
  description = "Slack OAuth token"
  type        = string
}
