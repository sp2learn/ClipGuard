/**
 * VividScale Video AI Studio — Frontend Controller
 * Master-Detail Video Inspection + Non-Blocking Pub/Sub Queue + Dedicated Cross-Video Search
 */

const state = {
  videos: [],
  pendingJobs: [], // Active background Pub/Sub ingestion jobs shown at top of Videos table
  sampleQueries: [],
  eventarcLog: [],
  artifacts: {
    bigquerySql: "",
    deployScript: "",
    jsonSchema: {}
  },
  activeVideoId: null,
  isDetailViewOpen: false,
  activeLocale: "en-US",
  activeArtifactTab: "sql",
  activeInspectorSubtab: "safety",
  currentTime: 0,
  isPlaying: false,
  lastTick: 0,
  sessionApiKey: "",
  serverHasApiKey: false,
  highlightedSearchTerm: "",
  uploadedObjectUrlByVideoId: new Map()
};

// Navigation & Views
const navTabs = document.querySelectorAll(".big-nav-btn");
const navVideoCount = document.getElementById("nav-video-count");
const tabViews = {
  videos: document.getElementById("view-videos"),
  search: document.getElementById("view-search"),
  economics: document.getElementById("view-economics")
};

const videosMasterView = document.getElementById("videos-master-view");
const videoDetailView = document.getElementById("video-detail-view");
const backToVideosBtn = document.getElementById("back-to-videos-btn");
const videosMasterTableWrap = document.getElementById("videos-master-table-wrap");
const dashboardKpiRow = document.getElementById("dashboard-kpi-row");
const purgeToastBanner = document.getElementById("purge-toast-banner");
const resetCatalogBtn = document.getElementById("reset-catalog-btn");
const simulateEventarcBtn = document.getElementById("simulate-eventarc-btn");
const eventarcLogList = document.getElementById("eventarc-log-list");

// Detail View Telemetry & Player Elements
const teleLatency = document.getElementById("tele-latency");
const teleCost = document.getElementById("tele-cost");
const teleSafety = document.getElementById("tele-safety");
const teleTokens = document.getElementById("tele-tokens");

const playerPlatformPill = document.getElementById("player-platform-pill");
const playerVideoTitle = document.getElementById("player-video-title");
const playerCreatorMeta = document.getElementById("player-creator-meta");
const stageCanvas = document.getElementById("multimodal-stage-canvas");
const bboxOverlayCanvas = document.getElementById("bbox-overlay-canvas");
const bboxOverlayCtx = bboxOverlayCanvas ? bboxOverlayCanvas.getContext("2d") : null;
const nativeVideoEl = document.getElementById("native-video-player");
const ctx = stageCanvas.getContext("2d");
const playPauseBtn = document.getElementById("play-pause-btn");
const timecodeReadout = document.getElementById("timecode-readout");
const timelineSlider = document.getElementById("timeline-slider");
const timelineMarkers = document.getElementById("timeline-markers");

const liveVisualDesc = document.getElementById("live-visual-desc");
const liveAudioTranscript = document.getElementById("live-audio-transcript");
const liveOcrText = document.getElementById("live-ocr-text");

// Detail View Right-Hand Sub-Tabs (Strictly for the selected video)
const inspectorSubtabs = document.querySelectorAll(".inspector-subtab");
const inspectorSubpanes = {
  safety: document.getElementById("subpane-safety"),
  placements: document.getElementById("subpane-placements"),
  moments: document.getElementById("subpane-moments"),
  json: document.getElementById("subpane-json")
};

// Safety, Placements, Moments & JSON Elements
const safetyScoreBadge = document.getElementById("safety-score-badge");
const safetyScoreNum = document.getElementById("safety-score-num");
const safetyVerdictBanner = document.getElementById("safety-verdict-banner");
const safetyVerdictLabel = document.getElementById("safety-verdict-label");
const safetySummaryRationale = document.getElementById("safety-summary-rationale");
const safetyFlagsContainer = document.getElementById("safety-flags-container");
const garmCategoriesGrid = document.getElementById("garm-categories-grid");

const placementsCountBadge = document.getElementById("placements-count-badge");
const placementsList = document.getElementById("placements-list");
const momentsCountBadge = document.getElementById("moments-count-badge");
const videoMomentsList = document.getElementById("video-moments-list");
const localeButtons = document.querySelectorAll(".locale-btn");
const localizedCard = document.getElementById("localized-card");
const operationalJsonCode = document.getElementById("operational-json-code");

// Tab 2: Dedicated Cross-Video Semantic Search Elements
const semanticSearchForm = document.getElementById("semantic-search-form");
const semanticSearchInput = document.getElementById("semantic-search-input");
const presetQueryChips = document.getElementById("preset-query-chips");
const embeddingModeBadge = document.getElementById("embedding-mode-badge");
const searchLatencyLabel = document.getElementById("search-latency-label");
const searchResultsList = document.getElementById("search-results-list");
const searchBigquerySql = document.getElementById("search-bigquery-sql");

// Tab 3: TCO Calculator Elements
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

// Modals
const uploadModal = document.getElementById("upload-modal");
const openUploadModalBtn = document.getElementById("open-upload-modal-btn");
const cancelUploadBtn = document.getElementById("cancel-upload-btn");
const uploadVideoForm = document.getElementById("upload-video-form");

const settingsModal = document.getElementById("settings-modal");
const openSettingsModalBtn = document.getElementById("open-settings-modal-btn");
const settingsForm = document.getElementById("settings-form");
const geminiApiKeyInput = document.getElementById("gemini-api-key-input");
const clearKeyBtn = document.getElementById("clear-key-btn");
const apiStatusDot = document.getElementById("api-status-dot");
const apiStatusLabel = document.getElementById("api-status-label");

