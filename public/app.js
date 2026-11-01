/**
 * ClipGuard (VividScale POC) — Client Application
 * Connects to /api/catalog, /api/search, /api/analyze, /eventarc/gcs-finalize, and /api/architecture-artifacts
 */

const state = {
  videos: [],
  sampleQueries: [],
  eventarcLog: [],
  activeVideoId: null,
  activeLocale: "en-US",
  currentTime: 14,
  isPlaying: false,
  lastTick: 0,
  sessionApiKey: "",
  serverHasApiKey: false,
  artifacts: {
    bigquerySql: "",
    deployScript: "",
    jsonSchema: {}
  },
  activeArtifactTab: "sql",
  uploadedObjectUrlByVideoId: new Map(),
  prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

// DOM References
const navTabs = document.querySelectorAll(".nav-tab");
const tabViews = {
  analyzer: document.getElementById("view-analyzer"),
  search: document.getElementById("view-search"),
  assets: document.getElementById("view-assets"),
  economics: document.getElementById("view-economics"),
  dashboard: document.getElementById("view-dashboard")
};

// Executive Telemetry Ribbon DOM
const teleLatency = document.getElementById("tele-latency");
const teleLatencyDelta = document.getElementById("tele-latency-delta");
const teleCost = document.getElementById("tele-cost");
const teleCostDelta = document.getElementById("tele-cost-delta");
const teleSafety = document.getElementById("tele-safety");
const teleSafetySub = document.getElementById("tele-safety-sub");
const teleTokens = document.getElementById("tele-tokens");
const teleTokensSub = document.getElementById("tele-tokens-sub");
const operationalJsonCode = document.getElementById("operational-json-code");

// Asset Manager DOM
const assetsManagerTableWrap = document.getElementById("assets-manager-table-wrap");
const purgeToastBanner = document.getElementById("purge-toast-banner");
const resetCatalogBtn = document.getElementById("reset-catalog-btn");

const reelSelectorList = document.getElementById("reel-selector-list");
const catalogCountLabel = document.getElementById("catalog-count-label");
const playerPlatformPill = document.getElementById("player-platform-pill");
const playerVideoTitle = document.getElementById("player-video-title");
const playerCreatorMeta = document.getElementById("player-creator-meta");
const playerLatencyVal = document.getElementById("player-latency-val");
const playerCostVal = document.getElementById("player-cost-val");

const nativeVideoEl = document.getElementById("native-video-player");
const canvas = document.getElementById("multimodal-stage-canvas");
const ctx = canvas.getContext("2d");

const playPauseBtn = document.getElementById("play-pause-btn");
const timecodeReadout = document.getElementById("timecode-readout");
const timelineSlider = document.getElementById("timeline-slider");
const timelineMarkers = document.getElementById("timeline-markers");

const liveVisualDesc = document.getElementById("live-visual-desc");
const liveAudioTranscript = document.getElementById("live-audio-transcript");
const liveOcrText = document.getElementById("live-ocr-text");

const safetyScoreBadge = document.getElementById("safety-score-badge");
const safetyScoreNum = document.getElementById("safety-score-num");
const safetyVerdictBanner = document.getElementById("safety-verdict-banner");
const safetyVerdictLabel = document.getElementById("safety-verdict-label");
const safetySummaryRationale = document.getElementById("safety-summary-rationale");
const safetyFlagsContainer = document.getElementById("safety-flags-container");
const garmCategoriesGrid = document.getElementById("garm-categories-grid");

const placementsCountBadge = document.getElementById("placements-count-badge");
const placementsList = document.getElementById("placements-list");

const localeButtons = document.querySelectorAll(".locale-btn");
const localizedCard = document.getElementById("localized-card");

// Search DOM
const semanticSearchForm = document.getElementById("semantic-search-form");
const semanticSearchInput = document.getElementById("semantic-search-input");
const presetQueryChips = document.getElementById("preset-query-chips");
const searchResultsList = document.getElementById("search-results-list");
const searchLatencyLabel = document.getElementById("search-latency-label");
const searchBigquerySql = document.getElementById("search-bigquery-sql");
const embeddingModeBadge = document.getElementById("embedding-mode-badge");

// Economics & Architecture DOM
const calcDailyVideos = document.getElementById("calc-daily-videos");
const calcDailyVideosVal = document.getElementById("calc-daily-videos-val");
const awsRekMod = document.getElementById("aws-rek-mod");
const awsRekLabel = document.getElementById("aws-rek-label");
const awsTranscribe = document.getElementById("aws-transcribe");
const awsBedrock = document.getElementById("aws-bedrock");
const awsEc2 = document.getElementById("aws-ec2");
const gcpVisionCost = document.getElementById("gcp-vision-cost");
const gcpSttCost = document.getElementById("gcp-stt-cost");
const gcpGeminiCost = document.getElementById("gcp-gemini-cost");
const gcpRunBqCost = document.getElementById("gcp-run-bq-cost");
const legUnitCost = document.getElementById("leg-unit-cost");
const legDailyCost = document.getElementById("leg-daily-cost");
const legAnnualCost = document.getElementById("leg-annual-cost");
const gcpUnitCost = document.getElementById("gcp-unit-cost");
const gcpDailyCost = document.getElementById("gcp-daily-cost");
const gcpAnnualCost = document.getElementById("gcp-annual-cost");
const netAnnualSavings = document.getElementById("net-annual-savings");
const netMonthlySavings = document.getElementById("net-monthly-savings");
const savingsPctBadge = document.getElementById("savings-pct-badge");
const tcoBreakdownTableWrap = document.getElementById("tco-breakdown-table-wrap");
const artifactSubtabs = document.querySelectorAll(".subtab-btn");
const artifactCaption = document.getElementById("artifact-caption");
const artifactCodeBlock = document.getElementById("artifact-code-block");

// Dashboard DOM
const dashboardKpiRow = document.getElementById("dashboard-kpi-row");
const dashboardComplianceTableWrap = document.getElementById("dashboard-compliance-table-wrap");
const eventarcLogList = document.getElementById("eventarc-log-list");
const simulateEventarcBtn = document.getElementById("simulate-eventarc-btn");

// Modals
const uploadModal = document.getElementById("upload-modal");
const openUploadModalBtn = document.getElementById("open-upload-modal-btn");
const cancelUploadBtn = document.getElementById("cancel-upload-btn");
const uploadVideoForm = document.getElementById("upload-video-form");
const uploadProgressBox = document.getElementById("upload-progress-box");
const uploadStatusText = document.getElementById("upload-status-text");
const uploadProgressBar = document.getElementById("upload-progress-bar");

const settingsModal = document.getElementById("settings-modal");
const openSettingsModalBtn = document.getElementById("open-settings-modal-btn");
const settingsForm = document.getElementById("settings-form");
const geminiApiKeyInput = document.getElementById("gemini-api-key-input");
const clearKeyBtn = document.getElementById("clear-key-btn");
const apiStatusLabel = document.getElementById("api-status-label");

function formatSeconds(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const mins = String(Math.floor(s / 60)).padStart(2, "0");
  const rem = String(s % 60).padStart(2, "0");
  return `${mins}:${rem}`;
}

function getActiveVideo() {
  return state.videos.find((v) => v.id === state.activeVideoId) || state.videos[0];
}

function switchTab(tabName) {
  navTabs.forEach((btn) => {
    const active = btn.dataset.tab === tabName;
    btn.classList.toggle("active", active);
    if (active) {
      btn.setAttribute("aria-current", "page");
    } else {
      btn.removeAttribute("aria-current");
    }
  });

  Object.entries(tabViews).forEach(([key, section]) => {
    if (key === tabName) {
      section.hidden = false;
      section.classList.add("active");
    } else {
      section.hidden = true;
      section.classList.remove("active");
    }
  });
}

function updateApiStatusBadge() {
  const isLive = Boolean(state.sessionApiKey || state.serverHasApiKey);
  apiStatusLabel.textContent = isLive ? "Live Gemini 3.8 API Ready" : "Dual-Mode (Sim + Live)";
}

/**
 * Renders the left-hand list of indexed creator videos
 */
function renderReelSelector() {
  catalogCountLabel.textContent = `${state.videos.length} reels indexed`;
  reelSelectorList.innerHTML = "";

  state.videos.forEach((video) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `reel-item-btn ${video.id === state.activeVideoId ? "active" : ""}`;

    const statusBadgeClass =
      video.brandSafety?.status === "SAFE"
        ? "badge-success"
        : video.brandSafety?.status === "REVIEW"
        ? "badge-warning"
        : "badge-danger";

    btn.innerHTML = `
      <div>
        <span class="reel-item-title">${escapeHtml(video.title)}</span>
        <span class="reel-item-sub">${escapeHtml(video.creator)} • ${escapeHtml(video.platform)} • ${video.durationSeconds}s</span>
      </div>
      <span class="badge ${statusBadgeClass}">${video.brandSafety?.status || "SAFE"} (${video.brandSafety?.overallScore ?? 95})</span>
    `;

    btn.addEventListener("click", () => {
      selectVideo(video.id, 0);
    });

    li.appendChild(btn);
    reelSelectorList.appendChild(li);
  });
}

