# ClipGuard (VividScale Multimodal AdTech POC)

Zero-Ops Multimodal Video Brand Safety, Timestamped Product Placement Extraction, Localized Ad Copy Generation, and Cross-Video Semantic Moment Search powered by **Google Cloud Run**, **Eventarc**, **Gemini 3.8 Flash**, **Gemini Embedding 2**, and **BigQuery Vector Search**.

> **Model Upgrade Note:** Per current Gemini API best practices, this POC substitutes the legacy/deprecated `gemini-1.5-flash` with **`gemini-3.8-flash`** (via the `@google/genai` Interactions API `client.interactions.create()` with enforced JSON Schema) and **`gemini-embedding-2`** (`client.models.embedContent()`).

---

## Quick Start (Dual-Mode: Works Out-of-the-Box + Live Gemini API)

```bash
npm install
npm start
```

Open **http://localhost:3000** in your browser.

- **Instant Pitch / Simulation Mode (Zero Config Required):** Explore 5 pre-indexed VividScale creator reels (TikTok, YouTube Shorts, Instagram Reels) with interactive timestamp seeking (`00:14`), live bounding boxes, GARM brand safety scorecards, 5-language localized ad copy, cross-video semantic moment search, and the interactive Unit Economics ROI calculator.
- **Live Gemini 3.8 Flash + Gemini Embedding 2 Mode:**
  - Set `GEMINI_API_KEY="your-key"` in your environment before running `npm start`, **or** click **"Dual-Mode Config"** in the top-right corner of the web UI to paste your key for the session.
  - Click **"+ Upload / Ingest Video (.mp4)"** to upload any real `.mp4` or `.webm` video and stream it directly to `gemini-3.8-flash` with strict JSON Schema enforcement.

---

## Project Structure

- [`server.js`](./server.js) — Express server & Cloud Run ingestion dispatcher (`GET /api/catalog`, `POST /api/analyze`, `POST /api/search`, `POST /eventarc/gcs-finalize`).
- [`src/geminiService.js`](./src/geminiService.js) — Live `@google/genai` integration using `gemini-3.8-flash` (`client.interactions.create` with `VIDEO_ANALYSIS_JSON_SCHEMA`) and `gemini-embedding-2` (`client.models.embedContent`), plus hybrid local vector search fallback.
- [`src/sampleCatalog.js`](./src/sampleCatalog.js) — Pre-loaded VividScale creator reels, GARM compliance breakdowns, product placements, 5-language ad copy, and timestamped moments.
- [`public/index.html`](./public/index.html), [`public/styles.css`](./public/styles.css), [`public/app.js`](./public/app.js) — Self-contained interactive frontend with a 60fps multimodal scene synthesizer, clickable timestamp scrubber, semantic moment search, ROI calculator, and Looker-style executive dashboard.
- [`gcp/bigquery_schema.sql`](./gcp/bigquery_schema.sql) — Production BigQuery DDL (`video_assets`, `video_moment_embeddings`, `CREATE VECTOR INDEX`, and Looker Studio dashboard view).
- [`gcp/deploy.sh`](./gcp/deploy.sh) & [`Dockerfile`](./Dockerfile) — Automated provisioning script for GCS, Eventarc `google.cloud.storage.object.v1.finalized` trigger, Cloud Run, and BigQuery.