function formatTimecode(sec) {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function getActiveVideo() {
  return state.videos.find((v) => v.id === state.activeVideoId) || state.videos[0];
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function switchTab(targetTab) {
  navTabs.forEach((btn) => {
    const active = btn.dataset.tab === targetTab;
    btn.classList.toggle("active", active);
    if (active) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });

  Object.entries(tabViews).forEach(([key, sectionEl]) => {
    if (!sectionEl) return;
    const isTarget = key === targetTab;
    sectionEl.classList.toggle("active", isTarget);
    sectionEl.hidden = !isTarget;
  });

  if (targetTab === "videos") {
    renderVideosMasterView();
  }
}

function showMasterVideosList() {
  state.isDetailViewOpen = false;
  state.isPlaying = false;
  if (!nativeVideoEl.classList.contains("hidden")) {
    nativeVideoEl.pause();
  }
  videosMasterView.hidden = false;
  videoDetailView.hidden = true;
  renderVideosMasterView();
}

function openVideoDetail(videoId, seekSecond = 0, highlightTerm = "") {
  const video = state.videos.find((v) => v.id === videoId);
  if (!video) return;

  state.activeVideoId = video.id;
  state.isDetailViewOpen = true;
  state.currentTime = seekSecond;
  state.highlightedSearchTerm = String(highlightTerm || "").trim();

  switchTab("videos");
  videosMasterView.hidden = true;
  videoDetailView.hidden = false;

  timelineSlider.max = String(video.durationSeconds || 60);
  timelineSlider.value = String(seekSecond);

  playerPlatformPill.textContent = video.platform;
  playerVideoTitle.textContent = video.title;
  playerCreatorMeta.textContent = `${video.creator} • ${video.gcsUri}`;

  const playableUrl = state.uploadedObjectUrlByVideoId.get(video.id) || video.videoUrl;
  if (playableUrl) {
    nativeVideoEl.classList.remove("hidden");
    if (bboxOverlayCanvas) bboxOverlayCanvas.classList.remove("hidden");
    stageCanvas.classList.add("hidden");

    const applySeek = () => {
      if (nativeVideoEl.duration && Number.isFinite(nativeVideoEl.duration)) {
        video.durationSeconds = Math.ceil(nativeVideoEl.duration);
        timelineSlider.max = String(video.durationSeconds);
      }
      try {
        nativeVideoEl.currentTime = seekSecond;
      } catch {
        // ignore if stream is still buffering
      }
      nativeVideoEl.play().catch(() => {});
      updateTimecodeAndLiveReadout();
      drawNativeVideoBoundingBoxes();
    };

    if (nativeVideoEl.dataset.videoId !== video.id) {
      nativeVideoEl.dataset.videoId = video.id;
      nativeVideoEl.src = playableUrl;
      nativeVideoEl.load();
    }

    if (nativeVideoEl.readyState >= 1) {
      applySeek();
    } else {
      nativeVideoEl.addEventListener("loadedmetadata", applySeek, { once: true });
    }
  } else {
    nativeVideoEl.pause();
    nativeVideoEl.removeAttribute("src");
    delete nativeVideoEl.dataset.videoId;
    nativeVideoEl.classList.add("hidden");
    if (bboxOverlayCanvas) bboxOverlayCanvas.classList.add("hidden");
    stageCanvas.classList.remove("hidden");
  }

  updateDetailTelemetry(video);
  renderTimelineMarkers(video);
  renderBrandSafetyScorecard(video);
  renderProductPlacements(video);
  renderVideoMomentsTab(video);
  renderLocalizedMarketing(video);
  renderOperationalJson(video);
  updateTimecodeAndLiveReadout();
  drawSynthesizedVideoFrame();
  drawNativeVideoBoundingBoxes();
}

function switchInspectorSubtab(subtab) {
  state.activeInspectorSubtab = subtab;
  inspectorSubtabs.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.subtab === subtab);
  });
  Object.entries(inspectorSubpanes).forEach(([key, pane]) => {
    if (pane) pane.hidden = key !== subtab;
  });
}

function updateApiStatusBadge() {
  const hasLive = Boolean(state.sessionApiKey || state.serverHasApiKey);
  if (apiStatusDot) {
    apiStatusDot.style.background = hasLive ? "#059669" : "#2563eb";
  }
  if (apiStatusLabel) {
    apiStatusLabel.textContent = state.sessionApiKey
      ? "Status: Session API Key Override Active"
      : state.serverHasApiKey
      ? "Status: Server Secret Manager / .env Key Active"
      : "Status: Simulated Stream Mode";
  }
}

function updateDetailTelemetry(video) {
  if (!video) return;
  const latencySec = ((video.processingTimeMs || 3500) / 1000).toFixed(2);
  const gcpCost = (video.geminiCostUsd ?? 0.0325).toFixed(4);
  const bs = video.brandSafety || {};
  const tokens = video.tokensConsumed || Math.round((video.durationSeconds || 60) * 258);

  if (teleLatency) teleLatency.textContent = `⚡ ${latencySec}s`;
  if (teleCost) teleCost.textContent = `💰 $${gcpCost}`;
  if (teleSafety) {
    teleSafety.textContent = `🛡️ ${bs.overallScore ?? 98}% ${bs.status || "SAFE"}`;
    teleSafety.className = `badge ${
      bs.status === "SAFE" ? "badge-success" : bs.status === "REVIEW" ? "badge-warning" : "badge-danger"
    }`;
  }
  if (teleTokens) teleTokens.textContent = `🪙 ${tokens.toLocaleString()} tok`;
}

/**
 * Renders the Master Videos Page:
 * 1. KPI Summary Cards
 * 2. Active Background Pub/Sub Processing Rows (with 4-step progress pills)
 * 3. Processed Video Rows with clear Status, Brand Tags, SEO Hashtags, and "Inspect Details" button
 */
