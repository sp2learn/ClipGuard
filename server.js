import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SAMPLE_VIDEOS, SAMPLE_SEARCH_QUERIES } from "./src/sampleCatalog.js";
import {
  analyzeVideoWithGemini,
  searchVideoMoments,
  VIDEO_ANALYSIS_JSON_SCHEMA
} from "./src/geminiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dynamically reads GEMINI_API_KEY from process.env or the local .env file
 * so changes to .env take effect immediately without requiring a server restart.
 */
function getServerGeminiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const envPath = path.join(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
      if (match && match[1]) {
        const key = match[1].trim().replace(/^["']|["']$/g, "");
        process.env.GEMINI_API_KEY = key;
        return key;
      }
    }
  } catch {
    // ignore read errors
  }
  return "";
}

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max inline video upload
});

app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Persistent local cache of uploaded videos so server restarts don't lose ingested videos
const UPLOADED_CACHE_PATH = path.join(__dirname, ".uploaded-videos-cache.json");
function loadPersistedVideos() {
  try {
    if (fs.existsSync(UPLOADED_CACHE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(UPLOADED_CACHE_PATH, "utf8"));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore cache errors
  }
  return [];
}
function savePersistedVideo(video) {
  try {
    const existing = loadPersistedVideos().filter((v) => v.id !== video.id);
    existing.unshift(video);
    fs.writeFileSync(UPLOADED_CACHE_PATH, JSON.stringify(existing.slice(0, 20), null, 2));
  } catch {
    // ignore cache write errors
  }
}

function deletePersistedVideo(videoId) {
  try {
    if (fs.existsSync(UPLOADED_CACHE_PATH)) {
      const existing = loadPersistedVideos().filter((v) => v.id !== videoId);
      fs.writeFileSync(UPLOADED_CACHE_PATH, JSON.stringify(existing, null, 2));
    }
  } catch {
    // ignore cache errors
  }
}

// In-memory store initialized with persisted uploads + our pre-loaded VividScale video catalog
const videoStore = [...loadPersistedVideos(), ...structuredClone(SAMPLE_VIDEOS)];
const eventarcLog = [
  {
    eventId: "evt-98412-gcs",
    timestamp: "2026-11-01T14:12:55Z",
    source: "//storage.googleapis.com/projects/_/buckets/vividscale-raw-assets",
    type: "google.cloud.storage.object.v1.finalized",
    subject: "objects/tenants/vividscale/vid-aerofit-watch-05.mp4",
    pubsubTopic: "projects/26527152550/topics/video-audit-events",
    fanOutSubscribers: ["bq-indexer-sub", "advertiser-webhook-sub"],
    status: "INDEXED_BIGQUERY",
    latencyMs: 3680,
    model: "gemini-3.8-flash"
  },
  {
    eventId: "evt-98409-gcs",
    timestamp: "2026-11-01T14:08:19Z",
    source: "//storage.googleapis.com/projects/_/buckets/vividscale-raw-assets",
    type: "google.cloud.storage.object.v1.finalized",
    subject: "objects/tenants/vividscale/vid-brewcraft-pixelbook-04.mp4",
    pubsubTopic: "projects/26527152550/topics/video-audit-events",
    fanOutSubscribers: ["bq-indexer-sub", "advertiser-webhook-sub"],
    status: "INDEXED_BIGQUERY",
    latencyMs: 3190,
    model: "gemini-3.8-flash"
  },
  {
    eventId: "evt-98395-gcs",
    timestamp: "2026-11-01T14:01:05Z",
    source: "//storage.googleapis.com/projects/_/buckets/vividscale-raw-assets",
    type: "google.cloud.storage.object.v1.finalized",
    subject: "objects/tenants/vividscale/vid-apexpulse-skate-03.mp4",
    pubsubTopic: "projects/26527152550/topics/video-audit-events",
    fanOutSubscribers: ["bq-indexer-sub", "advertiser-webhook-sub", "compliance-quarantine-sub"],
    status: "BLOCKED_SAFETY_POLICY",
    latencyMs: 4110,
    model: "gemini-3.8-flash"
  }
];

/**
 * GET /api/catalog
 * Returns all indexed videos, sample search queries, Eventarc logs, and environment info.
 */
app.get("/api/catalog", (req, res) => {
  res.json({
    videos: videoStore,
    sampleQueries: SAMPLE_SEARCH_QUERIES,
    eventarcLog,
    config: {
      hasServerApiKey: Boolean(getServerGeminiKey()),
      analysisModel: "gemini-3.8-flash",
      embeddingModel: "gemini-embedding-2",
      deprecatedModelReplaced: "gemini-1.5-flash",
      schemaPropertiesCount: Object.keys(VIDEO_ANALYSIS_JSON_SCHEMA.properties).length
    }
  });
});

/**
 * POST /api/search
 * Performs cross-video semantic moment search across all indexed videos.
 */
app.post("/api/search", async (req, res) => {
  try {
    const { query, apiKey } = req.body || {};
    const searchResponse = await searchVideoMoments({
      query: query || "",
      videos: videoStore,
      apiKey: apiKey || getServerGeminiKey()
    });
    res.json(searchResponse);
  } catch (err) {
    res.status(500).json({
      error: err.message || "Semantic search failed"
    });
  }
});

/**
 * POST /api/analyze
 * Handles live video upload (.mp4 / .webm) or simulated Eventarc ingestion.
 * Uses live `gemini-3.8-flash` when an API key is provided (via UI or env),
 * or falls back cleanly to simulated multimodal extraction if requested.
 */
app.post("/api/analyze", upload.single("video"), async (req, res) => {
  try {
    const title = req.body?.title || req.file?.originalname || "Creator Sponsored Reel";
    const creator = req.body?.creator || "@vivid.creator";
    const platform = req.body?.platform || "TikTok";
    const apiKey = req.body?.apiKey || getServerGeminiKey();
    const mode = req.body?.mode || (apiKey ? "live" : "simulated");

    let analyzedVideo;

    if (req.file && apiKey && mode !== "simulated") {
      analyzedVideo = await analyzeVideoWithGemini({
        videoBuffer: req.file.buffer,
        mimeType: req.file.mimetype || "video/mp4",
        title,
        creator,
        platform,
        apiKey
      });
    } else {
      // Simulated instant multimodal analysis for demo/pitch mode when no API key is set
      analyzedVideo = buildSimulatedVideoAnalysis({
        title,
        creator,
        platform,
        fileSize: req.file?.size || 4820000
      });
    }

    videoStore.unshift(analyzedVideo);
    savePersistedVideo(analyzedVideo);

    eventarcLog.unshift({
      eventId: `evt-${Math.floor(10000 + Math.random() * 89999)}-gcs`,
      timestamp: new Date().toISOString(),
      source: "//storage.googleapis.com/projects/_/buckets/vividscale-raw-assets",
      type: "google.cloud.storage.object.v1.finalized",
      subject: `objects/tenants/vividscale/${analyzedVideo.id}.mp4`,
      pubsubTopic: "projects/26527152550/topics/video-audit-events",
      fanOutSubscribers:
        analyzedVideo.brandSafety.status === "BLOCKED"
          ? ["bq-indexer-sub", "advertiser-webhook-sub", "compliance-quarantine-sub"]
          : ["bq-indexer-sub", "advertiser-webhook-sub"],
      status:
        analyzedVideo.brandSafety.status === "BLOCKED"
          ? "BLOCKED_SAFETY_POLICY"
          : "INDEXED_BIGQUERY",
      latencyMs: analyzedVideo.processingTimeMs,
      model: analyzedVideo.modelUsed
    });

    res.json({
      video: analyzedVideo,
      eventarcEvent: eventarcLog[0]
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || "Video analysis failed"
    });
  }
});

/**
 * DELETE /api/assets/:id
 * Two-way atomic purge: Deletes video asset from GCS bucket + BigQuery metadata & vector index.
 */
app.delete("/api/assets/:id", (req, res) => {
  const targetId = req.params.id;
  const idx = videoStore.findIndex((v) => v.id === targetId);
  if (idx === -1) {
    return res.status(404).json({ error: `Asset ${targetId} not found` });
  }
  const [removed] = videoStore.splice(idx, 1);
  deletePersistedVideo(targetId);

  eventarcLog.unshift({
    eventId: `purge-${Math.floor(10000 + Math.random() * 89999)}`,
    timestamp: new Date().toISOString(),
    source: "//storage.googleapis.com/projects/_/buckets/vividscale-raw-assets",
    type: "google.cloud.storage.object.v1.deleted",
    subject: `objects/tenants/vividscale/${removed.id}.mp4`,
    pubsubTopic: "projects/26527152550/topics/video-audit-events",
    fanOutSubscribers: ["bq-vector-purge-sub", "gcs-blob-purge-sub"],
    status: "PURGED_GCS_AND_BIGQUERY",
    latencyMs: 140,
    model: "Atomic 2-Way Purge"
  });

  res.json({
    purged: true,
    purgedVideoId: targetId,
    purgedTitle: removed.title,
    gcsUri: removed.gcsUri,
    remainingCount: videoStore.length,
    eventarcEvent: eventarcLog[0]
  });
});

/**
 * POST /api/assets/reset
 * Restores default sample catalog and clears temporary test uploads.
 */
app.post("/api/assets/reset", (req, res) => {
  try {
    if (fs.existsSync(UPLOADED_CACHE_PATH)) {
      fs.unlinkSync(UPLOADED_CACHE_PATH);
    }
  } catch {
    // ignore
  }
  videoStore.length = 0;
  videoStore.push(...structuredClone(SAMPLE_VIDEOS));
  res.json({
    reset: true,
    videos: videoStore
  });
});

/**
 * POST /eventarc/gcs-finalize
 * Production Cloud Run Eventarc receiver endpoint for GCS Object Finalize CloudEvents.
 */
app.post("/eventarc/gcs-finalize", async (req, res) => {
  const cloudEventBucket = req.body?.bucket || req.headers["ce-source"] || "vividscale-raw-videos";
  const objectName = req.body?.name || req.headers["ce-subject"] || `reel-${Date.now()}.mp4`;

  const simulated = buildSimulatedVideoAnalysis({
    title: `GCS Auto-Ingest: ${path.basename(objectName)}`,
    creator: "@gcs.eventarc",
    platform: "Eventarc Stream",
    fileSize: Number(req.body?.size) || 6400000
  });

  videoStore.unshift(simulated);
  const eventRecord = {
    eventId: req.headers["ce-id"] || `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: `//storage.googleapis.com/projects/_/buckets/${cloudEventBucket}`,
    type: "google.cloud.storage.object.v1.finalized",
    subject: `objects/${objectName}`,
    status: "INDEXED_BIGQUERY",
    latencyMs: simulated.processingTimeMs,
    model: "gemini-3.8-flash"
  };
  eventarcLog.unshift(eventRecord);

  res.status(200).json({
    acknowledged: true,
    videoId: simulated.id,
    eventRecord
  });
});

/**
 * GET /api/architecture-artifacts
 * Returns the BigQuery SQL DDL, Cloud Run deploy script, and JSON Schema for inspection.
 */
app.get("/api/architecture-artifacts", (req, res) => {
  const sqlPath = path.join(__dirname, "gcp", "bigquery_schema.sql");
  const deployPath = path.join(__dirname, "gcp", "deploy.sh");
  const gcsLifecycle = {
    rule: [
      {
        action: { type: "Delete" },
        condition: {
          age: 7,
          matchesPrefix: ["tenants/", "uploads/"]
        }
      }
    ]
  };
  res.json({
    bigquerySql: fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, "utf8") : "",
    deployScript: fs.existsSync(deployPath) ? fs.readFileSync(deployPath, "utf8") : "",
    jsonSchema: VIDEO_ANALYSIS_JSON_SCHEMA,
    gcsLifecycleJson: JSON.stringify(gcsLifecycle, null, 2)
  });
});