/**
 * Selects a video and optionally seeks to a specific timestamp in seconds
 */
function selectVideo(videoId, seekSeconds = null) {
  state.activeVideoId = videoId;
  const video = getActiveVideo();
  if (!video) return;

  // Default to an interesting hero moment if seekSeconds not provided
  if (seekSeconds !== null) {
    state.currentTime = seekSeconds;
  } else if (video.productPlacements?.length > 1) {
    state.currentTime = video.productPlacements[1].startTime;
  } else {
    state.currentTime = 4;
  }

  timelineSlider.max = String(video.durationSeconds || 60);
  timelineSlider.value = String(state.currentTime);

  // Check if this video has an uploaded native MP4 blob URL
  const uploadedBlobUrl = state.uploadedObjectUrlByVideoId.get(video.id);
  if (uploadedBlobUrl) {
    nativeVideoEl.src = uploadedBlobUrl;
    nativeVideoEl.currentTime = state.currentTime;
    nativeVideoEl.classList.remove("hidden");
    canvas.classList.add("hidden");
  } else {
    nativeVideoEl.pause();
    nativeVideoEl.classList.add("hidden");
    canvas.classList.remove("hidden");
  }

  renderReelSelector();
  renderActiveVideoIntelligence();
  updateTimecodeAndLiveReadout();
  drawSynthesizedVideoFrame();
}

/**
 * Populates the right-hand Brand Safety Scorecard, Product Placements, and Localized Ad Copy panels
 */
