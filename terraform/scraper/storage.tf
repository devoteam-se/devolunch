# Enable Storage Bucket API
resource "google_project_service" "storage" {
  provider           = google-beta
  service            = "storage.googleapis.com"
  disable_on_destroy = false
}

# Enable IAM API
resource "google_project_service" "iam" {
  provider           = google-beta
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

resource "google_storage_default_object_access_control" "public_rule" {
  bucket = google_storage_bucket.bucket_json.name
  role   = "READER"
  entity = "allUsers"
}

data "archive_file" "cf_source_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../apps/functions/scraper/build"
  output_path = "${path.module}/tmp/cfsource.zip"
  depends_on  = [null_resource.cf_file]
}

resource "google_storage_bucket" "bucket_json" {
  name     = var.storage_bucket_scrape
  location = var.region
  project  = var.project_id
  force_destroy = true
}

locals {
  cf_zip_archive_name = "cf-${data.archive_file.cf_source_zip.output_sha}.zip"
}

resource "google_storage_bucket" "bucket_cloudfunction" {
  name     = "${var.project_id}-cf-source"
  location = var.region
  project  = var.project_id
  force_destroy = true
  uniform_bucket_level_access = true
  storage_class = "STANDARD"

  versioning {
    enabled = true
  }
}

resource "google_storage_bucket_object" "bucket_object" {
  name          = local.cf_zip_archive_name
  bucket        = google_storage_bucket.bucket_cloudfunction.id
  source        = data.archive_file.cf_source_zip.output_path
  content_type  = "application/zip"
  depends_on    = [data.archive_file.cf_source_zip]
}

resource "null_resource" "cf_file" {
  triggers = {
    source_code = filesha256("${path.module}/tmp/cfsource.zip")
  }

  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.module}/../../apps/functions/scraper
      ./build.sh
    EOT
  }
}