function renderVideosMasterView() {
  const total = state.videos.length;
  if (navVideoCount) {
    navVideoCount.textContent = String(total + state.pendingJobs.length);
  }

  const safeCount = state.videos.filter((v) => v.brandSafety?.status === "SAFE").length;
  const reviewCount = state.videos.filter((v) => v.brandSafety?.status === "REVIEW").length;
  const blockedCount = state.videos.filter((v) => v.brandSafety?.status === "BLOCKED").length;
  const avgLatency =
    state.videos.reduce((acc, v) => acc + (v.processingTimeMs || 3600), 0) / Math.max(1, total) / 1000;

  if (dashboardKpiRow) {
    dashboardKpiRow.innerHTML = `
      <div class="kpi-card">
        <span>Processed Videos</span>
        <strong>${total} Ready ${state.pendingJobs.length ? `• ${state.pendingJobs.length} Queued` : ""}</strong>
      </div>
      <div class="kpi-card">
        <span>Brand Safety Pass Rate</span>
        <strong class="text-success">${Math.round((safeCount / Math.max(1, total)) * 100)}% Safe (${reviewCount} Review, ${blockedCount} Blocked)</strong>
      </div>
      <div class="kpi-card">
        <span>Avg Gemini 3.8 Latency</span>
        <strong>${avgLatency.toFixed(2)}s / video</strong>
      </div>
      <div class="kpi-card">
        <span>GCS Bucket Lifecycle</span>
        <strong>7-Day Auto-Purge</strong>
      </div>
    `;
  }

  if (videosMasterTableWrap) {
    // 1. Render any currently processing Pub/Sub jobs at the very top
    const pendingRowsHtml = state.pendingJobs
      .map((job) => {
        const s = job.stageIndex || 1;
        const stepClass = (idx) => (idx < s ? "step-done" : idx === s ? "step-active" : "");
        const stepIcon = (idx) => (idx < s ? "✓" : idx === s ? "⏳" : "•");

        return `
          <tr class="processing-row">
            <td>
              <strong>${escapeHtml(job.title)}</strong>
              <span class="badge badge-accent" style="margin-left:0.35rem;">NEW UPLOAD</span><br>
              <span class="text-muted">${escapeHtml(job.creator)} • ${escapeHtml(job.platform)}</span>
            </td>
            <td colspan="2">
              <div><strong style="color:#1d4ed8;font-size:0.8rem;">🔄 Processing in Background via Pub/Sub (${escapeHtml(job.eventId || "video-audit-events")})</strong></div>
              <div class="step-pipeline-inline">
                <span class="step-chip ${stepClass(1)}">${stepIcon(1)} 1. GCS Staged</span>
                <span class="step-chip ${stepClass(2)}">${stepIcon(2)} 2. Pub/Sub Queue</span>
                <span class="step-chip ${stepClass(3)}">${stepIcon(3)} 3. Gemini 3.8 Flash</span>
                <span class="step-chip ${stepClass(4)}">${stepIcon(4)} 4. BigQuery Fan-Out</span>
              </div>
            </td>
            <td><span class="badge badge-subtle">7d TTL</span></td>
            <td>
              <span class="badge badge-accent">⏳ Working (${job.progress || 25}%)</span>
            </td>
          </tr>
        `;
      })
      .join("");

    // 2. Render all completed/indexed videos with their extracted brand tags & SEO tags
    const completedRowsHtml = state.videos
      .map((v, idx) => {
        const sizeMb = v.fileSizeMb ?? Number((12.4 + (idx % 4) * 5.3).toFixed(1));
        const daysLeft = v.gcsRetentionDaysLeft ?? Math.max(1, 7 - (idx % 6));
        const bs = v.brandSafety || {};
        const statusBadgeClass =
          bs.status === "SAFE" ? "badge-success" : bs.status === "REVIEW" ? "badge-warning" : "badge-danger";

        // Extracted Brand Placements for this video
        // One badge per unique brand. "No Brand Detected" only when the video has no branded placement at all
        // (unbranded objects in a branded video are summarised instead of shown as a contradictory badge).
        const placements = v.productPlacements || [];
        const isUnbrandedPp = (pp) => /no brand|unbranded|^none$/i.test(pp.brand || pp.productName || "");
        const brandNames = [...new Set(placements.filter((pp) => !isUnbrandedPp(pp)).map((pp) => pp.brand || pp.productName))];
        const unbrandedCount = placements.filter(isUnbrandedPp).length;
        const brandBadges = brandNames.length
          ? brandNames.map((b) => `<span class="badge badge-accent">🏷️ ${escapeHtml(b)}</span>`).join(" ") +
            (unbrandedCount
              ? ` <span class="badge badge-subtle" title="Objects with no visible or spoken brand">+${unbrandedCount} unbranded object${unbrandedCount > 1 ? "s" : ""}</span>`
              : "")
          : `<span class="badge badge-subtle">🚫 No Brand Detected</span>`;

        // Extracted SEO Hashtags for this video
        const seoTags = (v.localizedMarketing?.["en-US"]?.seoTags || [])
          .slice(0, 4)
          .map((t) => `<span class="badge badge-subtle">${escapeHtml(t)}</span>`)
          .join(" ");

        const latencySec = ((v.processingTimeMs || 3500) / 1000).toFixed(1);

        return `
          <tr class="video-row-clickable" data-video-id="${escapeHtml(v.id)}">
            <td>
              <strong style="color:#1e40af;">${escapeHtml(v.title)}</strong><br>
              <span class="text-muted">${escapeHtml(v.creator)} • ${escapeHtml(v.platform)} • ${sizeMb} MB</span><br>
              <code style="font-size:0.68rem;color:#64748b;">${escapeHtml(v.gcsUri)}</code>
            </td>
            <td>
              <span class="badge badge-success">✅ Processed (${latencySec}s)</span>
              <div style="margin-top:0.3rem;">
                <span class="badge ${statusBadgeClass}">🛡️ ${bs.overallScore ?? 98}/100 ${escapeHtml(
          bs.status || "SAFE"
        )}</span>
              </div>
            </td>
            <td>
              <div class="tag-cluster" style="margin-bottom:0.25rem;">
                ${brandBadges || '<span class="text-muted">No brand logos</span>'}
              </div>
              <div class="tag-cluster">
                ${seoTags}
              </div>
            </td>
            <td><span class="badge badge-subtle">${daysLeft}d left</span></td>
            <td>
              <div style="display:flex;gap:0.4rem;align-items:center;">
                <button type="button" class="btn btn-primary btn-sm video-inspect-btn" data-id="${escapeHtml(v.id)}">
                  🔍 View Details
                </button>
                <button type="button" class="btn-danger-sm asset-delete-btn" data-id="${escapeHtml(
                  v.id
                )}" data-title="${escapeHtml(v.title)}">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    videosMasterTableWrap.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Video Asset &amp; Creator</th>
            <th>Pipeline Status &amp; GARM Verdict</th>
            <th>Detected Brands &amp; Output Tags</th>
            <th>GCS TTL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pendingRowsHtml}
          ${completedRowsHtml}
        </tbody>
      </table>
    `;

    // Clicking "View Details" or clicking the row opens that single video's detail view
    videosMasterTableWrap.querySelectorAll(".video-inspect-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openVideoDetail(btn.dataset.id, 0);
      });
    });

    videosMasterTableWrap.querySelectorAll(".video-row-clickable").forEach((row) => {
      row.addEventListener("click", () => {
        openVideoDetail(row.dataset.videoId, 0);
      });
    });

    // Two-Way Atomic Purge (GCS + BigQuery)
    videosMasterTableWrap.querySelectorAll(".asset-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const title = btn.dataset.title;
        const res = await fetch(`/api/assets/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (res.ok) {
          const data = await res.json();
          state.videos = state.videos.filter((v) => v.id !== id);
          if (data.eventarcEvent) state.eventarcLog.unshift(data.eventarcEvent);
          if (purgeToastBanner) {
            purgeToastBanner.classList.remove("hidden");
            purgeToastBanner.innerHTML = `<strong>🗑️ Atomic Purge Complete:</strong> Deleted <code>${escapeHtml(
              data.gcsUri
            )}</code> from GCS and purged <strong>"${escapeHtml(title)}"</strong> from BigQuery index.`;
          }
          renderVideosMasterView();
          if (semanticSearchInput?.value) executeSemanticSearch(semanticSearchInput.value);
        }
      });
    });
  }

  if (eventarcLogList) {
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
          <span class="badge ${
            evt.status.includes("BLOCKED") || evt.status.includes("PURGED")
              ? "badge-danger"
              : evt.status.includes("QUEUED") || evt.status.includes("PROCESSING")
              ? "badge-accent"
              : "badge-success"
          }">${escapeHtml(evt.status)}</span>
        </div>
        <div class="text-muted" style="margin-top:0.15rem;">
          <code>${escapeHtml(evt.subject)}</code> • ${evt.latencyMs}ms
        </div>
        <div style="margin-top:0.3rem;display:flex;gap:0.3rem;flex-wrap:wrap;">
          <span class="badge badge-accent">Pub/Sub: video-audit-events</span>
          ${subs}
        </div>
      `;
      eventarcLogList.appendChild(div);
    });
  }
}