function renderActiveVideoIntelligence() {
  const video = getActiveVideo();
  if (!video) return;

  playerPlatformPill.textContent = video.platform;
  playerVideoTitle.textContent = video.title;
  playerCreatorMeta.textContent = `${video.creator} • ${video.gcsUri}`;
  const latencySec = (video.processingTimeMs || 3680) / 1000;
  const gcpUnit = Number(video.geminiCostUsd || 0.0016);
  const awsUnit = Number(video.legacyCostUsd || 0.244);
  const tokens = Number(video.tokensConsumed) || Math.round((video.durationSeconds || 45) * 258 + 520);

  playerLatencyVal.textContent = `${latencySec.toFixed(2)}s`;
  playerCostVal.textContent = `$${gcpUnit.toFixed(4)}`;

  // Populate Top Executive Telemetry Ribbon (CPO + CIO dual persona metrics)
  if (teleLatency) {
    teleLatency.textContent = `${latencySec.toFixed(2)}s`;
    const savedSec = Math.max(120, Math.round(180 - latencySec));
    teleLatencyDelta.textContent = `-${savedSec}s vs. AWS Rekognition/STT (~45x faster)`;
  }
  if (teleCost) {
    teleCost.textContent = `$${gcpUnit.toFixed(4)}`;
    const pctSaved = ((1 - gcpUnit / awsUnit) * 100).toFixed(1);
    teleCostDelta.textContent = `-${pctSaved}% vs. AWS ($${awsUnit.toFixed(4)}/video)`;
  }
  if (teleSafety) {
    const status = video.brandSafety?.status || "SAFE";
    const score = video.brandSafety?.overallScore ?? 96;
    teleSafety.textContent = `${score}% ${status}`;
    teleSafety.style.color =
      status === "SAFE" ? "#10b981" : status === "REVIEW" ? "#f59e0b" : "#ef4444";
    teleSafetySub.textContent = video.brandSafety?.verdictLabel || "GARM Multimodal Policy Check";
  }
  if (teleTokens) {
    teleTokens.textContent = tokens.toLocaleString();
    teleTokensSub.textContent = `${video.durationSeconds || 45}s Audio+Video+OCR -> 1 JSON Pass`;
  }
  if (operationalJsonCode) {
    const cleanPayload = {
      videoId: video.id,
      title: video.title,
      creator: video.creator,
      platform: video.platform,
      gcsUri: video.gcsUri,
      modelUsed: video.modelUsed,
      processingTimeMs: video.processingTimeMs,
      tokensConsumed: tokens,
      brandSafety: video.brandSafety,
      productPlacements: video.productPlacements,
      localizedMarketing: video.localizedMarketing,
      moments: (video.moments || []).map(({ _embedding, ...rest }) => rest)
    };
    operationalJsonCode.textContent = JSON.stringify(cleanPayload, null, 2);
  }

  // Timeline markers for moments & flags
  timelineMarkers.innerHTML = "";
  (video.productPlacements || []).forEach((pp) => {
    const marker = document.createElement("button");
    marker.type = "button";
    const isConflict = pp.prominence?.includes("Conflict");
    marker.className = `marker-pill ${isConflict ? "marker-danger" : ""}`;
    marker.textContent = `🎯 ${formatSeconds(pp.startTime)} ${pp.productName.split(" ").slice(0, 3).join(" ")}`;
    marker.addEventListener("click", () => {
      seekToSecond(pp.startTime);
    });
    timelineMarkers.appendChild(marker);
  });

  (video.brandSafety?.flags || []).forEach((flag) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "marker-pill marker-danger";
    marker.textContent = `⚠️ ${formatSeconds(flag.startTime)} ${flag.category.split("/")[0].trim()}`;
    marker.addEventListener("click", () => {
      seekToSecond(flag.startTime);
    });
    timelineMarkers.appendChild(marker);
  });

  // 1. Brand Safety Scorecard
  const bs = video.brandSafety || {};
  safetyScoreNum.textContent = bs.overallScore ?? 95;
  safetyScoreBadge.className = `safety-score-badge status-${bs.status || "SAFE"}`;
  safetyVerdictBanner.className = `verdict-banner status-${bs.status || "SAFE"}`;
  safetyVerdictLabel.textContent = bs.verdictLabel || "SAFE FOR ENTERPRISE ADS";
  safetySummaryRationale.textContent = bs.summaryRationale || video.summary;

  safetyFlagsContainer.innerHTML = "";
  (bs.flags || []).forEach((flag) => {
    const card = document.createElement("div");
    card.className = "flag-alert-card";
    card.innerHTML = `
      <div class="flag-alert-header">
        <strong>🚨 ${escapeHtml(flag.category)} (${escapeHtml(flag.modality)})</strong>
        <button type="button" class="seek-timestamp-btn" data-seek="${flag.startTime}">
          Seek ${escapeHtml(flag.timestamp)}
        </button>
      </div>
      <p style="margin:0.2rem 0;color:#fecaca;">${escapeHtml(flag.quote)}</p>
      <p class="text-muted" style="margin:0;"><strong>Remediation:</strong> ${escapeHtml(flag.remediation)}</p>
    `;
    card.querySelector(".seek-timestamp-btn").addEventListener("click", () => {
      seekToSecond(flag.startTime);
    });
    safetyFlagsContainer.appendChild(card);
  });

  garmCategoriesGrid.innerHTML = "";
  (bs.garmCategories || []).forEach((cat) => {
    const riskBadge =
      cat.riskLevel === "NONE"
        ? "badge-success"
        : cat.riskLevel === "MEDIUM"
        ? "badge-warning"
        : "badge-danger";
    const div = document.createElement("div");
    div.className = "garm-card";
    div.innerHTML = `
      <div class="garm-card-top">
        <span class="garm-title">${escapeHtml(cat.category)}</span>
        <span class="badge ${riskBadge}">${escapeHtml(cat.riskLevel)} (${cat.score}/100)</span>
      </div>
      <span class="badge badge-subtle">${escapeHtml(cat.modality)}${cat.timestamp ? ` • ${escapeHtml(cat.timestamp)}` : ""}</span>
      <p class="garm-notes">${escapeHtml(cat.notes)}</p>
    `;
    garmCategoriesGrid.appendChild(div);
  });

  // 2. Timestamped Product Placements
  const placements = video.productPlacements || [];
  placementsCountBadge.textContent = `${placements.length} detected`;
  placementsList.innerHTML = "";

  placements.forEach((pp) => {
    const card = document.createElement("div");
    card.className = "placement-card";
    const modalityPills = (pp.modality || [])
      .map((m) => `<span class="badge badge-subtle">${escapeHtml(m)}</span>`)
      .join(" ");

    card.innerHTML = `
      <div>
        <strong>${escapeHtml(pp.productName)}</strong>
        <span class="text-muted"> — ${escapeHtml(pp.brand)} (${escapeHtml(pp.category)})</span>
        <p class="text-muted" style="margin:0.25rem 0;">${escapeHtml(pp.description)}</p>
        <div class="placement-meta-row">
          <span class="badge badge-accent">${escapeHtml(pp.prominence)}</span>
          ${modalityPills}
          <span class="badge badge-success">${Math.round((pp.confidence || 0.96) * 100)}% conf</span>
        </div>
      </div>
      <button type="button" class="seek-timestamp-btn">
        ▶ ${escapeHtml(pp.timestampLabel)}
      </button>
    `;

    card.querySelector(".seek-timestamp-btn").addEventListener("click", () => {
      seekToSecond(pp.startTime);
    });
    placementsList.appendChild(card);
  });

  // 3. Localized Ad Copy
  renderLocalizedMarketing();
}

