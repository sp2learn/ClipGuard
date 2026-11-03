# ClipGuard (VividScale) — Executive Product & Google Cloud Architecture Specification

## 1. Executive Summary & Dual-Persona Interview Blueprint

### Customer Context ("VividScale")
VividScale is a high-growth AdTech and Creator-Economy platform where brands and creators upload **50,000+ short-form video ads, product unboxings, and sponsored reels monthly/daily** across TikTok, YouTube Shorts, and Instagram Reels.

### Strategic Business Requirements
Enterprise advertisers require three near-real-time guarantees before committing ad spend:
1. **GARM Brand Safety Compliance:** Automated detection of visual hazards (dangerous stunts, adult content), spoken policy violations (profanity, unsubstantiated medical/FTC claims), and on-screen competitor brand clashes.
2. **Timestamped Product Placements & Bounding Boxes:** Frame-accurate start/end timestamps (`MM:SS - MM:SS`), prominence tier (`Primary Hero`, `Secondary Feature`, `Background Cameo`), normalized 2D bounding-box coordinates (`[ymin, xmin, ymax, xmax]`), and sentiment for every featured SKU/logo (e.g., **Yamaha**, **VoltDrive**, **GlowLab**).
3. **Localized Ad Copy & Hybrid Cross-Video Semantic Search:** Instant multi-market ad copy/SEO tags (`en-US`, `es-MX`, `ja-JP`, `de-DE`, `pt-BR`) and natural-language + exact brand moment discovery across millions of video segments (e.g., *"Find all video moments where a user drinks a soda near an electric car"* or *"anyone used Yamaha brand"*).

---

### The Executive "Dual Persona" Blueprint (CPO vs. CIO Alignment)
Every UI component, metric card, and backend workflow is purpose-built to answer executive objections from both the **Chief Product Officer (CPO)** and **Chief Information Officer (CIO)**:

| Screen Section | Feature | CPO Stakeholder Value (Product / Revenue) | CIO Stakeholder Value (IT / Ops / Security / TCO) |
| :--- | :--- | :--- | :--- |
| **Top Executive Telemetry Bar** | Live Latency, Token Count, Unit Cost, Safety Verdict | Faster creator approval turnaround (`<5s` vs `3–4 min`), accelerating ad monetization. | Predictable cost per unit (`~$0.0325`) and zero idle GPU/VM server charges. |
| **Video Player & Click-to-Seek Timeline** | Interactive player with live bounding boxes & jump-to-timestamp clips | Contextual brand safety: visually proves why an ad was approved or flagged (`00:14`). | Native multimodal precision in a single token stream without running fragile FFmpeg frame-slicing clusters. |
| **GARM Brand Safety Inspector** | Policy pass/fail + violation tags (adult, competitor, FTC speech) | Protects advertiser brand equity and eliminates campaign churn. | Automated compliance governance with auditable BigQuery & Cloud Logging trails. |
| **Hybrid Cross-Modal Search Bar** | Natural-language semantic + lexical brand search | **New Monetization Stream:** Advertisers can search and sponsor exact contextual moments instantly. | Proves **BigQuery `VECTOR_SEARCH`** (`gemini-embedding-2`) integration without licensing an external vector DB SaaS. |
| **Operational JSON Inspector** | Collapsible raw structured output (`VIDEO_ANALYSIS_JSON_SCHEMA`) | Deterministic schema feeding downstream CRM, ad-server, and billing APIs. | Enterprise RBAC, strict schema validation, and IAM service-account auditability. |
| **GCS Asset Manager & Atomic Purge** | Tenant-isolated video listing, 7-day lifecycle countdown, & `🗑️ Delete` | Gives enterprise brands self-service control over campaign asset lifecycles. | Solves storage bloat & GDPR/CCPA retention via automated 7-day GCS lifecycle rules + two-way atomic purge. |
| **Editable AWS vs. GCP TCO Dashboard** | Line-item editable cost simulator (Rekognition, Transcribe, Bedrock vs. Gemini) | Unlocks ~90% cost reduction on video moderation & indexing. | Transparent, line-by-line TCO proof replacing 4 AWS services with 1 serverless Google Cloud stream. |

---

## 2. Target Google Cloud Architecture: Storage, Eventarc & Pub/Sub Dual-Role Fan-Out

### 2.1 Storage Architecture: Signed URLs, CMEK & 7-Day Automated Lifecycle
In production, raw video payloads bypass application servers via **Google Cloud Storage (GCS) V4 Signed URLs** and are governed by automated lifecycle deletion rules:

```text
[Client / Browser UI] ──(1. Request V4 Signed URL)──► [Cloud Run: API Gateway]
         │
         ▼ (2. Direct HTTP PUT Upload)
[GCS Raw Bucket: gs://vividscale-raw-assets-prod/{tenant_id}/{campaign_id}/{video_uuid}.mp4]
  • Encrypted with Customer-Managed Encryption Keys (CMEK)
  • Auto-expires in 7 days via GCS Object Lifecycle Policy
         │
         ▼ (3. google.cloud.storage.object.v1.finalized)
[Eventarc + Pub/Sub Transport (Role A: Guaranteed Delivery + DLQ)]
         │
         ▼ (4. CloudEvent POST /eventarc/gcs-finalize)
[Cloud Run: Gemini Multimodal Inspector] ──► [Gemini 3.8 Flash + Gemini Embedding 2]
         │
         ▼ (5. Publishes 'audit.completed' event)
[Cloud Pub/Sub Topic: projects/{project}/topics/video-audit-events (Role B: Downstream Fan-Out)]
        /                                  |                                   \
       ▼                                   ▼                                    ▼
[Sub 1: BigQuery Indexer]        [Sub 2: Advertiser Webhooks]        [Sub 3: Compliance Quarantine]
 • Writes video_assets            • Instant campaign approval         • Moves BLOCKED videos to
 • Writes 768-dim vectors           notification to brand portal        gs://vividscale-quarantine
```

#### Automated GCS 7-Day Lifecycle Policy (`gcp/gcs_lifecycle.json`)
Once multimodal metadata and 768-dimensional embeddings are safely indexed in BigQuery, raw video blobs are automatically purged after 7 days:
```json
{
  "rule": [
    {
      "action": { "type": "Delete" },
      "condition": { "age": 7, "matchesPrefix": ["uploads/", "tenants/"] }
    }
  ]
}
```

#### On-Demand Two-Way Atomic Purge (`DELETE /api/assets/:id`)
To satisfy enterprise privacy/compliance officers, the **GCS Asset & Purge Manager** provides an instant `🗑️ Delete Asset` action that executes a two-way atomic purge:
1. Deletes the raw object from `gs://vividscale-raw-assets-prod` (`storage.bucket().file().delete()`).
2. Purges the corresponding metadata and vector rows from BigQuery (`vividscale_analytics.video_assets` and `video_moment_embeddings`) and local cache.

---

### 2.2 Where Cloud Pub/Sub Sits (Dual-Role Architecture)
1. **Role A — Decoupled Transport Under Eventarc (Ingress):**
   - When a video finishes uploading to GCS (`google.cloud.storage.object.v1.finalized`), Eventarc uses an underlying Cloud Pub/Sub transport topic to route the CloudEvent to Cloud Run with **exponential backoff retries** and a **Dead-Letter Queue (DLQ)** (`vividscale-ingest-dlq`), ensuring zero dropped uploads during traffic spikes.
2. **Role B — Downstream Cross-Pillar Fan-Out (`video-audit-events`):**
   - Instead of Cloud Run synchronously blocking on BigQuery inserts, CRM webhooks, and Slack/email alerts, Cloud Run publishes an `audit.completed` message to the `video-audit-events` Pub/Sub topic. Three independent subscribers process the result in parallel.

---

## 3. AWS Multi-Service vs. Google Cloud Native TCO Architecture

### 3.1 The Traditional AWS Video Inspection Stack (60-Second Video)
- **Amazon Rekognition Video (Content Moderation):** `\$0.1000 / min`
- **Amazon Rekognition Video (Labels + Custom Brand BBox):** `\$0.1600 / min`
- **Amazon Transcribe (Speech-to-Text):** `\$0.0240 / min`
- **Amazon Bedrock (Ad Copy & Citation Synthesis):** `\$0.0200 / run`
- **EC2 / Step Functions (FFmpeg Slicing, BBox & Citation Glue):** `\$0.0200 / run`
- **Total AWS Cost per 60s Video:** **`\$0.3240 / video`**

### 3.2 The Google Cloud Native Stack — Gemini 3.8 Flash, Standard Long-Term Pricing (Jan 2027+)
- **Input:** `14,000 tokens × \$1.50 / 1M = \$0.02100`
- **Output:** `1,500 tokens × \$7.50 / 1M = \$0.01125`
- **Gemini model pass subtotal:** **`\$0.03225 / video`**
- **Cloud Run + Pub/Sub orchestration:** **`\$0.0002 / video`**
- **Total Google Cloud Cost per 60s Video:** **`≈ \$0.0325 / video`** *(editable in UI)*

### 3.3 Unit Economics Comparison Table (60s Video Baseline @ 50,000 Videos / Month)

| Dimension | AWS 4-Service Stack | Google Cloud Stream | Architectural Win |
| :--- | :--- | :--- | :--- |
| **Vision, 2D Brand BBox & Moderation** | `\$13,000 / mo` (`\$0.2600 / video`) | **`\$0 / mo`** | Bundled • Native 2D BBox |
| **Speech STT & Frame Citations** | `\$1,200 / mo` (`\$0.0240 / video`) | **`\$0 / mo`** | Bundled • Zero Drift |
| **LLM Ad Copy & Citation Synthesis** | `\$1,000 / mo` (`\$0.0200 / video`) | **`\$1,613 / mo`** (`\$0.03225 / video`) | 1 Pass Gemini 3.8 Flash |
| **Orchestration & BBox Alignment** | `\$1,000 / mo` (`\$0.0200 / video`) | **`\$10 / mo`** (`\$0.0002 / video`) | Scale-to-Zero Cloud Run |
| **Total Monthly TCO** | **`\$16,200 / mo`** | **`≈ \$1,623 / mo`** | **≈ 90% Total Cost Reduction** |
| **Annualized** | **`\$194,400 / yr`** | **`≈ \$19,470 / yr`** | **`≈ \$174,930 / yr saved`** |