function seekToSecond(sec) {
  const video = getActiveVideo();
  const maxDur =
    (!nativeVideoEl.classList.contains("hidden") &&
      nativeVideoEl.duration &&
      Number.isFinite(nativeVideoEl.duration)
      ? Math.ceil(nativeVideoEl.duration)
      : video?.durationSeconds) || 60;

  state.currentTime = Math.max(0, Math.min(maxDur, Number(sec) || 0));
  timelineSlider.max = String(maxDur);
  timelineSlider.value = String(state.currentTime);

  if (!nativeVideoEl.classList.contains("hidden")) {
    const doNativeSeek = () => {
      try {
        nativeVideoEl.currentTime = state.currentTime;
        nativeVideoEl.play().catch(() => {});
      } catch {
        // ignore
      }
    };
    if (nativeVideoEl.readyState >= 1) {
      doNativeSeek();
    } else {
      nativeVideoEl.addEventListener("loadedmetadata", doNativeSeek, { once: true });
    }
  }
  updateTimecodeAndLiveReadout();
  drawSynthesizedVideoFrame();
  drawNativeVideoBoundingBoxes();
}

function renderTimelineMarkers(video) {
  timelineMarkers.innerHTML = "";
  if (!video) return;

  (video.productPlacements || []).forEach((pp) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "marker-chip marker-placement";
    btn.textContent = `🏷️ ${formatTimecode(pp.startTime)} ${pp.brand || pp.productName}`;
    btn.addEventListener("click", () => seekToSecond(pp.startTime));
    timelineMarkers.appendChild(btn);
  });

  (video.brandSafety?.flags || []).forEach((flag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "marker-chip marker-flag";
    btn.textContent = `⚠️ ${flag.timestampLabel}`;
    btn.addEventListener("click", () => seekToSecond(flag.timestampSeconds));
    timelineMarkers.appendChild(btn);
  });
}

function updateTimecodeAndLiveReadout() {
  const video = getActiveVideo();
  if (!video) return;

  const sec = state.currentTime;
  timecodeReadout.textContent = `${formatTimecode(sec)} / ${formatTimecode(video.durationSeconds || 60)}`;

  const moments = video.moments || [];
  const activeMoment =
    moments.find((m) => sec >= m.startTime && sec <= m.endTime) ||
    moments[moments.length - 1] ||
    moments[0];

  if (activeMoment) {
    liveVisualDesc.textContent = activeMoment.visualDescription;
    liveAudioTranscript.textContent = `"${activeMoment.audioTranscript}"`;
    liveOcrText.textContent = activeMoment.ocrText || "—";
  }
}

function renderBrandSafetyScorecard(video) {
  const bs = video?.brandSafety;
  if (!bs) return;

  safetyScoreNum.textContent = String(bs.overallScore);
  safetyScoreBadge.className = `safety-score-badge status-${bs.status}`;
  safetyVerdictBanner.className = `verdict-banner status-${bs.status}`;
  safetyVerdictLabel.textContent = `${bs.status} • ${bs.verdictLabel}`;
  safetySummaryRationale.textContent = bs.summaryRationale;

  safetyFlagsContainer.innerHTML = "";
  (bs.flags || []).forEach((flag) => {
    const div = document.createElement("div");
    div.className = "flag-alert-item";
    const flagSec = flag.startTime ?? flag.timestampSeconds ?? parseTimestampToSeconds(flag.timestamp || flag.timestampLabel);
    div.innerHTML = `
      <div style="flex:1;">
        <strong>⚠️ ${escapeHtml(flag.severity)} RISK • ${escapeHtml(flag.category || "")}</strong>
        <p>${escapeHtml(flag.description || flag.remediation || "")}</p>
        ${buildCitationPillHtml({
          startTime: flagSec,
          timestampLabel: flag.timestamp || flag.timestampLabel,
          modality: flag.modality,
          verbatimEvidence: flag.quote || flag.description || "",
          policyStandard: flag.policyStandard || flag.category
        })}
      </div>
    `;
    bindCitationPills(div);
    safetyFlagsContainer.appendChild(div);
  });

  garmCategoriesGrid.innerHTML = "";
  (bs.garmCategories || []).forEach((cat) => {
    const item = document.createElement("div");
    item.className = "garm-item";
    const cit = cat.citation || (cat.timestamp
      ? { startTime: parseTimestampToSeconds(cat.timestamp), timestampLabel: cat.timestamp, modality: cat.modality, verbatimEvidence: cat.notes, policyStandard: "GARM Brand Safety Floor" }
      : null);
    item.innerHTML = `
      <div class="garm-item-top">
        <span class="garm-cat-name">${escapeHtml(cat.category)}</span>
        <span class="risk-pill risk-${escapeHtml(cat.riskLevel)}">${escapeHtml(cat.riskLevel)} (${cat.score}/100)</span>
      </div>
      <div class="garm-notes">${escapeHtml(cat.modality)} — ${escapeHtml(cat.notes)}</div>
      ${cit ? buildCitationPillHtml(cit) : ""}
    `;
    bindCitationPills(item);
    garmCategoriesGrid.appendChild(item);
  });
}

function parseTimestampToSeconds(label) {
  const m = String(label || "").match(/(\d+):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

function citationIcon(modality = "") {
  const m = modality.toLowerCase();
  if (m.includes("audio")) return "🎙️";
  if (m.includes("ocr") || m.includes("text")) return "🔤";
  return "🖼️";
}

function buildCitationPillHtml(cit) {
  const sec = Number(cit.startTime) || parseTimestampToSeconds(cit.timestampLabel);
  const label = cit.timestampLabel || `00:${String(sec).padStart(2, "0")}`;
  const evidence = String(cit.verbatimEvidence || "").slice(0, 110);
  const policy = cit.policyStandard ? ` • ${escapeHtml(cit.policyStandard)}` : "";
  return `<button type="button" class="citation-pill" data-seek="${sec}" title="Jump to evidence @ ${escapeHtml(label)}">
    <span class="citation-ts">📍 ${escapeHtml(label)}</span>
    <span class="citation-mod">${citationIcon(cit.modality)} ${escapeHtml(cit.modality || "Visual Frame")}</span>
    <span class="citation-quote">“${escapeHtml(evidence)}”${policy}</span>
  </button>`;
}

function bindCitationPills(root) {
  root.querySelectorAll(".citation-pill").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      seekToSecond(Number(btn.dataset.seek) || 0);
    });
  });
}