function renderLocalizedMarketing() {
  const video = getActiveVideo();
  if (!video || !video.localizedMarketing) return;

  const entry =
    video.localizedMarketing[state.activeLocale] ||
    video.localizedMarketing["en-US"] ||
    Object.values(video.localizedMarketing)[0];

  if (!entry) return;

  const tagsHtml = (entry.seoTags || [])
    .map((t) => `<span class="seo-hashtag">${escapeHtml(t)}</span>`)
    .join("");

  localizedCard.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
      <span class="badge badge-accent">${escapeHtml(entry.languageName)}</span>
      <span class="text-muted">Generated in 1 pass via Gemini 3.8 Flash JSON Schema</span>
    </div>
    <h3 class="localized-headline">${escapeHtml(entry.headline)}</h3>
    <p class="localized-copy">${escapeHtml(entry.adCopy)}</p>
    <div>
      <span class="badge badge-success">Recommended CTA: ${escapeHtml(entry.cta)}</span>
    </div>
    <div class="tag-cloud">${tagsHtml}</div>
  `;
}

function seekToSecond(seconds) {
  const video = getActiveVideo();
  if (!video) return;
  state.currentTime = Math.max(0, Math.min(video.durationSeconds || 60, Number(seconds) || 0));
  timelineSlider.value = String(state.currentTime);
  if (!nativeVideoEl.classList.contains("hidden")) {
    nativeVideoEl.currentTime = state.currentTime;
  }
  updateTimecodeAndLiveReadout();
  drawSynthesizedVideoFrame();
}

function updateTimecodeAndLiveReadout() {
  const video = getActiveVideo();
  if (!video) return;
  const sec = state.currentTime;
  timecodeReadout.textContent = `${formatSeconds(sec)} / ${formatSeconds(video.durationSeconds)}`;

  // Find active moment for current timestamp
  const activeMoment =
    (video.moments || []).find((m) => sec >= m.startTime && sec <= m.endTime) ||
    (video.moments || [])[0];

  if (activeMoment) {
    liveVisualDesc.textContent = activeMoment.visualDescription;
    liveAudioTranscript.textContent = `"${activeMoment.audioTranscript}"`;
    liveOcrText.textContent = activeMoment.ocrText;
  }
}

/**
 * Renders an interactive 60fps multimodal preview frame on #multimodal-stage-canvas
 * showing the active creator scene, animated background, on-screen OCR banner,
 * audio waveform, and live Gemini 3.8 Flash object bounding boxes.
 */
function drawSynthesizedVideoFrame() {
  const video = getActiveVideo();
  if (!video || canvas.classList.contains("hidden")) return;

  const w = canvas.width;
  const h = canvas.height;
  const sec = state.currentTime;

  // Background gradient tailored to the video's theme
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0b132b");
  grad.addColorStop(0.55, video.themeColor || "#0ea5e9");
  grad.addColorStop(1, "#020617");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Draw stylized scene graphics based on video ID & timestamp
  drawSceneIllustration(ctx, video, sec, w, h);

  // Top TikTok/Reels HUD bar
  ctx.fillStyle = "rgba(2, 6, 23, 0.72)";
  ctx.fillRect(12, 14, w - 24, 46);
  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.strokeRect(12, 14, w - 24, 46);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.fillText(`GEMINI 3.8 FLASH NATIVE STREAM • ${video.platform.toUpperCase()}`, 22, 32);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "11px ui-monospace, monospace";
  ctx.fillText(`${video.creator}  |  t=${sec.toFixed(1)}s`, 22, 49);

  // Active moment OCR overlay
  const activeMoment =
    (video.moments || []).find((m) => sec >= m.startTime && sec <= m.endTime) ||
    (video.moments || [])[0];

  if (activeMoment?.ocrText) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(18, 74, w - 36, 32);
    ctx.strokeStyle = "#10b981";
    ctx.strokeRect(18, 74, w - 36, 32);

    ctx.fillStyle = "#6ee7b7";
    ctx.font = "bold 10px ui-monospace, monospace";
    ctx.fillText(`OCR: ${activeMoment.ocrText.slice(0, 44)}`, 26, 94);
  }

  // Draw active Product Placement Bounding Boxes for current timestamp
  const activePlacements = (video.productPlacements || []).filter(
    (pp) => sec >= pp.startTime && sec <= pp.endTime
  );
  const placementsToDraw =
    activePlacements.length > 0 ? activePlacements : (video.productPlacements || []).slice(0, 1);

  placementsToDraw.forEach((pp) => {
    const box = pp.boundingBox || { x: 0.22, y: 0.3, w: 0.56, h: 0.36, label: pp.productName };
    const bx = box.x * w;
    const by = box.y * h;
    const bw = box.w * w;
    const bh = box.h * h;

    const isConflict = pp.prominence?.includes("Conflict");
    ctx.strokeStyle = isConflict ? "#ef4444" : "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([]);

    // Label pill
    const labelText = box.label || pp.productName;
    ctx.fillStyle = isConflict ? "rgba(239, 68, 68, 0.92)" : "rgba(14, 165, 233, 0.92)";
    ctx.fillRect(bx, by - 22, Math.min(bw + 40, w - bx - 10), 22);
    ctx.fillStyle = "#020617";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.fillText(labelText.slice(0, 32), bx + 6, by - 7);
  });

  // Check if a Brand Safety Flag is active at this timestamp
  const activeFlag = (video.brandSafety?.flags || []).find(
    (f) => Math.abs(sec - f.startTime) <= 6
  );
  if (activeFlag) {
    ctx.fillStyle = "rgba(220, 38, 38, 0.92)";
    ctx.fillRect(16, h - 155, w - 32, 42);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText(`⚠️ SAFETY FLAG: ${activeFlag.category.slice(0, 34)}`, 24, h - 137);
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText(`Modality: ${activeFlag.modality} (${activeFlag.timestamp})`, 24, h - 121);
  }

  // Bottom Audio Waveform & Speech Caption Box
  ctx.fillStyle = "rgba(2, 6, 23, 0.86)";
  ctx.fillRect(12, h - 102, w - 24, 88);
  ctx.strokeStyle = "rgba(168, 85, 247, 0.45)";
  ctx.strokeRect(12, h - 102, w - 24, 88);

  // Animated audio bars
  const barCount = 28;
  for (let i = 0; i < barCount; i++) {
    const wave = Math.abs(Math.sin(sec * 3.5 + i * 0.45));
    const barH = 6 + wave * 16;
    ctx.fillStyle = i % 2 === 0 ? "#a855f7" : "#38bdf8";
    ctx.fillRect(24 + i * 11, h - 76 - barH / 2, 6, barH);
  }

  ctx.fillStyle = "#f8fafc";
  ctx.font = "11px Inter, sans-serif";
  const transcript = activeMoment?.audioTranscript || video.summary || "";
  wrapCanvasText(ctx, `"${transcript}"`, 22, h - 46, w - 44, 14, 2);
}

function drawSceneIllustration(ctx, video, sec, w, h) {
  ctx.save();
  if (video.id.includes("voltdrive")) {
    // Desert horizon + EV SUV + Red FizzPop Soda Can
    ctx.fillStyle = "rgba(251, 146, 60, 0.22)";
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Electric SUV silhouette
    ctx.fillStyle = "#1e3a8a";
    ctx.beginPath();
    ctx.roundRect(w * 0.14, h * 0.44, w * 0.68, h * 0.22, 16);
    ctx.fill();
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing EV charging port pulsing green
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(w * 0.24, h * 0.52, 8 + Math.sin(sec * 5) * 2, 0, Math.PI * 2);
    ctx.fill();

    // Crimson FizzPop Soda Can held by creator
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.roundRect(w * 0.55, h * 0.31, w * 0.18, h * 0.22, 8);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText("FizzPop", w * 0.57, h * 0.42);
  } else if (video.id.includes("glowlab")) {
    // Amber Vitamin C dropper bottle
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.roundRect(w * 0.36, h * 0.34, w * 0.28, h * 0.36, 12);
    ctx.fill();
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(w * 0.4, h * 0.44, w * 0.2, h * 0.14);
    ctx.fillStyle = "#78350f";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText("GlowLab C", w * 0.41, h * 0.52);
  } else if (video.id.includes("apexpulse")) {
    // Neon green energy can + Competitor sign in corner
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.roundRect(w * 0.4, h * 0.27, w * 0.22, h * 0.3, 8);
    ctx.fill();
    ctx.fillStyle = "#020617";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText("APEX", w * 0.45, h * 0.42);

    // Competitor neon sign
    ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
    ctx.fillRect(w * 0.63, h * 0.14, w * 0.28, h * 0.16);
    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.fillText("VOLTBULL", w * 0.66, h * 0.23);
  } else if (video.id.includes("brewcraft")) {
    // Cold brew glass + PixelBook laptop
    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.roundRect(w * 0.2, h * 0.36, w * 0.22, h * 0.32, 8);
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.roundRect(w * 0.46, h * 0.28, w * 0.42, h * 0.36, 8);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(w * 0.49, h * 0.31, w * 0.36, h * 0.26);
  } else {
    // AeroFit Smartwatch dial
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.roundRect(w * 0.3, h * 0.38, w * 0.4, h * 0.28, 22);
    ctx.fill();
    ctx.fillStyle = "#14b8a6";
    ctx.font = "bold 16px ui-monospace, monospace";
    ctx.fillText("154 BPM", w * 0.38, h * 0.52);
  }
  ctx.restore();
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(" ");
  let line = "";
  let linesDrawn = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = context.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      context.fillText(line, x, y + linesDrawn * lineHeight);
      line = words[n] + " ";
      linesDrawn++;
      if (linesDrawn >= maxLines - 1) {
        break;
      }
    } else {
      line = testLine;
    }
  }
  context.fillText(line.trim(), x, y + linesDrawn * lineHeight);
}

/**
 * Playback animation loop
 */
function tickPlayback(timestamp) {
  if (!state.lastTick) state.lastTick = timestamp;
  const deltaSec = (timestamp - state.lastTick) / 1000;
  state.lastTick = timestamp;

  if (state.isPlaying) {
    const video = getActiveVideo();
    const maxDur = video?.durationSeconds || 60;
    state.currentTime += deltaSec;
    if (state.currentTime >= maxDur) {
      state.currentTime = 0;
    }
    timelineSlider.value = String(state.currentTime);
    updateTimecodeAndLiveReadout();
    drawSynthesizedVideoFrame();
  }

  requestAnimationFrame(tickPlayback);
}

/**
 * Cross-Video Semantic Moment Search
 */
async function executeSemanticSearch(queryText) {
  if (!queryText.trim()) return;
  semanticSearchInput.value = queryText;

  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: queryText,
      apiKey: state.sessionApiKey
    })
  });
  const data = await response.json();

  embeddingModeBadge.textContent = data.embeddingModel || "gemini-embedding-2";
  searchLatencyLabel.textContent = `Returned ${data.results?.length || 0} moments in ${data.latencyMs || 19}ms`;
  searchBigquerySql.textContent = data.bigQuerySql || "";

  searchResultsList.innerHTML = "";
  (data.results || []).forEach((hit, idx) => {
    const card = document.createElement("div");
    card.className = "search-hit-card";
    const pct = Math.round(hit.similarityScore * 100);
    const modBadges = (hit.matchedModalities || [])
      .map((m) => `<span class="badge badge-subtle">${escapeHtml(m)}</span>`)
      .join(" ");

    card.innerHTML = `
      <div class="search-hit-top">
        <div>
          <span class="badge badge-accent">#${idx + 1} Match • ${pct}% Cosine Similarity</span>
          <span class="badge badge-subtle">${escapeHtml(hit.platform)}</span>
          <h4 style="margin:0.35rem 0 0.1rem;font-size:0.92rem;">${escapeHtml(hit.videoTitle)} (${escapeHtml(hit.creator)})</h4>
        </div>
        <button type="button" class="btn btn-primary btn-sm jump-moment-btn">
          ▶ Jump to ${escapeHtml(hit.timestampLabel)}
        </button>
      </div>
      <p style="margin:0.35rem 0;font-size:0.83rem;color:#e2e8f0;">
        <strong>Visual Scene:</strong> ${escapeHtml(hit.visualDescription)}
      </p>
      <p class="text-muted" style="margin:0.2rem 0;">
        <strong>Audio:</strong> "${escapeHtml(hit.audioTranscript)}" • <strong>OCR:</strong> <code>${escapeHtml(hit.ocrText)}</code>
      </p>
      <div style="margin-top:0.45rem;display:flex;gap:0.4rem;flex-wrap:wrap;">
        ${modBadges}
      </div>
    `;

    card.querySelector(".jump-moment-btn").addEventListener("click", () => {
      switchTab("analyzer");
      selectVideo(hit.videoId, hit.startTime);
    });

    searchResultsList.appendChild(card);
  });
}

/**
 * Editable AWS Multi-SaaS vs. Google Cloud Serverless TCO Calculator
 */
function updateEconomicsCalculator() {
  const monthlyVideos = Number(calcDailyVideos.value) || 50000;
  const rekMod = Number(awsRekMod?.value) || 0;
  const rekLabel = Number(awsRekLabel?.value) || 0;
  const transcribe = Number(awsTranscribe?.value) || 0;
  const bedrock = Number(awsBedrock?.value) || 0;
  const ec2Glue = Number(awsEc2?.value) || 0;

  const gcpVis = Number(gcpVisionCost?.value) || 0;
  const gcpStt = Number(gcpSttCost?.value) || 0;
  const gcpGem = Number(gcpGeminiCost?.value) || 0;
  const gcpInfra = Number(gcpRunBqCost?.value) || 0;

  const awsVisionTotal = rekMod + rekLabel;
  const legacyUnit = awsVisionTotal + transcribe + bedrock + ec2Glue;
  const geminiUnit = gcpVis + gcpStt + gcpGem + gcpInfra;

  calcDailyVideosVal.textContent = `${monthlyVideos.toLocaleString()} videos / month`;

  const legMonthly = monthlyVideos * legacyUnit;
  const legAnnual = legMonthly * 12;

  const gcpMonthly = monthlyVideos * geminiUnit;
  const gcpAnnual = gcpMonthly * 12;

  const netMonthly = legMonthly - gcpMonthly;
  const netAnnual = legAnnual - gcpAnnual;
  const pct = legacyUnit > 0 ? ((1 - geminiUnit / legacyUnit) * 100).toFixed(1) : "0.0";

  legUnitCost.textContent = `$${legacyUnit.toFixed(4)}`;
  legDailyCost.textContent = `$${Math.round(legMonthly).toLocaleString()} / mo`;
  legAnnualCost.textContent = `$${Math.round(legAnnual).toLocaleString()} / yr`;

  gcpUnitCost.textContent = `$${geminiUnit.toFixed(4)}`;
  gcpDailyCost.textContent = `$${Math.round(gcpMonthly).toLocaleString()} / mo`;
  gcpAnnualCost.textContent = `$${Math.round(gcpAnnual).toLocaleString()} / yr`;

  netAnnualSavings.textContent = `$${Math.round(netAnnual).toLocaleString()} / year saved`;
  if (netMonthlySavings) {
    netMonthlySavings.textContent = `$${Math.round(netMonthly).toLocaleString()} / month saved`;
  }
  savingsPctBadge.textContent = `${pct}% TCO Reduction`;

  if (tcoBreakdownTableWrap) {
    const fmtMo = (rate) => `$${Math.round(rate * monthlyVideos).toLocaleString()}/mo ($${rate.toFixed(4)}/vid)`;
    tcoBreakdownTableWrap.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Service Dimension</th>
            <th>AWS Fragmented 4-Vendor Stack</th>
            <th>Google Cloud Native Stream</th>
            <th>Variance / Architectural Win</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Vision &amp; Moderation</strong></td>
            <td>${fmtMo(awsVisionTotal)} <span class="text-muted">(Rekognition Mod+Labels)</span></td>
            <td class="text-success"><strong>${fmtMo(gcpVis)}</strong> <span class="text-muted">(Bundled in Gemini)</span></td>
            <td><span class="badge badge-success">Eliminated • Zero frame slicing</span></td>
          </tr>
          <tr>
            <td><strong>Speech Transcription</strong></td>
            <td>${fmtMo(transcribe)} <span class="text-muted">(Amazon Transcribe)</span></td>
            <td class="text-success"><strong>${fmtMo(gcpStt)}</strong> <span class="text-muted">(Bundled in Gemini)</span></td>
            <td><span class="badge badge-success">Eliminated • Zero audio drift</span></td>
          </tr>
          <tr>
            <td><strong>LLM Synthesis &amp; Ad Copy</strong></td>
            <td>${fmtMo(bedrock)} <span class="text-muted">(Amazon Bedrock)</span></td>
            <td class="text-success"><strong>${fmtMo(gcpGem)}</strong> <span class="text-muted">(Gemini 3.8 Flash)</span></td>
            <td><span class="badge badge-accent">Single unified model pass</span></td>
          </tr>
          <tr>
            <td><strong>Orchestration &amp; Compute</strong></td>
            <td>${fmtMo(ec2Glue)} <span class="text-muted">(EC2/Lambda + SQS)</span></td>
            <td class="text-success"><strong>${fmtMo(gcpInfra)}</strong> <span class="text-muted">(Cloud Run + Pub/Sub + BQ)</span></td>
            <td><span class="badge badge-success">Scale-to-zero serverless</span></td>
          </tr>
          <tr style="background:rgba(16, 185, 129, 0.08);">
            <td><strong>Total (${monthlyVideos.toLocaleString()} vids/mo)</strong></td>
            <td><strong>$${Math.round(legMonthly).toLocaleString()} / mo</strong> ($${legacyUnit.toFixed(4)}/vid)</td>
            <td class="text-success"><strong>$${Math.round(gcpMonthly).toLocaleString()} / mo</strong> ($${geminiUnit.toFixed(4)}/vid)</td>
            <td><span class="badge badge-success">${pct}% Saved • 45x Faster (3.7s)</span></td>
          </tr>
        </tbody>
      </table>
    `;
  }
}

