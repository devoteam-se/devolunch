# Enable Storage Bucket API
resource "google_project_service" "storage" {
  provider           = google-beta
  service            = "storage.googleapis.com"
  disable_on_destroy = false
}

data "archive_file" "cf_source_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../apps/functions/notify-slack/build"
  output_path = "${path.module}/tmp/cfsource.zip"
  depends_on  = [null_resource.cf_file]
}

locals {
  cf_zip_archive_name = "cf-${data.archive_file.cf_source_zip.output_sha}.zip"
}

# Object for Cloud Storage
resource "google_storage_bucket_object" "bucket_object" {
  name          = local.cf_zip_archive_name
  bucket        = var.storage_bucket_cf
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
      cd ${path.module}/../../apps/functions/notify-slack
      ./build.sh
    EOT
  }
}