function renderProductPlacements(video) {
  const placements = video?.productPlacements || [];
  placementsCountBadge.textContent = String(placements.length);
  placementsList.innerHTML = "";

  placements.forEach((pp) => {
    const card = document.createElement("div");
    card.className = "placement-card";
    const modalitiesHtml = (pp.modality || [])
      .map((m) => `<span class="badge badge-subtle">${escapeHtml(m)}</span>`)
      .join(" ");

    const citations =
      Array.isArray(pp.citations) && pp.citations.length
        ? pp.citations
        : (pp.modality || []).slice(0, 2).map((mod) => ({
            startTime: pp.startTime,
            timestampLabel: (pp.timestampLabel || "").split(" - ")[0],
            modality: mod,
            verbatimEvidence: /ocr/i.test(mod) ? (pp.boundingBox?.label || pp.brand) : pp.description
          }));
    const citationsHtml = citations.map(buildCitationPillHtml).join("");

    card.innerHTML = `
      <div class="placement-top">
        <div>
          <div class="placement-name">${escapeHtml(pp.productName)}</div>
          <div class="placement-brand">${escapeHtml(pp.brand)} • ${escapeHtml(pp.category)} • ${Math.round(
      (pp.confidence || 0.95) * 100
    )}% conf</div>
        </div>
        <span class="placement-time-pill">▶ ${escapeHtml(pp.timestampLabel)}</span>
      </div>
      <p class="placement-desc">${escapeHtml(pp.description)}</p>
      <div class="placement-meta-row">
        <span class="badge badge-accent">${escapeHtml(pp.prominence)}</span>
        ${modalitiesHtml}
      </div>
      <div class="citations-block">
        <div class="citations-label">Evidence Citations</div>
        ${citationsHtml}
      </div>
    `;
    bindCitationPills(card);
    card.addEventListener("click", () => {
      state.highlightedSearchTerm = pp.brand || pp.productName || "";
      seekToSecond(pp.startTime);
    });
    placementsList.appendChild(card);
  });
}

function renderVideoMomentsTab(video) {
  const moments = video?.moments || [];
  if (momentsCountBadge) momentsCountBadge.textContent = String(moments.length);
  if (!videoMomentsList) return;
  videoMomentsList.innerHTML = "";

  moments.forEach((m) => {
    const card = document.createElement("div");
    card.className = "placement-card";
    const kwBadges = (m.keywords || [])
      .map((k) => `<span class="badge badge-subtle">#${escapeHtml(k)}</span>`)
      .join(" ");
    card.innerHTML = `
      <div class="placement-top">
        <strong>Scene @ ${escapeHtml(m.timestampLabel)}</strong>
        <span class="placement-time-pill">▶ Seek ${escapeHtml(m.timestampLabel)}</span>
      </div>
      <p class="placement-desc"><strong>Visual:</strong> ${escapeHtml(m.visualDescription)}</p>
      <p class="placement-desc"><strong>Audio:</strong> "${escapeHtml(m.audioTranscript)}" • <strong>OCR:</strong> <code>${escapeHtml(
      m.ocrText || "—"
    )}</code></p>
      <div class="placement-meta-row">${kwBadges}</div>
    `;
    card.addEventListener("click", () => seekToSecond(m.startTime));
    videoMomentsList.appendChild(card);
  });
}

function renderLocalizedMarketing(video = getActiveVideo()) {
  const locMap = video?.localizedMarketing || {};
  const loc = locMap[state.activeLocale] || locMap["en-US"];
  if (!loc) {
    localizedCard.innerHTML = "<p class='text-muted'>No localized copy available.</p>";
    return;
  }

  const tagsHtml = (loc.seoTags || [])
    .map((tag) => `<span class="seo-tag">${escapeHtml(tag)}</span>`)
    .join("");

  localizedCard.innerHTML = `
    <div class="localized-headline">${escapeHtml(loc.headline)}</div>
    <p class="localized-body">${escapeHtml(loc.adCopy)}</p>
    <div class="localized-cta">🎯 ${escapeHtml(loc.cta)}</div>
    <div class="seo-tags-row">${tagsHtml}</div>
  `;
}

function renderOperationalJson(video) {
  if (!operationalJsonCode || !video) return;
  const payload = {
    schema_version: "clipguard.bigquery.v2",
    video_id: video.id,
    gcs_uri: video.gcsUri,
    model_stream: video.modelUsed,
    telemetry: {
      latency_ms: video.processingTimeMs,
      tokens_consumed: video.tokensConsumed || Math.round((video.durationSeconds || 60) * 258),
      unit_cost_usd: video.geminiCostUsd ?? 0.0325
    },
    brand_safety: {
      passed: video.brandSafety?.status === "SAFE",
      status: video.brandSafety?.status,
      overall_score: video.brandSafety?.overallScore,
      flags: video.brandSafety?.flags || [],
      rationale: video.brandSafety?.summaryRationale
    },
    product_placements: (video.productPlacements || []).map((pp) => ({
      brand: pp.brand,
      product_name: pp.productName,
      timestamp: pp.timestampLabel,
      confidence: pp.confidence
    })),
    scenes: (video.moments || []).map((m) => ({
      timestamp: m.timestampLabel,
      seconds: m.startTime,
      visual_event: m.visualDescription,
      spoken_text: m.audioTranscript,
      ocr_detected: m.ocrText
    }))
  };
  operationalJsonCode.textContent = JSON.stringify(payload, null, 2);
}

function isPlacementSearchMatch(pp, term) {
  const q = String(term || "").trim().toLowerCase();
  if (!q) return false;
  const hay = `${pp.brand || ""} ${pp.productName || ""} ${pp.category || ""} ${pp.description || ""}`.toLowerCase();
  return q.split(/\s+/).some((w) => w.length >= 2 && hay.includes(w));
}

function drawBoundingBoxOnContext(context, w, h, pp, isHighlighted) {
  const box = pp.boundingBox || { x: 0.18, y: 0.32, w: 0.64, h: 0.36, label: pp.productName };
  const bx = Math.max(8, box.x * w);
  const by = Math.max(28, box.y * h);
  const bw = Math.min(w - bx - 8, box.w * w);
  const bh = Math.min(h - by - 8, box.h * h);

  const strokeColor = isHighlighted ? "#10b981" : "#38bdf8";
  const badgeBg = isHighlighted ? "rgba(5, 150, 105, 0.95)" : "rgba(2, 132, 199, 0.92)";
  const rawLabel = box.label || `${pp.brand || ""} ${pp.productName || ""}`.trim();
  const labelText = isHighlighted ? `🎯 MATCH: ${rawLabel}` : rawLabel;

  context.save();
  context.strokeStyle = strokeColor;
  context.lineWidth = isHighlighted ? 3 : 2;
  context.setLineDash(isHighlighted ? [] : [6, 4]);
  context.strokeRect(bx, by, bw, bh);
  context.setLineDash([]);

  // Corner target brackets for highlighted brand
  if (isHighlighted) {
    context.fillStyle = "rgba(16, 185, 129, 0.12)";
    context.fillRect(bx, by, bw, bh);
  }

  context.font = "bold 11px Inter, sans-serif";
  const textWidth = Math.min(w - bx - 8, context.measureText(labelText).width + 14);
  const pillY = Math.max(8, by - 22);
  context.fillStyle = badgeBg;
  context.fillRect(bx, pillY, textWidth, 20);
  context.fillStyle = "#ffffff";
  context.fillText(labelText, bx + 6, pillY + 14);
  context.restore();
}