/**
 * Renders GCS Video Asset Manager & Two-Way Atomic Purge Table
 */
function renderAssetManager() {
  if (!assetsManagerTableWrap) return;

  const rowsHtml = state.videos
    .map((v, idx) => {
      const sizeMb = v.fileSizeMb ?? Number((12.4 + (idx % 4) * 5.3).toFixed(1));
      const daysLeft = v.gcsRetentionDaysLeft ?? Math.max(1, 7 - (idx % 6));
      const isUploaded = String(v.id).startsWith("vid-live-") || String(v.id).startsWith("vid-sim-");
      const statusBadgeClass =
        v.brandSafety?.status === "SAFE"
          ? "badge-success"
          : v.brandSafety?.status === "REVIEW"
          ? "badge-warning"
          : "badge-danger";

      return `
        <tr>
          <td>
            <strong>${escapeHtml(v.title)}</strong>
            ${isUploaded ? `<span class="badge badge-accent" style="margin-left:0.35rem;">Uploaded</span>` : ""}
            <br><code style="font-size:0.72rem;color:#94a3b8;">${escapeHtml(v.gcsUri)}</code>
          </td>
          <td>${escapeHtml(v.creator)}<br><span class="text-muted">${escapeHtml(v.platform)}</span></td>
          <td>${sizeMb} MB<br><span class="text-muted">${v.durationSeconds || 42}s</span></td>
          <td>
            <span class="badge ${daysLeft <= 2 ? "badge-warning" : "badge-subtle"}">
              ⏳ ${daysLeft}d left (7d TTL)
            </span>
          </td>
          <td><span class="badge ${statusBadgeClass}">${escapeHtml(v.brandSafety?.status || "SAFE")}</span></td>
          <td style="display:flex;gap:0.4rem;align-items:center;">
            <button type="button" class="btn btn-outline btn-sm asset-inspect-btn" data-id="${escapeHtml(v.id)}">
              Inspect
            </button>
            <button type="button" class="btn-danger-sm asset-delete-btn" data-id="${escapeHtml(v.id)}" data-title="${escapeHtml(v.title)}">
              🗑️ Delete Asset
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  assetsManagerTableWrap.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>GCS Object URI &amp; Campaign Title</th>
          <th>Creator</th>
          <th>Size / Dur</th>
          <th>GCS Lifecycle</th>
          <th>Safety</th>
          <th>Atomic Purge Action</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;

  assetsManagerTableWrap.querySelectorAll(".asset-inspect-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab("analyzer");
      selectVideo(btn.dataset.id, 0);
    });
  });

  assetsManagerTableWrap.querySelectorAll(".asset-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      const res = await fetch(`/api/assets/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        state.videos = state.videos.filter((v) => v.id !== id);
        if (data.eventarcEvent) {
          state.eventarcLog.unshift(data.eventarcEvent);
        }
        if (purgeToastBanner) {
          purgeToastBanner.classList.remove("hidden");
          purgeToastBanner.innerHTML = `
            <strong>🗑️ Two-Way Atomic Purge Complete:</strong>
            Deleted blob <code>${escapeHtml(data.gcsUri)}</code> from Google Cloud Storage and purged embeddings for <strong>"${escapeHtml(title)}"</strong> from BigQuery index.
          `;
        }
        if (state.activeVideoId === id && state.videos.length > 0) {
          selectVideo(state.videos[0].id, 0);
        } else {
          renderReelSelector();
        }
        renderAssetManager();
        renderExecutiveDashboard();
        if (semanticSearchInput?.value) {
          executeSemanticSearch(semanticSearchInput.value);
        }
      }
    });
  });
}

