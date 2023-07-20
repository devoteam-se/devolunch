resource "google_secret_manager_secret" "slack_channel_id" {
  secret_id = "slackChannelId"
  project   = var.project_id

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "slack_channel_id_version" {
  secret       = google_secret_manager_secret.slack_channel_id.name
  secret_data  = var.slackChannelId
  enabled      = true
}

resource "google_secret_manager_secret" "slack_oauth_token" {
  secret_id = "slackOauthToken"
  project   = var.project_id

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "slack_oauth_token_version" {
  secret       = google_secret_manager_secret.slack_oauth_token.name
  secret_data  = var.slackOauthToken
  enabled      = true
}

resource "google_secret_manager_secret_iam_member" "secret_slack_oauth_token" {
  secret_id   = google_secret_manager_secret.slack_oauth_token.id
  role        = "roles/secretmanager.secretAccessor"
  member      = "serviceAccount:${google_service_account.service_account.email}"
}

resource "google_secret_manager_secret_iam_member" "secret_slack_channel-id" {
  secret_id   = google_secret_manager_secret.slack_channel_id.id
  role        = "roles/secretmanager.secretAccessor"
  member      = "serviceAccount:${google_service_account.service_account.email}"
}