*(Scope: per-video AI + orchestration run cost. Excludes storage, BigQuery/Looker, human review, and one-time migration — validated during the 30-day pilot. All rates and volumes are editable in the UI's TCO calculator.)*

---

## 4. Enterprise Security, API Key Protection & Governance

To protect credentials across local development, GitHub repositories, and production Google Cloud deployments:
1. **Git & Container Secret Hygiene (`.gitignore` & `.dockerignore`):**
   - `.env`, `.env.*`, `*service-account*.json`, and `.uploaded-videos-cache.json` are strictly excluded from Git commits via [`.gitignore`](./.gitignore) and excluded from Docker build contexts via [`.dockerignore`](./.dockerignore).
   - Only [`.env.example`](./.env.example) is tracked in source control with placeholder keys.
2. **Google Cloud Secret Manager & ADC in Production (`gcp/deploy.sh`):**
   - In Cloud Run, `GEMINI_API_KEY` is never hardcoded in `Dockerfile` or source files. It is stored in **Google Cloud Secret Manager** (`projects/26527152550/secrets/clipguard-gemini-key`) and mounted via `--set-secrets="GEMINI_API_KEY=clipguard-gemini-key:latest"`.
   - BigQuery, Cloud Storage, and Pub/Sub authenticate keyless via **Application Default Credentials (ADC)** attached to a dedicated least-privilege Cloud Run IAM Service Account.
3. **VPC Service Controls & CMEK:**
   - All GCS buckets (`gs://vividscale-raw-assets`) and BigQuery tables (`vividscale_analytics`) reside inside a **VPC Service Controls** perimeter with Customer-Managed Encryption Keys (CMEK), ensuring zero data exfiltration and zero model training on customer video assets.

---

## 5. Executive 2-Minute Demo Script (Slide 4 Proof of Value)

1. **The Hook (15s):** *"To prove we can eliminate AWS's 4-vendor latency and cut video moderation run cost by ~90%, I built the VividScale Video AI Cockpit on Cloud Run, Gemini 3.8 Flash, Pub/Sub, and BigQuery Vector Search."*
2. **The Execution (45s):** Upload a creator video (e.g., `piano_palying.MOV` or select a reel). Point to the **Top Executive Telemetry Bar** as latency (`~3.7s`), token count (`~15,500 tokens`), and unit cost (`~$0.0325` vs AWS `$0.3240`) populate.
3. **The CPO Win (30s):** Click a product placement timestamp (`00:14`). The video player seeks directly to that frame with live bounding boxes (`box_2d`), showing the GARM Brand Safety `SAFE` verdict and 5-language localized ad copy.
4. **The CIO Win (30s):**
   - Expand the **Operational Raw JSON Inspector** to show the strict schema contract.
   - Run a **Cross-Video Semantic Search** (e.g., *"anyone used Yamaha brand"* or *"drinks a soda near an electric car"*) powered by `gemini-embedding-2` and BigQuery `VECTOR_SEARCH`.
   - Open the **GCS Asset & Purge Manager** to delete a test video on-demand (`🗑️ Delete Asset`) and show the **Editable AWS vs. GCP TCO Dashboard**.

---

## 6. Specification File Map in This Repository

| Specification / Artifact | File Location | Description |
| :--- | :--- | :--- |
| **Master Product & Tech Spec** | [`SPEC.md`](./SPEC.md) | This document: CPO/CIO blueprint, GCS/PubSub architecture, AWS vs. GCP TCO, and security. |
| **Gemini JSON Schema & Hybrid Search** | [`src/geminiService.js`](./src/geminiService.js) | Enforced `VIDEO_ANALYSIS_JSON_SCHEMA` (with 2D bounding boxes) + `gemini-embedding-2` hybrid search. |
| **Cloud Run API & Asset Purge Server** | [`server.js`](./server.js) | Express & Eventarc webhook receiver (`/api/catalog`, `/api/analyze`, `/api/search`, `DELETE /api/assets/:id`). |
| **BigQuery DDL & Vector Index Spec** | [`gcp/bigquery_schema.sql`](./gcp/bigquery_schema.sql) | Partitioned/clustered tables, `CREATE VECTOR INDEX`, remote `gemini-embedding-2` model, and Looker view. |
| **Cloud Run, Pub/Sub & Secret Manager CLI** | [`gcp/deploy.sh`](./gcp/deploy.sh) & [`Dockerfile`](./Dockerfile) | Automated provisioning for GCS (with 7-day lifecycle), Pub/Sub fan-out, Secret Manager, and Cloud Run. |
| **Secret Protection Templates** | [`.gitignore`](./.gitignore), [`.dockerignore`](./.dockerignore), [`.env.example`](./.env.example) | Prevents API keys and credentials from leaking to GitHub or container registries. |