function drawNativeVideoBoundingBoxes() {
  if (!bboxOverlayCanvas || !bboxOverlayCtx) return;
  const w = bboxOverlayCanvas.width;
  const h = bboxOverlayCanvas.height;
  bboxOverlayCtx.clearRect(0, 0, w, h);

  if (!state.isDetailViewOpen || nativeVideoEl.classList.contains("hidden")) return;
  const video = getActiveVideo();
  if (!video) return;

  const sec = state.currentTime;
  const allPlacements = (video.productPlacements || []).filter(
    (pp) => !/no brand|unbranded/i.test(pp.brand || "")
  );
  if (allPlacements.length === 0) return;

  const activePlacements = allPlacements.filter(
    (pp) =>
      (sec >= (pp.startTime ?? 0) - 2 && sec <= (pp.endTime ?? 60) + 2) ||
      isPlacementSearchMatch(pp, state.highlightedSearchTerm)
  );
  const placementsToDraw = activePlacements.length > 0 ? activePlacements : allPlacements.slice(0, 1);

  placementsToDraw.forEach((pp) => {
    const isHighlighted = isPlacementSearchMatch(pp, state.highlightedSearchTerm);
    drawBoundingBoxOnContext(bboxOverlayCtx, w, h, pp, isHighlighted);
  });
}

function drawSynthesizedVideoFrame() {
  if (!state.isDetailViewOpen) return;
  const video = getActiveVideo();
  if (!video) return;

  const w = stageCanvas.width;
  const h = stageCanvas.height;
  const sec = state.currentTime;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(0.55, video.themeColor || "#1e3a8a");
  grad.addColorStop(1, "#020617");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let y = 40; y < h; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(2, 6, 23, 0.75)";
  ctx.fillRect(14, 14, w - 28, 42);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px Inter, sans-serif";
  ctx.fillText(`${video.creator} • ${video.platform}`, 24, 32);
  ctx.fillStyle = "#93c5fd";
  ctx.font = "11px monospace";
  ctx.fillText(`TC ${formatTimecode(sec)}`, 24, 48);

  const moments = video.moments || [];
  const activeMoment =
    moments.find((m) => sec >= m.startTime && sec <= m.endTime) ||
    moments[0];

  drawSceneIllustration(video, sec, w, h);

  const activePlacements = (video.productPlacements || []).filter(
    (pp) => sec >= pp.startTime - 2 && sec <= pp.endTime + 2
  );
  const placementsToDraw = activePlacements.length > 0 ? activePlacements : (video.productPlacements || []).slice(0, 1);

  placementsToDraw.forEach((pp) => {
    const isHighlighted = isPlacementSearchMatch(pp, state.highlightedSearchTerm);
    drawBoundingBoxOnContext(ctx, w, h, pp, isHighlighted);
  });

  const activeFlag = (video.brandSafety?.flags || []).find(
    (f) => Math.abs(sec - f.timestampSeconds) <= 5
  );
  if (activeFlag) {
    ctx.fillStyle = "rgba(220, 38, 38, 0.92)";
    ctx.fillRect(14, 64, w - 28, 36);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText(`⚠️ POLICY FLAG @ ${activeFlag.timestampLabel}`, 22, 80);
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText(activeFlag.description.slice(0, 48) + "...", 22, 94);
  }

  if (activeMoment) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(16, h - 135, w - 32, 46);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.strokeRect(16, h - 135, w - 32, 46);
    ctx.fillStyle = "#fde047";
    ctx.font = "bold 10px monospace";
    ctx.fillText("ON-SCREEN OCR", 24, h - 119);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText((activeMoment.ocrText || "").slice(0, 40), 24, h - 101);

    ctx.fillStyle = "rgba(2, 6, 23, 0.9)";
    ctx.fillRect(14, h - 80, w - 28, 64);
    ctx.fillStyle = "#93c5fd";
    ctx.font = "bold 10px monospace";
    ctx.fillText("AUDIO TRANSCRIPT", 22, h - 64);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "11px Inter, sans-serif";
    wrapCanvasText(ctx, `"${activeMoment.audioTranscript}"`, 22, h - 46, w - 44, 14, 2);
  }
}

