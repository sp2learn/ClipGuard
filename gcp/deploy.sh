#!/usr/bin/env bash
# ============================================================================
# ClipGuard (VividScale) — Zero-Ops GCP Provisioning Script
# Deploys:
#   1. GCS Bucket with 7-Day Automated Lifecycle Rule
#   2. Secret Manager for GEMINI_API_KEY (Zero hardcoded keys)
#   3. Cloud Pub/Sub Topic (video-audit-events) + 3 Parallel Subscribers + DLQ
#   4. BigQuery Dataset, Vector Index (gemini-embedding-2), & Looker View
#   5. Cloud Run Dispatcher + Eventarc GCS Object Finalize Trigger
# ============================================================================
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project)}"
REGION="${GCP_REGION:-us-central1}"
BUCKET_NAME="${GCS_BUCKET_NAME:-${PROJECT_ID}-vividscale-raw-assets}"
SERVICE_NAME="clipguard-ingestion-dispatcher"
BQ_DATASET="vividscale_analytics"
PUBSUB_TOPIC="video-audit-events"
DLQ_TOPIC="vividscale-ingest-dlq"
SECRET_NAME="clipguard-gemini-key"

echo "==> [1/7] Enabling required Google Cloud APIs in project: ${PROJECT_ID}"
gcloud services enable \
  run.googleapis.com \
  eventarc.googleapis.com \
  pubsub.googleapis.com \
  storage.googleapis.com \
  bigquery.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  --project="${PROJECT_ID}"

echo "==> [2/7] Creating Cloud Storage ingestion bucket with 7-Day Lifecycle Rule: gs://${BUCKET_NAME}"
gcloud storage buckets create "gs://${BUCKET_NAME}" \
  --project="${PROJECT_ID}" \
  --location="${REGION}" \
  --uniform-bucket-level-access || true

cat > /tmp/gcs_lifecycle.json <<'EOF'
{
  "rule": [
    {
      "action": { "type": "Delete" },
      "condition": { "age": 7 }
    }
  ]
}
EOF
gcloud storage buckets update "gs://${BUCKET_NAME}" --lifecycle-file=/tmp/gcs_lifecycle.json

echo "==> [3/7] Configuring Secret Manager for GEMINI_API_KEY (${SECRET_NAME})"
if ! gcloud secrets describe "${SECRET_NAME}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud secrets create "${SECRET_NAME}" --replication-policy="automatic" --project="${PROJECT_ID}"
  if [[ -n "${GEMINI_API_KEY:-}" ]]; then
    printf "%s" "${GEMINI_API_KEY}" | gcloud secrets versions add "${SECRET_NAME}" --data-file=- --project="${PROJECT_ID}"
  fi
fi

echo "==> [4/7] Creating Cloud Pub/Sub Fan-Out Topic (${PUBSUB_TOPIC}) & Dead-Letter Queue (${DLQ_TOPIC})"
gcloud pubsub topics create "${PUBSUB_TOPIC}" --project="${PROJECT_ID}" || true
gcloud pubsub topics create "${DLQ_TOPIC}" --project="${PROJECT_ID}" || true

# 3 Downstream Parallel Subscribers (Role B Fan-Out)
gcloud pubsub subscriptions create "${PUBSUB_TOPIC}-bq-indexer-sub" \
  --topic="${PUBSUB_TOPIC}" --project="${PROJECT_ID}" || true
gcloud pubsub subscriptions create "${PUBSUB_TOPIC}-advertiser-webhook-sub" \
  --topic="${PUBSUB_TOPIC}" --project="${PROJECT_ID}" || true
gcloud pubsub subscriptions create "${PUBSUB_TOPIC}-compliance-quarantine-sub" \
  --topic="${PUBSUB_TOPIC}" --project="${PROJECT_ID}" || true

echo "==> [5/7] Provisioning BigQuery dataset & vector search tables: ${BQ_DATASET}"
bq --project_id="${PROJECT_ID}" query --use_legacy_sql=false < gcp/bigquery_schema.sql

echo "==> [6/7] Deploying Cloud Run Serverless Ingestion Dispatcher (${SERVICE_NAME})"
gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --source=. \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=50 \
  --memory=1Gi \
  --cpu=2 \
  --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID},GCP_REGION=${REGION},BQ_DATASET=${BQ_DATASET},PUBSUB_TOPIC=${PUBSUB_TOPIC}" \
  --set-secrets="GEMINI_API_KEY=${SECRET_NAME}:latest"

echo "==> [7/7] Wiring Eventarc GCS Object Finalize Trigger to Cloud Run (/eventarc/gcs-finalize)"
PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud eventarc triggers create "${SERVICE_NAME}-gcs-trigger" \
  --project="${PROJECT_ID}" \
  --location="${REGION}" \
  --destination-run-service="${SERVICE_NAME}" \
  --destination-run-region="${REGION}" \
  --destination-run-path="/eventarc/gcs-finalize" \
  --event-filters="type=google.cloud.storage.object.v1.finalized" \
  --event-filters="bucket=${BUCKET_NAME}" \
  --service-account="${SERVICE_ACCOUNT}"

echo "✅ ClipGuard Zero-Ops Pipeline Deployed with Secret Manager, 7-Day GCS Lifecycle, and Pub/Sub Fan-Out!"