function renderArtifactCode() {
  if (state.activeArtifactTab === "sql") {
    artifactCaption.textContent = "Production BigQuery Vector Index & Looker View DDL (gcp/bigquery_schema.sql):";
    artifactCodeBlock.textContent = state.artifacts.bigquerySql;
  } else if (state.activeArtifactTab === "deploy") {
    artifactCaption.textContent = "Zero-Ops Cloud Run + Eventarc + GCS Provisioning Script (gcp/deploy.sh):";
    artifactCodeBlock.textContent = state.artifacts.deployScript;
  } else {
    artifactCaption.textContent = "Gemini 3.8 Flash Enforced JSON Schema (src/geminiService.js):";
    artifactCodeBlock.textContent = JSON.stringify(state.artifacts.jsonSchema, null, 2);
  }
}

/**
 * Renders Looker Studio Brand Safety Executive Dashboard & Eventarc Feed
 */
function renderExecutiveDashboard() {
  const total = state.videos.length;
  const safeCount = state.videos.filter((v) => v.brandSafety?.status === "SAFE").length;
  const reviewCount = state.videos.filter((v) => v.brandSafety?.status === "REVIEW").length;
  const blockedCount = state.videos.filter((v) => v.brandSafety?.status === "BLOCKED").length;
  const avgLatency =
    state.videos.reduce((acc, v) => acc + (v.processingTimeMs || 3600), 0) /
    Math.max(1, total) /
    1000;
  const totalPlacements = state.videos.reduce(
    (acc, v) => acc + (v.productPlacements?.length || 0),
    0
  );

  dashboardKpiRow.innerHTML = `
    <div class="kpi-card">
      <span>Enterprise Safe Rate</span>
      <strong class="text-success">${Math.round((safeCount / Math.max(1, total)) * 100)}% (${safeCount}/${total})</strong>
    </div>
    <div class="kpi-card">
      <span>Flagged / Blocked Assets</span>
      <strong style="color:#fca5a5;">${reviewCount} Review • ${blockedCount} Blocked</strong>
    </div>
    <div class="kpi-card">
      <span>Avg Gemini 3.8 Flash Latency</span>
      <strong style="color:#7dd3fc;">${avgLatency.toFixed(2)}s</strong>
    </div>
    <div class="kpi-card">
      <span>Indexed Product Placements</span>
      <strong>${totalPlacements} Timestamped SKUs</strong>
    </div>
  `;

  const rowsHtml = state.videos
    .map((v) => {
      const badgeClass =
        v.brandSafety?.status === "SAFE"
          ? "badge-success"
          : v.brandSafety?.status === "REVIEW"
          ? "badge-warning"
          : "badge-danger";
      return `
        <tr>
          <td><strong>${escapeHtml(v.title)}</strong><br><span class="text-muted">${escapeHtml(v.creator)}</span></td>
          <td>${escapeHtml(v.platform)}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(v.brandSafety?.status)} (${v.brandSafety?.overallScore}/100)</span></td>
          <td>${v.productPlacements?.length || 0} products</td>
          <td>${((v.processingTimeMs || 3600) / 1000).toFixed(2)}s</td>
          <td><button type="button" class="btn btn-outline btn-sm inspect-row-btn" data-id="${escapeHtml(v.id)}">Inspect</button></td>
        </tr>
      `;
    })
    .join("");

  dashboardComplianceTableWrap.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Creator Reel</th>
          <th>Platform</th>
          <th>GARM Safety Verdict</th>
          <th>Placements</th>
          <th>Latency</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;

  dashboardComplianceTableWrap.querySelectorAll(".inspect-row-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab("analyzer");
      selectVideo(btn.dataset.id, 0);
    });
  });

  eventarcLogList.innerHTML = "";
  state.eventarcLog.forEach((evt) => {
    const div = document.createElement("div");
    div.className = "eventarc-item";
    const subs = (evt.fanOutSubscribers || ["bq-indexer-sub", "advertiser-webhook-sub"])
      .map((s) => `<span class="badge badge-subtle">↳ ${escapeHtml(s)}</span>`)
      .join(" ");
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong><code>${escapeHtml(evt.type)}</code></strong>
        <span class="badge ${evt.status.includes("BLOCKED") || evt.status.includes("PURGED") ? "badge-danger" : "badge-success"}">${escapeHtml(evt.status)}</span>
      </div>
      <div class="text-muted" style="margin-top:0.2rem;">
        Subject: <code>${escapeHtml(evt.subject)}</code> • Latency: ${evt.latencyMs}ms • Model: ${escapeHtml(evt.model)}
      </div>
      <div style="margin-top:0.35rem;display:flex;gap:0.35rem;flex-wrap:wrap;align-items:center;">
        <span class="badge badge-accent">Pub/Sub: video-audit-events</span>
        ${subs}
      </div>
    `;
    eventarcLogList.appendChild(div);
  });
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Initialization & Event Listeners
 */
async function init() {
  // Navigation tabs
  navTabs.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Playback controls
  playPauseBtn.addEventListener("click", () => {
    state.isPlaying = !state.isPlaying;
    playPauseBtn.textContent = state.isPlaying ? "Pause Reel" : "Play Reel";
    if (!nativeVideoEl.classList.contains("hidden")) {
      if (state.isPlaying) nativeVideoEl.play();
      else nativeVideoEl.pause();
    }
  });

  timelineSlider.addEventListener("input", (e) => {
    seekToSecond(Number(e.target.value));
  });

  // Locale buttons
  localeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      localeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeLocale = btn.dataset.locale;
      renderLocalizedMarketing();
    });
  });

  // Semantic search form
  semanticSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    executeSemanticSearch(semanticSearchInput.value);
  });

  // Economics sliders & editable line-item inputs
  [
    calcDailyVideos,
    awsRekMod,
    awsRekLabel,
    awsTranscribe,
    awsBedrock,
    awsEc2,
    gcpVisionCost,
    gcpSttCost,
    gcpGeminiCost,
    gcpRunBqCost
  ].forEach((inputEl) => {
    if (inputEl) {
      inputEl.addEventListener("input", updateEconomicsCalculator);
    }
  });

  if (resetCatalogBtn) {
    resetCatalogBtn.addEventListener("click", async () => {
      const res = await fetch("/api/assets/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        state.videos = data.videos || [];
        if (state.videos.length > 0) {
          selectVideo(state.videos[0].id, 14);
        }
        renderAssetManager();
        renderExecutiveDashboard();
        if (purgeToastBanner) {
          purgeToastBanner.classList.remove("hidden");
          purgeToastBanner.innerHTML = `<strong>✅ Catalog Restored:</strong> Cleared temporary test uploads and restored the 5 reference VividScale reels.`;
        }
      }
    });
  }

  artifactSubtabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      artifactSubtabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeArtifactTab = btn.dataset.artifact;
      renderArtifactCode();
    });
  });

  // Modals (using native HTML5 <dialog> .showModal())
  openUploadModalBtn.addEventListener("click", () => uploadModal.showModal());
  cancelUploadBtn.addEventListener("click", () => uploadModal.close());
  openSettingsModalBtn.addEventListener("click", () => settingsModal.showModal());

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.sessionApiKey = geminiApiKeyInput.value.trim();
    updateApiStatusBadge();
    settingsModal.close();
  });

  clearKeyBtn.addEventListener("click", () => {
    state.sessionApiKey = "";
    geminiApiKeyInput.value = "";
    updateApiStatusBadge();
    settingsModal.close();
  });

  // Upload / Ingest form handler
  uploadVideoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    uploadProgressBox.hidden = false;
    uploadProgressBar.value = 35;
    uploadStatusText.textContent =
      "1/3 GCS Object Finalize -> Eventarc -> Cloud Run Dispatcher...";

    const formData = new FormData(uploadVideoForm);
    if (state.sessionApiKey) {
      formData.append("apiKey", state.sessionApiKey);
    }

    const fileInput = document.getElementById("upload-file");
    const uploadedFile = fileInput.files?.[0];

    setTimeout(() => {
      uploadProgressBar.value = 75;
      uploadStatusText.textContent =
        "2/3 Streaming video + audio to Gemini 3.8 Flash + Gemini Embedding 2...";
    }, 350);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Upload failed");
      }

      uploadProgressBar.value = 100;
      uploadStatusText.textContent = "3/3 Indexed in BigQuery Vector Search!";

      if (uploadedFile) {
        const blobUrl = URL.createObjectURL(uploadedFile);
        state.uploadedObjectUrlByVideoId.set(payload.video.id, blobUrl);
      }

      state.videos.unshift(payload.video);
      if (payload.eventarcEvent) {
        state.eventarcLog.unshift(payload.eventarcEvent);
      }

      setTimeout(() => {
        uploadProgressBox.hidden = true;
        uploadVideoForm.reset();
        uploadModal.close();
        switchTab("analyzer");
        selectVideo(payload.video.id, 3);
        renderAssetManager();
        renderExecutiveDashboard();
        // Refresh semantic search results so newly ingested video moments appear immediately
        if (semanticSearchInput?.value) {
          executeSemanticSearch(semanticSearchInput.value);
        }
      }, 300);
    } catch (err) {
      uploadStatusText.textContent = `Error: ${err.message}`;
    }
  });

  // Simulate Eventarc CloudEvent button
  simulateEventarcBtn.addEventListener("click", async () => {
    const sampleNames = [
      "tiktok/summer-electrolyte-unboxing.mp4",
      "ig-reels/ceramic-cookware-test.mp4",
      "yt-shorts/wireless-earbuds-gym-test.mp4"
    ];
    const picked = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const res = await fetch("/eventarc/gcs-finalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ce-id": `evt-${Date.now()}`,
        "ce-source": "//storage.googleapis.com/projects/_/buckets/vividscale-raw-videos",
        "ce-subject": `objects/${picked}`
      },
      body: JSON.stringify({
        bucket: "vividscale-raw-videos",
        name: picked,
        size: 5420000
      })
    });
    if (res.ok) {
      const catRes = await fetch("/api/catalog");
      const catData = await catRes.json();
      state.videos = catData.videos;
      state.eventarcLog = catData.eventarcLog;
      renderReelSelector();
      renderExecutiveDashboard();
    }
  });

  // Load initial catalog & artifacts
  const [catRes, artRes] = await Promise.all([
    fetch("/api/catalog"),
    fetch("/api/architecture-artifacts")
  ]);
  const catalogData = await catRes.json();
  const artifactsData = await artRes.json();

  state.videos = catalogData.videos || [];
  state.sampleQueries = catalogData.sampleQueries || [];
  state.eventarcLog = catalogData.eventarcLog || [];
  state.serverHasApiKey = Boolean(catalogData.config?.hasServerApiKey);
  state.artifacts = artifactsData;

  updateApiStatusBadge();

  // Render preset search query chips
  presetQueryChips.innerHTML = "";
  state.sampleQueries.forEach((sq) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "preset-chip-btn";
    chip.textContent = sq.label;
    chip.addEventListener("click", () => {
      executeSemanticSearch(sq.query);
    });
    presetQueryChips.appendChild(chip);
  });

  if (state.videos.length > 0) {
    // Select first video at 00:14 (where creator drinks FizzPop soda near the charging VoltDrive EV!)
    selectVideo(state.videos[0].id, 14);
  }

  updateEconomicsCalculator();
  renderArtifactCode();
  renderAssetManager();
  renderExecutiveDashboard();
  await executeSemanticSearch(
    "Find all video moments where a user drinks a soda near an electric car"
  );

  requestAnimationFrame(tickPlayback);
}

init();