function drawSceneIllustration(video, sec, w, h) {
  ctx.save();
  if (video.id.includes("voltdrive")) {
    ctx.fillStyle = "#1e3a8a";
    ctx.beginPath();
    ctx.roundRect(w * 0.14, h * 0.44, w * 0.68, h * 0.22, 16);
    ctx.fill();
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(w * 0.24, h * 0.52, 8 + Math.sin(sec * 5) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.roundRect(w * 0.55, h * 0.31, w * 0.18, h * 0.22, 8);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText("FizzPop", w * 0.57, h * 0.42);
  } else {
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.roundRect(w * 0.25, h * 0.38, w * 0.5, h * 0.25, 16);
    ctx.fill();
  }
  ctx.restore();
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(" ");
  let line = "";
  let linesDrawn = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    if (context.measureText(testLine).width > maxWidth && n > 0) {
      context.fillText(line, x, y + linesDrawn * lineHeight);
      line = words[n] + " ";
      linesDrawn++;
      if (linesDrawn >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  context.fillText(line.trim(), x, y + linesDrawn * lineHeight);
}

function tickPlayback(timestamp) {
  if (!state.lastTick) state.lastTick = timestamp;
  const deltaSec = (timestamp - state.lastTick) / 1000;
  state.lastTick = timestamp;

  if (state.isPlaying && state.isDetailViewOpen) {
    if (nativeVideoEl.classList.contains("hidden")) {
      const video = getActiveVideo();
      const maxDur = video?.durationSeconds || 60;
      state.currentTime += deltaSec;
      if (state.currentTime >= maxDur) state.currentTime = 0;
      timelineSlider.value = String(state.currentTime);
      updateTimecodeAndLiveReadout();
      drawSynthesizedVideoFrame();
    } else {
      drawNativeVideoBoundingBoxes();
    }
  }
  requestAnimationFrame(tickPlayback);
}

/**
 * Tab 2: Dedicated Cross-Video Semantic Search across all indexed videos
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
  searchLatencyLabel.textContent = `${data.results?.length || 0} matched moments in ${data.latencyMs || 19}ms`;
  searchBigquerySql.textContent = data.bigQuerySql || "";
  const sqlDetails = document.getElementById("search-sql-details");
  if (sqlDetails) sqlDetails.hidden = false;

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
          <span class="badge badge-accent">#${idx + 1} • ${pct}% Similarity</span>
          <span class="badge badge-subtle">${escapeHtml(hit.platform)}</span>
          <h4 style="margin:0.25rem 0 0.1rem;">${escapeHtml(hit.videoTitle)} (${escapeHtml(hit.creator)})</h4>
        </div>
        <button type="button" class="btn btn-primary btn-sm jump-moment-btn">
          ▶ Open Video @ ${escapeHtml(hit.timestampLabel)}
        </button>
      </div>
      <p style="margin:0.25rem 0;font-size:0.82rem;">
        <strong>Visual Scene:</strong> ${escapeHtml(hit.visualDescription)}
      </p>
      <p class="text-muted" style="margin:0.15rem 0;">
        <strong>Audio:</strong> "${escapeHtml(hit.audioTranscript)}" • <strong>OCR:</strong> <code>${escapeHtml(
      hit.ocrText || "—"
    )}</code>
      </p>
      <div style="margin-top:0.35rem;display:flex;gap:0.35rem;flex-wrap:wrap;">${modBadges}</div>
    `;

    card.querySelector(".jump-moment-btn").addEventListener("click", () => {
      openVideoDetail(hit.videoId, hit.startTime, queryText);
    });

    searchResultsList.appendChild(card);
  });
}

function clearSemanticSearch() {
  if (semanticSearchInput) {
    semanticSearchInput.value = "";
    semanticSearchInput.focus();
  }
  if (searchLatencyLabel) {
    searchLatencyLabel.textContent = "";
  }
  if (searchBigquerySql) {
    searchBigquerySql.textContent = "";
  }
  const sqlDetails = document.getElementById("search-sql-details");
  if (sqlDetails) {
    sqlDetails.hidden = true;
    sqlDetails.open = false;
  }
  if (searchResultsList) {
    searchResultsList.innerHTML = `
      <div class="empty-search-state">
        Enter a natural-language query above (or click a Quick Sample Query chip) to run BigQuery <code>VECTOR_SEARCH</code> across all indexed videos.
      </div>
    `;
  }
}

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
    const fmtMo = (rate) => `$${Math.round(rate * monthlyVideos).toLocaleString()}/mo<br><small>($${rate.toFixed(4)} / video)</small>`;
    tcoBreakdownTableWrap.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Dimension</th>
            <th>AWS 4-Service Stack</th>
            <th>Google Cloud Stream</th>
            <th>Architectural Win</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Vision, 2D Brand BBox &amp; Moderation</strong></td>
            <td>${fmtMo(awsVisionTotal)}</td>
            <td class="text-success"><strong>${fmtMo(gcpVis)}</strong></td>
            <td><span class="badge badge-success">Bundled • Native 2D BBox</span></td>
          </tr>
          <tr>
            <td><strong>Speech STT &amp; Frame Citations</strong></td>
            <td>${fmtMo(transcribe)}</td>
            <td class="text-success"><strong>${fmtMo(gcpStt)}</strong></td>
            <td><span class="badge badge-success">Bundled • Zero Drift</span></td>
          </tr>
          <tr>
            <td><strong>LLM Ad Copy &amp; Citation Synthesis</strong></td>
            <td>${fmtMo(bedrock)}</td>
            <td class="text-success"><strong>${fmtMo(gcpGem)}</strong></td>
            <td><span class="badge badge-accent">1 Pass Gemini 3.8 Flash</span></td>
          </tr>
          <tr>
            <td><strong>Orchestration &amp; BBox Alignment</strong></td>
            <td>${fmtMo(ec2Glue)}</td>
            <td class="text-success"><strong>${fmtMo(gcpInfra)}</strong></td>
            <td><span class="badge badge-success">Scale-to-Zero Cloud Run</span></td>
          </tr>
          <tr>
            <td><strong>TOTAL MONTHLY TCO</strong></td>
            <td><strong>${fmtMo(legacyUnit)}</strong></td>
            <td class="text-success"><strong>${fmtMo(geminiUnit)}</strong></td>
            <td><span class="badge badge-success">~${Math.round(Number(pct))}% Total Cost Reduction</span></td>
          </tr>
        </tbody>
      </table>
    `;
  }
}

function renderArtifactCode() {
  if (state.activeArtifactTab === "sql") {
    artifactCaption.textContent = "Production BigQuery Vector Index & Looker View DDL (gcp/bigquery_schema.sql):";
    artifactCodeBlock.textContent = state.artifacts.bigquerySql;
  } else if (state.activeArtifactTab === "deploy") {
    artifactCaption.textContent = "Zero-Ops Cloud Run + Pub/Sub + Secret Manager Script (gcp/deploy.sh):";
    artifactCodeBlock.textContent = state.artifacts.deployScript;
  } else {
    artifactCaption.textContent = "Gemini 3.8 Flash Enforced JSON Schema (src/geminiService.js):";
    artifactCodeBlock.textContent = JSON.stringify(state.artifacts.jsonSchema, null, 2);
  }
}

async function refreshCatalogFromServer(localBlobUrl = null, targetVideoId = null) {
  try {
    const catRes = await fetch(`/api/catalog?t=${Date.now()}`, { cache: "no-store" });
    if (catRes.ok) {
      const catData = await catRes.json();
      if (Array.isArray(catData.videos) && catData.videos.length > 0) {
        state.videos = catData.videos;
        const vidId = targetVideoId || state.videos[0]?.id;
        if (localBlobUrl && vidId) {
          state.uploadedObjectUrlByVideoId.set(vidId, localBlobUrl);
        }
      }
      if (Array.isArray(catData.eventarcLog)) {
        state.eventarcLog = catData.eventarcLog;
      }
      renderVideosMasterView();
    }
  } catch {
    renderVideosMasterView();
  }
}

/**
 * Polls a background Pub/Sub job and updates its row in the Videos table in real time
 */
async function trackBackgroundPubSubJob(pendingEntry, localBlobUrl) {
  try {
    let job = pendingEntry;
    let attempts = 0;
    // Allow up to 90 seconds (180 * 500ms) for live Gemini 3.8 Flash video inspection
    while (job.status !== "COMPLETED" && job.status !== "FAILED" && attempts < 180) {
      attempts += 1;
      await new Promise((r) => setTimeout(r, 500));
      const pollRes = await fetch(`/api/jobs/${encodeURIComponent(pendingEntry.jobId)}?t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!pollRes.ok) {
        // Server may have finished and persisted to catalog; sync catalog below
        break;
      }
      job = await pollRes.json();

      pendingEntry.status = job.status;
      pendingEntry.stageIndex = job.stageIndex || 2;
      pendingEntry.progress = job.progress || 50;
      pendingEntry.stageLabel = job.stageLabel;

      if (job.eventarcEvent && state.eventarcLog[0]?.eventId === pendingEntry.eventId) {
        state.eventarcLog[0] = job.eventarcEvent;
      }
      renderVideosMasterView();
    }

    // Remove from pendingJobs
    state.pendingJobs = state.pendingJobs.filter((j) => j.jobId !== pendingEntry.jobId);

    if (job.status === "COMPLETED" && job.video) {
      if (localBlobUrl) {
        state.uploadedObjectUrlByVideoId.set(job.video.id, localBlobUrl);
      }
      state.videos = [job.video, ...state.videos.filter((v) => v.id !== job.video.id)];
      // Auto-refresh full catalog from server so the uploaded file is guaranteed to appear immediately
      await refreshCatalogFromServer(localBlobUrl, job.video.id);
      if (semanticSearchInput?.value?.trim()) executeSemanticSearch(semanticSearchInput.value);
    } else {
      await refreshCatalogFromServer(localBlobUrl);
    }
  } catch {
    state.pendingJobs = state.pendingJobs.filter((j) => j.jobId !== pendingEntry.jobId);
    await refreshCatalogFromServer(localBlobUrl);
  }
}

async function init() {
  navTabs.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  if (backToVideosBtn) {
    backToVideosBtn.addEventListener("click", () => showMasterVideosList());
  }

  inspectorSubtabs.forEach((btn) => {
    btn.addEventListener("click", () => switchInspectorSubtab(btn.dataset.subtab));
  });

  playPauseBtn.addEventListener("click", () => {
    state.isPlaying = !state.isPlaying;
    playPauseBtn.textContent = state.isPlaying ? "Pause" : "Play";
    if (!nativeVideoEl.classList.contains("hidden")) {
      if (state.isPlaying) nativeVideoEl.play();
      else nativeVideoEl.pause();
    }
  });

  timelineSlider.addEventListener("input", (e) => {
    seekToSecond(Number(e.target.value));
  });

  nativeVideoEl.addEventListener("timeupdate", () => {
    if (!nativeVideoEl.classList.contains("hidden")) {
      state.currentTime = nativeVideoEl.currentTime || 0;
      timelineSlider.value = String(state.currentTime);
      updateTimecodeAndLiveReadout();
      drawNativeVideoBoundingBoxes();
    }
  });

  nativeVideoEl.addEventListener("play", () => {
    state.isPlaying = true;
    playPauseBtn.textContent = "Pause";
  });

  nativeVideoEl.addEventListener("pause", () => {
    state.isPlaying = false;
    playPauseBtn.textContent = "Play";
  });

  localeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      localeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeLocale = btn.dataset.locale;
      renderLocalizedMarketing();
    });
  });

  semanticSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    executeSemanticSearch(semanticSearchInput.value);
  });

  const clearSearchBtn = document.getElementById("clear-search-btn");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      clearSemanticSearch();
    });
  }

  const refreshCatalogBtn = document.getElementById("refresh-catalog-btn");
  if (refreshCatalogBtn) {
    refreshCatalogBtn.addEventListener("click", async () => {
      const origText = refreshCatalogBtn.textContent;
      refreshCatalogBtn.textContent = "⏳ Refreshing...";
      refreshCatalogBtn.disabled = true;
      await refreshCatalogFromServer();
      refreshCatalogBtn.textContent = origText;
      refreshCatalogBtn.disabled = false;
    });
  }

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
    if (inputEl) inputEl.addEventListener("input", updateEconomicsCalculator);
  });

  if (resetCatalogBtn) {
    resetCatalogBtn.addEventListener("click", async () => {
      const res = await fetch("/api/assets/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        state.videos = data.videos || [];
        settingsModal.close();
        showMasterVideosList();
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

  /**
   * Non-Blocking Video Upload:
   * Immediately closes the modal, adds a live "Processing via Pub/Sub" row to the Videos table,
   * and updates each step (1. GCS -> 2. Pub/Sub -> 3. Gemini 3.8 -> 4. BigQuery) in the background.
   */
  uploadVideoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(uploadVideoForm);
    if (state.sessionApiKey) formData.append("apiKey", state.sessionApiKey);

    const fileInput = document.getElementById("upload-file");
    const uploadedFile = fileInput.files?.[0];
    const localBlobUrl = uploadedFile ? URL.createObjectURL(uploadedFile) : null;
    const title = formData.get("title") || uploadedFile?.name || "Uploaded Video";
    const creator = formData.get("creator") || "@alex.creates";
    const platform = formData.get("platform") || "TikTok";

    // Close modal immediately and switch to the Master Videos list so nothing blocks the browser!
    const tempJobId = `temp-${Date.now()}`;
    const pendingEntry = {
      jobId: tempJobId,
      eventId: "staging-gcs",
      title: String(title),
      creator: String(creator),
      platform: String(platform),
      status: "STAGING_GCS",
      stageIndex: 1,
      progress: 15
    };

    state.pendingJobs.unshift(pendingEntry);
    uploadVideoForm.reset();
    uploadModal.close();
    switchTab("videos");
    showMasterVideosList();

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Upload failed");

      if (payload.queued && payload.jobId) {
        pendingEntry.jobId = payload.jobId;
        pendingEntry.eventId = payload.eventId;
        pendingEntry.status = payload.status;
        pendingEntry.stageIndex = 2;
        pendingEntry.progress = payload.progress || 30;
        if (payload.eventarcEvent) {
          state.eventarcLog.unshift(payload.eventarcEvent);
        }
        renderVideosMasterView();
        // Continue polling in background without blocking UI
        trackBackgroundPubSubJob(pendingEntry, localBlobUrl);
      } else if (payload.video) {
        state.pendingJobs = state.pendingJobs.filter((j) => j.jobId !== tempJobId);
        if (localBlobUrl) {
          state.uploadedObjectUrlByVideoId.set(payload.video.id, localBlobUrl);
        }
        state.videos.unshift(payload.video);
        if (payload.eventarcEvent) state.eventarcLog.unshift(payload.eventarcEvent);
        renderVideosMasterView();
      }
    } catch {
      state.pendingJobs = state.pendingJobs.filter((j) => j.jobId !== tempJobId);
      renderVideosMasterView();
    }
  });

  if (simulateEventarcBtn) {
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
          "ce-source": "//storage.googleapis.com/projects/_/buckets/clipguard-raw-assets",
          "ce-subject": `objects/${picked}`
        },
        body: JSON.stringify({ bucket: "clipguard-raw-assets", name: picked, size: 5420000 })
      });
      if (res.ok) {
        const catRes = await fetch("/api/catalog");
        const catData = await catRes.json();
        state.videos = catData.videos;
        state.eventarcLog = catData.eventarcLog;
        renderVideosMasterView();
      }
    });
  }

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

  presetQueryChips.innerHTML = "";
  state.sampleQueries.forEach((sq) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "preset-chip-btn";
    chip.textContent = sq.label;
    chip.addEventListener("click", () => executeSemanticSearch(sq.query));
    presetQueryChips.appendChild(chip);
  });

  renderVideosMasterView();
  updateEconomicsCalculator();
  renderArtifactCode();

  requestAnimationFrame(tickPlayback);
}

init();