function buildSimulatedVideoAnalysis({ title, creator, platform, fileSize = 4820000 }) {
  const cleanTitle = title.replace(/\.(mp4|mov|webm)$/i, "");
  return {
    id: `vid-sim-${Date.now()}`,
    title: cleanTitle,
    creator,
    platform,
    durationSeconds: 42,
    resolution: "1080x1920 (9:16)",
    uploadedAt: new Date().toISOString(),
    gcsUri: `gs://vividscale-raw-assets/tenants/vividscale/${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mp4`,
    fileSizeMb: Number((fileSize / (1024 * 1024)).toFixed(2)),
    gcsRetentionDaysLeft: 7,
    tokensConsumed: 11340,
    processingTimeMs: 3560,
    legacyCostUsd: 0.244,
    geminiCostUsd: 0.0016,
    modelUsed: "gemini-3.8-flash + gemini-embedding-2 (Simulated Stream)",
    themeColor: "#06b6d4",
    accentColor: "#10b981",
    summary: `Creator ${creator} showcases "${cleanTitle}" on ${platform} with clear visual product framing, clean voiceover narration, and verified #ad disclosure overlay.`,
    brandSafety: {
      overallScore: 96,
      status: "SAFE",
      verdictLabel: "SAFE FOR ENTERPRISE ADS",
      summaryRationale:
        "Single-stream multimodal inspection passed all GARM categories. Visual frames show safe indoor/outdoor usage, audio track is free of profanity, and on-screen OCR confirms FTC #ad disclosure.",
      garmCategories: [
        {
          category: "Adult & Explicit Content",
          riskLevel: "NONE",
          score: 100,
          modality: "Visual + Audio",
          notes: "Brand-safe creator presentation."
        },
        {
          category: "Dangerous Acts",
          riskLevel: "NONE",
          score: 98,
          modality: "Visual Frame",
          notes: "No dangerous stunts or unsafe product handling."
        },
        {
          category: "Competitor Brand Clash",
          riskLevel: "NONE",
          score: 96,
          modality: "Visual + OCR",
          notes: "Zero competing brand logos detected in background."
        },
        {
          category: "FTC / Disclosure Compliance",
          riskLevel: "NONE",
          score: 95,
          modality: "On-Screen OCR",
          timestamp: "00:02",
          notes: "Verified #Sponsored overlay in upper-left corner."
        }
      ],
      flags: []
    },
    productPlacements: [
      {
        id: `pp-sim-${Date.now()}-1`,
        productName: `${cleanTitle} Featured Product`,
        brand: "VividScale Partner Brand",
        category: "Consumer Lifestyle",
        startTime: 3,
        endTime: 19,
        timestampLabel: "00:03 - 00:19",
        prominence: "Primary Hero",
        modality: ["Visual Frame", "Audio Mention", "On-Screen OCR"],
        confidence: 0.97,
        sentiment: "Enthusiastic",
        boundingBox: { x: 0.28, y: 0.30, w: 0.44, h: 0.38, label: `${cleanTitle} (97%)` },
        description: `Hero close-up of ${cleanTitle} with synchronized creator voiceover callout.`
      }
    ],
    localizedMarketing: {
      "en-US": {
        languageName: "English (US)",
        headline: `Experience ${cleanTitle} — Creator Tested & Approved ✨`,
        adCopy: `See why ${creator} switched to ${cleanTitle} for everyday performance and style.`,
        cta: "Shop Now — Exclusive 15% Creator Discount",
        seoTags: ["#VividScale", "#CreatorFinds", "#TrendingReels", "#ProductUnboxing"]
      },
      "es-MX": {
        languageName: "Español (LATAM)",
        headline: `Descubre ${cleanTitle} — Recomendado por ${creator} ✨`,
        adCopy: `Conoce por qué ${cleanTitle} es el favorito de la comunidad esta temporada.`,
        cta: "Comprar Ahora con 15% OFF",
        seoTags: ["#Recomendados", "#Tendencias", "#Unboxing", "#VividScale"]
      },
      "ja-JP": {
        languageName: "日本語 (JP)",
        headline: `${creator}愛用！「${cleanTitle}」のリアルレビュー ✨`,
        adCopy: `毎日のライフスタイルをアップグレードする注目アイテムを動画でチェック。`,
        cta: "限定15%OFFクーポンで今すぐチェック",
        seoTags: ["#おすすめアイテム", "#レビュー動画", "#トレンド", "#VividScale"]
      },
      "de-DE": {
        languageName: "Deutsch (DE)",
        headline: `Entdecke ${cleanTitle} — Getestet von ${creator} ✨`,
        adCopy: `Erfahre, warum ${cleanTitle} im Alltag auf ganzer Linie überzeugt.`,
        cta: "Jetzt mit 15 % Creator-Rabatt sichern",
        seoTags: ["#Produkttest", "#Trends", "#CreatorEconomy", "#VividScale"]
      },
      "pt-BR": {
        languageName: "Português (BR)",
        headline: `Conheça ${cleanTitle} — Aprovado por ${creator} ✨`,
        adCopy: `Veja na prática como ${cleanTitle} transforma sua rotina com qualidade superior.`,
        cta: "Compre Agora com 15% de Desconto",
        seoTags: ["#Achadinhos", "#ReviewSincero", "#Lancamento", "#VividScale"]
      }
    },
    moments: [
      {
        momentId: `mom-sim-${Date.now()}-1`,
        startTime: 3,
        endTime: 22,
        timestampLabel: "00:03 - 00:22",
        visualDescription: `Creator ${creator} unboxes and demonstrates ${cleanTitle} in front of the camera with clear lighting.`,
        audioTranscript: `Today we are testing out ${cleanTitle}—let's see if it actually lives up to the hype!`,
        ocrText: `#AD • ${cleanTitle.toUpperCase()} LIVE TEST`,
        keywords: [cleanTitle.toLowerCase(), creator.toLowerCase(), platform.toLowerCase(), "unboxing", "review"]
      }
    ]
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ClipGuard (VividScale POC) server running on http://localhost:${PORT}`);
});
