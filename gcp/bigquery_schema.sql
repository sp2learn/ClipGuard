-- ============================================================================
-- ClipGuard (VividScale) — BigQuery Analytics & Multimodal Vector Search DDL
-- Models: gemini-3.8-flash (Multimodal Analysis) + gemini-embedding-2 (Vector Search)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS `vividscale_analytics`
OPTIONS(
  description = "VividScale Multimodal AdTech Brand Safety, Product Placements & Semantic Video Index"
);

-- 1. Main Video Asset & Brand Safety Scorecard Table
CREATE TABLE IF NOT EXISTS `vividscale_analytics.video_assets` (
  video_id STRING NOT NULL,
  title STRING,
  creator_handle STRING,
  platform STRING,
  gcs_uri STRING NOT NULL,
  duration_seconds INT64,
  uploaded_at TIMESTAMP,
  processing_time_ms INT64,
  model_used STRING,
  brand_safety_score INT64,
  brand_safety_status STRING, -- 'SAFE', 'REVIEW', 'BLOCKED'
  verdict_label STRING,
  summary_rationale STRING,
  executive_summary STRING,
  garm_categories JSON,
  safety_flags JSON,
  product_placements JSON,
  localized_marketing JSON
)
PARTITION BY DATE(uploaded_at)
CLUSTER BY brand_safety_status, platform;

-- 2. Timestamped Video Moments Table with Multimodal Embeddings (gemini-embedding-2)
CREATE TABLE IF NOT EXISTS `vividscale_analytics.video_moment_embeddings` (
  moment_id STRING NOT NULL,
  video_id STRING NOT NULL,
  video_title STRING,
  creator_handle STRING,
  platform STRING,
  brand_safety_status STRING,
  start_seconds INT64,
  end_seconds INT64,
  timestamp_label STRING,
  visual_description STRING,
  audio_transcript STRING,
  ocr_text STRING,
  keywords ARRAY<STRING>,
  multimodal_embedding ARRAY<FLOAT64>,
  indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
CLUSTER BY video_id, brand_safety_status;

-- 3. Looker Studio Executive Brand Safety & Unit Economics View
CREATE OR REPLACE VIEW `vividscale_analytics.v_looker_brand_safety_dashboard` AS
SELECT
  DATE(uploaded_at) AS ingest_date,
  platform,
  brand_safety_status,
  COUNT(*) AS total_videos_processed,
  ROUND(AVG(brand_safety_score), 1) AS avg_brand_safety_score,
  ROUND(AVG(processing_time_ms) / 1000.0, 2) AS avg_latency_seconds,
  ROUND(COUNT(*) * 0.22, 2) AS legacy_pipeline_estimated_cost_usd,
  ROUND(COUNT(*) * 0.0325, 2) AS gemini_flash_actual_cost_usd,
  ROUND(COUNT(*) * (0.22 - 0.0041), 2) AS net_unit_cost_savings_usd
FROM `vividscale_analytics.video_assets`
GROUP BY ingest_date, platform, brand_safety_status;

-- ============================================================================
-- Enterprise Scale Extensions (Run after >5,000 embeddings & Vertex Connection)
-- ============================================================================
-- CREATE VECTOR INDEX IF NOT EXISTS `vividscale_moment_cosine_idx`
-- ON `vividscale_analytics.video_moment_embeddings`(multimodal_embedding)
-- OPTIONS(
--   index_type = 'IVF',
--   distance_type = 'COSINE',
--   ivf_options = '{"num_lists": 500}'
-- );
--
-- CREATE OR REPLACE MODEL `vividscale_analytics.gemini_embedding_2`
-- REMOTE WITH CONNECTION `us.vertex_ai_connection`
-- OPTIONS (
--   ENDPOINT = 'gemini-embedding-2'
-- );
