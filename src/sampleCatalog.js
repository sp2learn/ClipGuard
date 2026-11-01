/**
 * Pre-loaded VividScale Creator Economy Video Catalog
 * Includes rich multimodal metadata, timestamped product placements,
 * GARM brand safety compliance scorecards, localized ad copy/SEO tags,
 * and semantic moment index entries for cross-video search.
 */

export const SAMPLE_VIDEOS = [
  {
    id: "vid-voltdrive-fizzpop-01",
    title: "Desert Roadtrip: Charging the VoltDrive EV with Ice-Cold FizzPop",
    creator: "@maya.moves",
    platform: "TikTok",
    durationSeconds: 60,
    resolution: "1080x1920 (9:16)",
    uploadedAt: "2026-11-01T13:45:12Z",
    gcsUri: "gs://vividscale-raw-videos/tiktok/vid-voltdrive-fizzpop-01.mp4",
    processingTimeMs: 3840,
    legacyCostUsd: 0.23,
    geminiCostUsd: 0.0041,
    modelUsed: "gemini-3.8-flash + gemini-embedding-2",
    themeColor: "#0ea5e9",
    accentColor: "#f43f5e",
    summary:
      "Creator @maya.moves stops at a solar EV supercharger in Joshua Tree with her metallic-blue VoltDrive R1S electric SUV, cracks open a cherry FizzPop Craft Soda while leaning against the charging port, and showcases the cabin dashboard and frunk cooler.",
    brandSafety: {
      overallScore: 98,
      status: "SAFE",
      verdictLabel: "SAFE FOR ENTERPRISE ADS",
      summaryRationale:
        "Clean lifestyle and automotive content. Vehicle is parked safely at a designated charging station during product interaction. No profanity, unsafe driving, or competitor brand conflicts detected across audio, visual frames, or on-screen text.",
      garmCategories: [
        {
          category: "Adult & Explicit Content",
          riskLevel: "NONE",
          score: 100,
          modality: "Visual + Audio",
          notes: "Wholesome outdoor travel attire and clean language."
        },
        {
          category: "Dangerous Acts & Unsafe Driving",
          riskLevel: "NONE",
          score: 96,
          modality: "Visual Frame",
          timestamp: "00:04",
          notes: "Highway driving footage at 00:04 is hands-on-wheel; soda consumption occurs while vehicle is parked and plugged in (00:12-00:26)."
        },
        {
          category: "Hate Speech & Harassment",
          riskLevel: "NONE",
          score: 100,
          modality: "Audio Speech + OCR",
          notes: "Positive, inclusive travel commentary."
        },
        {
          category: "Competitor Brand Clash",
          riskLevel: "NONE",
          score: 98,
          modality: "Visual + OCR",
          notes: "Only sponsored partners (VoltDrive EV & FizzPop Soda) visible in frame."
        },
        {
          category: "FTC / Disclosure Compliance",
          riskLevel: "NONE",
          score: 97,
          modality: "On-Screen OCR + Audio",
          timestamp: "00:02",
          notes: "Clear '#ad' and 'Paid Partnership with VoltDrive & FizzPop' overlay present at 00:02."
        }
      ],
      flags: []
    },
    productPlacements: [
      {
        id: "pp-101",
        productName: "VoltDrive R1S Electric SUV",
        brand: "VoltDrive Motors",
        category: "Electric Vehicles / Automotive",
        startTime: 2,
        endTime: 14,
        timestampLabel: "00:02 - 00:14",
        prominence: "Primary Hero",
        modality: ["Visual Frame", "Audio Mention", "On-Screen OCR"],
        confidence: 0.99,
        sentiment: "Positive",
        boundingBox: { x: 0.14, y: 0.36, w: 0.72, h: 0.44, label: "VoltDrive R1S EV (99%)" },
        description:
          "Metallic blue electric SUV pulling into solar charging bay; LED charge ring glowing green on front fender."
      },
      {
        id: "pp-102",
        productName: "FizzPop Wild Cherry Prebiotic Soda (12oz Can)",
        brand: "FizzPop Beverage Co.",
        category: "Beverages / Craft Soda",
        startTime: 14,
        endTime: 29,
        timestampLabel: "00:14 - 00:29",
        prominence: "Primary Hero",
        modality: ["Visual Frame", "Audio Sound Effect", "Audio Mention"],
        confidence: 0.98,
        sentiment: "Enthusiastic",
        boundingBox: { x: 0.52, y: 0.28, w: 0.24, h: 0.32, label: "FizzPop Cherry Can (98%)" },
        description:
          "Creator pulls an ice-cold crimson FizzPop soda can from the EV's front trunk cooler, pops the tab next to the microphone, and drinks the soda while leaning beside the charging electric car."
      },
      {
        id: "pp-103",
        productName: "VoltDrive Panoramic Cockpit Display",
        brand: "VoltDrive Motors",
        category: "Automotive Infotainment",
        startTime: 30,
        endTime: 46,
        timestampLabel: "00:30 - 00:46",
        prominence: "Secondary Feature",
        modality: ["Visual Frame", "On-Screen OCR"],
        confidence: 0.95,
        sentiment: "Positive",
        boundingBox: { x: 0.18, y: 0.24, w: 0.64, h: 0.38, label: "VoltDrive UI 80% Charge (95%)" },
        description:
          "Close-up of the 15-inch OLED center screen showing 310 miles of range added in 18 minutes while FizzPop can sits in the wireless-charging console."
      },
      {
        id: "pp-104",
        productName: "SunPeak Polarized Aviators",
        brand: "SunPeak Eyewear",
        category: "Fashion Accessories",
        startTime: 47,
        endTime: 58,
        timestampLabel: "00:47 - 00:58",
        prominence: "Background Cameo",
        modality: ["Visual Frame"],
        confidence: 0.89,
        sentiment: "Neutral",
        boundingBox: { x: 0.36, y: 0.16, w: 0.28, h: 0.12, label: "SunPeak Aviators (89%)" },
        description: "Creator wears gold-rimmed polarized sunglasses during sunset outro."
      }
    ],
    localizedMarketing: {
      "en-US": {
        languageName: "English (US)",
        headline: "Zero Emissions, 100% Fizz: The Ultimate Desert Roadtrip Combo ⚡🍒",
        adCopy:
          "310 miles of range in 18 minutes + an ice-cold FizzPop straight from the VoltDrive frunk cooler. Ready to upgrade your weekend getaway?",
        cta: "Book a VoltDrive Test Drive & Claim Your Free FizzPop 6-Pack",
        seoTags: ["#VoltDriveEV", "#FizzPopSoda", "#ElectricRoadtrip", "#JoshuaTree", "#SustainableTravel", "#EVLife"]
      },
      "es-MX": {
        languageName: "Español (LATAM)",
        headline: "Cero Emisiones, 100% Sabor: El Dúo Perfecto para tu Roadtrip ⚡🍒",
        adCopy:
          "500 km de autonomía en 18 minutos y una FizzPop bien fría directo de la cajuela frontal de tu VoltDrive. ¿Listo para tu próxima aventura?",
        cta: "Agenda tu Prueba de Manejo VoltDrive hoy",
        seoTags: ["#AutosElectricos", "#VoltDrive", "#FizzPop", "#ViajePorCarretera", "#MovilidadSustentable"]
      },
      "ja-JP": {
        languageName: "日本語 (JP)",
        headline: "ゼロエミッション×爽快フィズ：砂漠ロードトリップの最強コンビ ⚡🍒",
        adCopy:
          "わずか18分の充電で500km走行可能。VoltDriveのフロントトランククーラーから取り出したキンキンに冷えたFizzPopで最高のリフレッシュを。",
        cta: "VoltDrive試乗予約＆限定FizzPopセットを受け取る",
        seoTags: ["#EVライフ", "#電気自動車", "#ロードトリップ", "#VoltDrive", "#クラフトソーダ"]
      },
      "de-DE": {
        languageName: "Deutsch (DE)",
        headline: "Null Emissionen, 100 % Erfrischung: Dein E-Roadtrip durch die Wüste ⚡🍒",
        adCopy:
          "500 km Reichweite in 18 Minuten laden – während du eine eiskalte FizzPop direkt aus dem Frunk-Kühler deines VoltDrive genießt.",
        cta: "Jetzt VoltDrive Probefahrt buchen",
        seoTags: ["#Elektroauto", "#EMobilität", "#Roadtrip", "#VoltDriveEV", "#FizzPop"]
      },
      "pt-BR": {
        languageName: "Português (BR)",
        headline: "Zero Emissões, 100% Refrescância: A Dupla Perfeita na Estrada ⚡🍒",
        adCopy:
          "Carregamento ultrarrápido em 18 minutos e uma FizzPop gelada direto do porta-malas dianteiro do seu VoltDrive EV.",
        cta: "Agende seu Test Drive VoltDrive",
        seoTags: ["#CarroEletrico", "#VoltDrive", "#FizzPop", "#ViagemDeCarro", "#FuturoEletrico"]
      }
    },
    moments: [
      {
        momentId: "mom-101a",
        startTime: 2,
        endTime: 13,
        timestampLabel: "00:02 - 00:13",
        visualDescription:
          "Metallic blue VoltDrive R1S electric SUV pulls into a desert solar supercharger station; creator plugs the fast-charger cable into the electric car port.",
        audioTranscript:
          "Nothing beats pulling into Joshua Tree with 40% battery left and plugging into the solar fast-charger!",
        ocrText: "#AD PAID PARTNERSHIP • VOLTDRIVE R1S • 350kW SOLAR SUPERCHARGER",
        keywords: ["electric car", "EV", "charging", "SUV", "desert", "solar", "automotive", "vehicle"]
      },
      {
        momentId: "mom-101b",
        startTime: 14,
        endTime: 29,
        timestampLabel: "00:14 - 00:29",
        visualDescription:
          "Creator opens the front trunk cooler of the electric car, grabs a red FizzPop soda can, cracks it open, and drinks a soda while leaning against the charging electric car in the desert sun.",
        audioTranscript:
          "While the EV charges in 18 minutes, I've got the frunk cooler stocked with ice-cold Wild Cherry FizzPop soda. Listen to that fizz!",
        ocrText: "FIZZPOP WILD CHERRY • 0g SUGAR • FRUNK COOLER HACK",
        keywords: [
          "drinks a soda",
          "drinking soda",
          "electric car",
          "near an electric car",
          "beverage",
          "cherry soda",
          "can",
          "refreshment",
          "EV cooler",
          "person drinking soda"
        ]
      },
      {
        momentId: "mom-101c",
        startTime: 30,
        endTime: 46,
        timestampLabel: "00:30 - 00:46",
        visualDescription:
          "Interior cabin shot of the electric vehicle dashboard screen showing 80% battery and 310 miles range with a soda can in the center console cupholder.",
        audioTranscript:
          "Boom—310 miles of range back on the dash before I even finished my can of soda. Zero range anxiety.",
        ocrText: "310 MILES RANGE • 80% CHARGED IN 18 MIN",
        keywords: ["dashboard", "screen", "battery range", "interior", "cupholder", "soda", "electric car"]
      },
      {
        momentId: "mom-101d",
        startTime: 47,
        endTime: 60,
        timestampLabel: "00:47 - 01:00",
        visualDescription:
          "Creator wearing SunPeak aviator sunglasses waves from the driver seat as the electric SUV drives off toward the sunset highway.",
        audioTranscript:
          "Link in bio to test drive the VoltDrive R1S and grab a free 6-pack of FizzPop for your next roadtrip!",
        ocrText: "LINK IN BIO • VOLTDRIVE x FIZZPOP",
        keywords: ["sunglasses", "sunset", "highway", "call to action", "outro"]
      }
    ]
  },
  {
    id: "vid-glowlab-serum-02",
    title: "GRWM Unboxing: GlowLab 20% Vitamin C Serum Glass Skin Test",
    creator: "@chloe.skincare",
    platform: "Instagram Reels",
    durationSeconds: 45,
    resolution: "1080x1920 (9:16)",
    uploadedAt: "2026-11-01T13:52:40Z",
    gcsUri: "gs://vividscale-raw-videos/ig-reels/vid-glowlab-serum-02.mp4",
    processingTimeMs: 3420,
    legacyCostUsd: 0.21,
    geminiCostUsd: 0.0036,
    modelUsed: "gemini-3.8-flash + gemini-embedding-2",
    themeColor: "#f59e0b",
    accentColor: "#ec4899",
    summary:
      "Beauty creator @chloe.skincare unboxes the frosted-amber GlowLab Vitamin C + Ferulic dropper bottle in a sunlit bathroom, applies two drops to her cheek, and shows a glowing finish—but makes an unsubstantiated medical claim at 00:28 ('literally cures prescription eczema overnight').",
    brandSafety: {
      overallScore: 64,
      status: "REVIEW",
      verdictLabel: "REVIEW REQUIRED (FTC / MEDICAL CLAIM)",
      summaryRationale:
        "Visual content is brand-safe and high production quality, but Gemini 3.8 Flash detected an unapproved medical efficacy claim in the spoken audio track and auto-captions at 00:28 ('cures clinical eczema and rosacea overnight'), which violates FDA/FTC cosmetic advertising guidelines.",
      garmCategories: [
        {
          category: "Adult & Explicit Content",
          riskLevel: "NONE",
          score: 100,
          modality: "Visual + Audio",
          notes: "Standard beauty GRWM close-up in bathrobe."
        },
        {
          category: "Medical / FTC Unsubstantiated Claims",
          riskLevel: "MEDIUM",
          score: 42,
          modality: "Audio Speech + On-Screen OCR",
          timestamp: "00:28",
          notes: "Creator states product 'cures clinical eczema and rosacea overnight without steroid creams' — requires compliance edit before paid amplification."
        },
        {
          category: "Dangerous Acts",
          riskLevel: "NONE",
          score: 100,
          modality: "Visual Frame",
          notes: "Safe topical skincare application."
        },
        {
          category: "Competitor Brand Clash",
          riskLevel: "NONE",
          score: 95,
          modality: "Visual Frame",
          notes: "No competing skincare bottles visible on vanity."
        }
      ],
      flags: [
        {
          severity: "MEDIUM",
          timestamp: "00:28 - 00:35",
          startTime: 28,
          category: "FTC / FDA Cosmetic Claim Violation",
          modality: "Audio Speech + OCR",
          quote: "\"This serum literally cures clinical eczema and rosacea overnight—throw away your prescription creams!\"",
          remediation: "Trim segment 00:28–00:35 or replace voiceover with approved cosmetic claim: 'visibly brightens dull skin and supports moisture barrier'."
        }
      ]
    },
    productPlacements: [
      {
        id: "pp-201",
        productName: "GlowLab C-Bright 20% Vitamin C + Ferulic Serum",
        brand: "GlowLab Derm",
        category: "Beauty & Skincare",
        startTime: 1,
        endTime: 16,
        timestampLabel: "00:01 - 00:16",
        prominence: "Primary Hero",
        modality: ["Visual Frame", "On-Screen OCR", "Audio Mention"],
        confidence: 0.99,
        sentiment: "Enthusiastic",
        boundingBox: { x: 0.34, y: 0.32, w: 0.32, h: 0.42, label: "GlowLab C-Bright Bottle (99%)" },
        description: "Amber glass dropper bottle unboxed from recyclable orange rigid carton with gold foil logo."
      },
      {
        id: "pp-202",
        productName: "GlowLab Peptide Cloud Moisturizer",
        brand: "GlowLab Derm",
        category: "Beauty & Skincare",
        startTime: 36,
        endTime: 44,
        timestampLabel: "00:36 - 00:44",
        prominence: "Secondary Feature",
        modality: ["Visual Frame", "Audio Mention"],
        confidence: 0.94,
        sentiment: "Positive",
        boundingBox: { x: 0.58, y: 0.48, w: 0.26, h: 0.28, label: "GlowLab Cloud Jar (94%)" },
        description: "Frosted white jar layered after serum application."
      }
    ],
    localizedMarketing: {
      "en-US": {
        languageName: "English (US)",
        headline: "Morning Glass Skin in 2 Drops ✨🍊 (Compliance-Approved Copy)",
        adCopy:
          "Formulated with 20% L-Ascorbic Acid + Ferulic Acid to visibly brighten dullness and boost radiance—with zero sticky residue.",
        cta: "Shop GlowLab C-Bright — 20% Off First Order",
        seoTags: ["#GlowLab", "#VitaminCSerum", "#GlassSkinRoutine", "#GRWMSkincare", "#DermTested"]
      },
      "es-MX": {
        languageName: "Español (LATAM)",
        headline: "Piel Radiante cada Mañana en Solo 2 Gotas ✨🍊",
        adCopy:
          "Con 20% de Vitamina C pura y Ácido Ferúlico para iluminar visiblemente tu piel y proteger tu barrera cutánea sin sensación grasosa.",
        cta: "Compra GlowLab con 20% de Descuento",
        seoTags: ["#RutinaDeSkincare", "#VitaminaC", "#PielDePorcelana", "#GlowLab", "#Belleza"]
      },
      "ja-JP": {
        languageName: "日本語 (JP)",
        headline: "朝2滴でツヤ玉水光肌へ✨ GlowLab ビタミンC美容液 🍊",
        adCopy:
          "ピュアビタミンC 20%＋フェルラ酸配合。ベタつかず肌にすっと馴染み、透明感あふれる明るい印象の素肌へ導きます。",
        cta: "GlowLab公式ストアで初回20%OFFを試す",
        seoTags: ["#スキンケア紹介", "#ビタミンC美容液", "#水光肌", "#朝スキンケア", "#GlowLab"]
      },
      "de-DE": {
        languageName: "Deutsch (DE)",
        headline: "Strahlender Glow am Morgen mit nur 2 Tropfen ✨🍊",
        adCopy:
          "20 % reines Vitamin C & Ferulasäure für sichtbar ebenmäßigere, strahlende Haut ganz ohne Kleben.",
        cta: "Jetzt GlowLab entdecken & 20 % sparen",
        seoTags: ["#Hautpflege", "#VitaminCSerum", "#GlowSkin", "#SkincareRoutine", "#GlowLab"]
      },
      "pt-BR": {
        languageName: "Português (BR)",
        headline: "Pele Iluminada pela Manhã em Apenas 2 Gotas ✨🍊",
        adCopy:
          "Com 20% de Vitamina C pura e Ácido Ferúlico para uniformizar o tom e devolver o viço natural sem pesar.",
        cta: "Compre GlowLab com 20% OFF",
        seoTags: ["#SkincareBrasil", "#VitaminaC", "#RotinaMatinal", "#GlowLab", "#PeleRadiante"]
      }
    },
    moments: [
      {
        momentId: "mom-201a",
        startTime: 1,
        endTime: 16,
        timestampLabel: "00:01 - 00:16",
        visualDescription:
          "Creator unboxes an orange GlowLab skincare box on a marble bathroom counter, revealing an amber glass Vitamin C serum dropper bottle.",
        audioTranscript:
          "Unbox the viral GlowLab 20% Vitamin C serum with me! Look at this gorgeous UV-protective amber glass dropper.",
        ocrText: "GLOWLAB 20% VITAMIN C + FERULIC • UNBOXING",
        keywords: ["unboxing", "skincare", "serum", "vitamin C", "dropper bottle", "beauty", "bathroom"]
      },
      {
        momentId: "mom-201b",
        startTime: 17,
        endTime: 27,
        timestampLabel: "00:17 - 00:27",
        visualDescription:
          "Close-up of creator dispensing two golden drops of serum onto her cheekbones and patting it into glowing skin.",
        audioTranscript:
          "Two drops every morning and it absorbs in five seconds flat with zero hot-dog water smell.",
        ocrText: "ZERO STICKINESS • INSTANT GLASS SKIN",
        keywords: ["applying serum", "glass skin", "cheek", "morning routine", "dropper", "beauty application"]
      },
      {
        momentId: "mom-201c",
        startTime: 28,
        endTime: 35,
        timestampLabel: "00:28 - 00:35",
        visualDescription:
          "Creator points at text overlay claiming medical cure for eczema and rosacea while holding the skincare bottle.",
        audioTranscript:
          "This serum literally cures clinical eczema and rosacea overnight—throw away your prescription creams!",
        ocrText: "CURES ECZEMA OVERNIGHT!! NO MORE RX CREAMS",
        keywords: [
          "medical claim",
          "dermatologist claims",
          "cures eczema",
          "rosacea",
          "FTC violation",
          "unsubstantiated claim",
          "skincare serum"
        ]
      }
    ]
  },
  {
    id: "vid-apexpulse-skate-03",
    title: "Rooftop Rail Drop + ApexPulse Energy Challenge",
    creator: "@jax.thrasher",
    platform: "YouTube Shorts",
    durationSeconds: 52,
    resolution: "1080x1920 (9:16)",
    uploadedAt: "2026-11-01T14:01:05Z",
    gcsUri: "gs://vividscale-raw-videos/yt-shorts/vid-apexpulse-skate-03.mp4",
    processingTimeMs: 4110,
    legacyCostUsd: 0.25,
    geminiCostUsd: 0.0043,
    modelUsed: "gemini-3.8-flash + gemini-embedding-2",
    themeColor: "#ef4444",
    accentColor: "#a855f7",
    summary:
      "Skateboarder @jax.thrasher chugs an ApexPulse Neon Citrus energy drink, then grinds an unguarded 2nd-story parking garage ledge into live street traffic without a helmet (00:19), passes a competitor VoltBull banner (00:34), and uses explicit audio lyrics (00:41).",
    brandSafety: {
      overallScore: 31,
      status: "BLOCKED",
      verdictLabel: "BLOCKED — HIGH BRAND SAFETY RISK",
      summaryRationale:
        "Flagged across all 3 modalities: (1) Visual Frame at 00:19 shows a high-fall-risk rooftop/garage rail stunt into active street traffic with no helmet; (2) Visual + OCR at 00:34 captures a rival 'VoltBull Energy' billboard directly behind the creator; (3) Audio track at 00:41 contains unbleeped explicit profanity.",
      garmCategories: [
        {
          category: "Dangerous Acts & Self-Harm Risk",
          riskLevel: "HIGH",
          score: 18,
          modality: "Visual Frame",
          timestamp: "00:19",
          notes: "Creator drops from elevated parking structure ledge directly into oncoming city traffic without protective gear."
        },
        {
          category: "Competitor Brand Clash",
          riskLevel: "HIGH",
          score: 35,
          modality: "Visual Frame + OCR",
          timestamp: "00:34",
          notes: "Direct rival 'VoltBull Energy' neon sign occupies 22% of upper-right frame during brand celebration."
        },
        {
          category: "Obscenity & Profanity",
          riskLevel: "MEDIUM",
          score: 45,
          modality: "Audio Speech",
          timestamp: "00:41",
          notes: "Explicit f-word in background hip-hop track and creator reaction shout."
        },
        {
          category: "Adult & Explicit Content",
          riskLevel: "NONE",
          score: 95,
          modality: "Visual Frame",
          notes: "No adult nudity."
        }
      ],
      flags: [
        {
          severity: "HIGH",
          timestamp: "00:19 - 00:29",
          startTime: 19,
          category: "GARM Dangerous Acts / Public Traffic Hazard",
          modality: "Visual Frame",
          quote: "[Visual Detection] Unprotected skateboard drop from 14ft garage parapet into active two-way street.",
          remediation: "Reject asset for paid ad insertion per Enterprise Advertiser Safety Policy §4.2."
        },
        {
          severity: "HIGH",
          timestamp: "00:33 - 00:39",
          startTime: 33,
          category: "Competitor Brand Exclusivity Clash",
          modality: "Visual + On-Screen OCR",
          quote: "[OCR Detection] Competitor logo 'VOLTBULL ENERGY DRINK' clearly legible in background store window.",
          remediation: "Apply background blur or disqualify from ApexPulse exclusive campaign."
        },
        {
          severity: "MEDIUM",
          timestamp: "00:41 - 00:46",
          startTime: 41,
          category: "Audio Profanity / Explicit Lyrics",
          modality: "Audio Speech",
          quote: "\"Holy f*** we actually landed that rail first try!\"",
          remediation: "Mute or bleep audio track between 00:41 and 00:44."
        }
      ]
    },
    productPlacements: [
      {
        id: "pp-301",
        productName: "ApexPulse Neon Citrus 300mg Energy Can",
        brand: "ApexPulse Nutrition",
        category: "Energy Drinks",
        startTime: 1,
        endTime: 12,
        timestampLabel: "00:01 - 00:12",
        prominence: "Primary Hero",
        modality: ["Visual Frame", "Audio Mention"],
        confidence: 0.98,
        sentiment: "High-Energy",
        boundingBox: { x: 0.38, y: 0.25, w: 0.26, h: 0.35, label: "ApexPulse Can (98%)" },
        description: "Matte black and neon green energy drink can held close to fisheye lens before skate run."
      },
      {
        id: "pp-302",
        productName: "VoltBull Energy (UNAPPROVED COMPETITOR)",
        brand: "VoltBull Corp",
        category: "Energy Drinks (Competitor)",
        startTime: 33,
        endTime: 39,
        timestampLabel: "00:33 - 00:39",
        prominence: "Background Cameo (Conflict)",
        modality: ["Visual Frame", "On-Screen OCR"],
        confidence: 0.93,
        sentiment: "Conflict",
        boundingBox: { x: 0.62, y: 0.12, w: 0.30, h: 0.22, label: "CONFLICT: VoltBull Sign (93%)" },
        description: "Illuminated competitor signage visible behind skater after landing trick."
      }
    ],
    localizedMarketing: {
      "en-US": {
        languageName: "English (US)",
        headline: "[HOLD — ASSET FLAGGED] Dial In Your Focus with ApexPulse Neon Citrus ⚡",
        adCopy:
          "300mg natural caffeine + electrolytes for zero-crash focus. (Note: Asset blocked from auto-publish pending safety review).",
        cta: "Review Compliance Flags Before Publishing",
        seoTags: ["#ApexPulse", "#SkateLife", "#EnergyDrink", "#ExtremeSports"]
      },
      "es-MX": {
        languageName: "Español (LATAM)",
        headline: "[EN REVISIÓN] Energía Extrema con ApexPulse Neon Citrus ⚡",
        adCopy:
          "300mg de cafeína natural y electrolitos sin azúcar. (Activo retenido por política de seguridad de marca).",
        cta: "Revisar Alertas de Seguridad",
        seoTags: ["#ApexPulse", "#Skateboarding", "#EnergiaSinLimites"]
      },
      "ja-JP": {
        languageName: "日本語 (JP)",
        headline: "【配信保留・安全性要確認】ApexPulse ネオンシトラス ⚡",
        adCopy:
          "天然カフェイン300mg＆電解質配合。（※危険行為および競合ロゴ検出のため広告配信は自動停止されています）",
        cta: "ブランドセーフティ警告を確認する",
        seoTags: ["#ApexPulse", "#エナジードリンク", "#スケートボード"]
      },
      "de-DE": {
        languageName: "Deutsch (DE)",
        headline: "[GESPERRT — SICHERHEITSPRÜFUNG] ApexPulse Neon Citrus ⚡",
        adCopy:
          "300 mg natürliches Koffein & Elektrolyte. (Asset wegen riskanter Stunts automatisch pausiert).",
        cta: "Sicherheitsbericht prüfen",
        seoTags: ["#ApexPulse", "#EnergyDrink", "#Skatepark"]
      },
      "pt-BR": {
        languageName: "Português (BR)",
        headline: "[BLOQUEADO — REVISÃO DE SEGURANÇA] ApexPulse Neon Citrus ⚡",
        adCopy:
          "300mg de cafeína natural e eletrólitos. (Vídeo pausado automaticamente por risco de segurança de marca).",
        cta: "Verificar Alertas de Compliance",
        seoTags: ["#ApexPulse", "#SkateBrasil", "#Energetico"]
      }
    },
    moments: [
      {
        momentId: "mom-301a",
        startTime: 1,
        endTime: 12,
        timestampLabel: "00:01 - 00:12",
        visualDescription:
          "Skater holds a neon-green ApexPulse energy drink can toward a fisheye camera on top of a concrete parking garage.",
        audioTranscript:
          "Cracking open a Neon Citrus ApexPulse before we send the biggest rooftop gap in downtown!",
        ocrText: "APEXPULSE 300MG • ROOFTOP CHALLENGE",
        keywords: ["energy drink", "skateboarder", "fisheye", "can", "rooftop", "citrus"]
      },
      {
        momentId: "mom-301b",
        startTime: 19,
        endTime: 30,
        timestampLabel: "00:19 - 00:30",
        visualDescription:
          "Skateboarder performs a dangerous stunt grinding an unguarded 14-foot parking garage ledge without a helmet and lands in active street traffic in front of a braking sedan.",
        audioTranscript: "[Skateboard wheels screeching, car horn blaring in street]",
        ocrText: "DO NOT TRY THIS • NO HELMET SEND",
        keywords: [
          "dangerous stunt",
          "skateboard trick",
          "without safety gear",
          "no helmet",
          "traffic hazard",
          "unsafe",
          "brand safety risk"
        ]
      },
      {
        momentId: "mom-301c",
        startTime: 33,
        endTime: 45,
        timestampLabel: "00:33 - 00:45",
        visualDescription:
          "Skater celebrates on sidewalk directly in front of a glowing 'VoltBull Energy' competitor sign while shouting profanity.",
        audioTranscript: "Holy f*** we actually landed that rail first try!",
        ocrText: "VOLTBULL ENERGY DRINK — AVAILABLE HERE",
        keywords: ["competitor logo", "profanity", "explicit audio", "brand clash", "VoltBull"]
      }
    ]
  },
  {
    id: "vid-brewcraft-pixelbook-04",
    title: "Minimalist Desk Tour: Coding on PixelBook Pro with BrewCraft Cold Brew",
    creator: "@dev.kenji",
    platform: "YouTube Shorts",
    durationSeconds: 38,
    resolution: "1080x1920 (9:16)",
    uploadedAt: "2026-11-01T14:08:19Z",
    gcsUri: "gs://vividscale-raw-videos/yt-shorts/vid-brewcraft-pixelbook-04.mp4",
    processingTimeMs: 3190,
    legacyCostUsd: 0.19,
    geminiCostUsd: 0.0033,
    modelUsed: "gemini-3.8-flash + gemini-embedding-2",
    themeColor: "#10b981",
    accentColor: "#6366f1",
    summary:
      "Tech creator @dev.kenji pours BrewCraft Vanilla Oat Nitro Cold Brew over ice in a ribbed glass tumbler right next to his matte-silver PixelBook Pro 16 laptop and custom mechanical keyboard on a walnut standing desk.",
    brandSafety: {
      overallScore: 97,
      status: "SAFE",
      verdictLabel: "SAFE FOR ENTERPRISE ADS",
      summaryRationale:
        "Calm, aesthetic tech productivity reel. No sensitive data on laptop screen, no copyrighted music issues, and clear sponsor disclosure.",
      garmCategories: [
        {
          category: "Adult & Explicit Content",
          riskLevel: "NONE",
          score: 100,
          modality: "Visual + Audio",
          notes: "Clean studio desk workspace."
        },
        {
          category: "Dangerous Acts",
          riskLevel: "NONE",
          score: 100,
          modality: "Visual Frame",
          notes: "Safe indoor environment."
        },
        {
          category: "Competitor Brand Clash",
          riskLevel: "NONE",
          score: 96,
          modality: "Visual Frame",
          notes: "Only PixelBook Pro and BrewCraft logos present."
        },
        {
          category: "FTC / Disclosure Compliance",
          riskLevel: "NONE",
          score: 95,
          modality: "On-Screen OCR",
          timestamp: "00:01",
          notes: "Includes #SponsoredByBrewCraft and #PixelBookPartner."
        }
      ],
      flags: []
    },
    productPlacements: [
      {
        id: "pp-401",
        productName: "BrewCraft Vanilla Oat Nitro Cold Brew",
        brand: "BrewCraft Roasters",
        category: "Coffee & Beverages",
        startTime: 3,
        endTime: 15,
        timestampLabel: "00:03 - 00:15",
        prominence: "Primary Hero",
        modality: ["Visual Frame", "Audio ASMR", "Audio Mention"],
        confidence: 0.99,
        sentiment: "Positive",
        boundingBox: { x: 0.18, y: 0.34, w: 0.28, h: 0.38, label: "BrewCraft Cold Brew (99%)" },
        description: "Creator pours cascading nitro cold brew coffee into an iced glass mug on a minimalist walnut desk."
      },
      {
        id: "pp-402",
        productName: "PixelBook Pro 16 Ultra Laptop",
        brand: "PixelBook Tech",
        category: "Consumer Electronics / Laptops",
        startTime: 12,
        endTime: 36,
        timestampLabel: "00:12 - 00:36",
        prominence: "Primary Hero",
        modality: ["Visual Frame", "On-Screen OCR", "Audio Mention"],
        confidence: 0.98,
        sentiment: "Positive",
        boundingBox: { x: 0.44, y: 0.26, w: 0.46, h: 0.42, label: "PixelBook Pro 16 (98%)" },
        description: "Matte-silver ultrabook displaying a clean TypeScript IDE next to the iced coffee tumbler."
      }
    ],
    localizedMarketing: {
      "en-US": {
        languageName: "English (US)",
        headline: "Deep Work Mode: Nitro Cold Brew + 22-Hour Battery Life ☕💻",
        adCopy:
          "Pair velvety BrewCraft Oat Cold Brew with the silent, fanless PixelBook Pro 16 for the ultimate minimalist coding setup.",
        cta: "Explore the PixelBook Pro x BrewCraft Bundle",
        seoTags: ["#DeskSetup", "#PixelBookPro", "#BrewCraftCoffee", "#TechTok", "#SoftwareEngineer", "#MinimalistDesk"]
      },
      "es-MX": {
        languageName: "Español (LATAM)",
        headline: "Modo Productividad: Cold Brew Nitro + 22 Horas de Batería ☕💻",
        adCopy:
          "Combina el suave sabor de BrewCraft con la potencia silenciosa de la PixelBook Pro 16 en tu escritorio minimalista.",
        cta: "Descubre el Paquete PixelBook + BrewCraft",
        seoTags: ["#SetupMinimalista", "#Programador", "#ColdBrew", "#PixelBookPro", "#Tecnologia"]
      },
      "ja-JP": {
        languageName: "日本語 (JP)",
        headline: "究極のミニマルデスク：BrewCraftコールドブリュー × PixelBook Pro ☕💻",
        adCopy:
          "なめらかなナイトロコールドブリューを片手に、22時間駆動のPixelBook Pro 16で最高のコーディング体験を。",
        cta: "デスクツアー掲載アイテムを見る",
        seoTags: ["#デスクツアー", "#ガジェット紹介", "#エンジニア", "#アイスコーヒー", "#PixelBookPro"]
      },
      "de-DE": {
        languageName: "Deutsch (DE)",
        headline: "Deep-Work-Setup: Nitro Cold Brew & 22 Stunden Akkulaufzeit ☕💻",
        adCopy:
          "Samtiger BrewCraft Oat Cold Brew trifft auf das lautlose PixelBook Pro 16 für maximale Produktivität am Schreibtisch.",
        cta: "Zum PixelBook Pro & BrewCraft Bundle",
        seoTags: ["#DeskSetup", "#HomeOffice", "#PixelBookPro", "#ColdBrewCoffee", "#CodingLife"]
      },
      "pt-BR": {
        languageName: "Português (BR)",
        headline: "Foco Total: Nitro Cold Brew + 22 Horas de Bateria ☕💻",
        adCopy:
          "Combine a cremosidade do BrewCraft Cold Brew com a performance silenciosa do PixelBook Pro 16 no seu setup minimalista.",
        cta: "Conheça o Combo PixelBook Pro + BrewCraft",
        seoTags: ["#SetupMinimalista", "#DevLife", "#PixelBookPro", "#CafeGelado", "#Produtividade"]
      }
    },
    moments: [
      {
        momentId: "mom-401a",
        startTime: 3,
        endTime: 18,
        timestampLabel: "00:03 - 00:18",
        visualDescription:
          "Person pouring and drinking iced coffee from a ribbed glass tumbler next to an open silver laptop and mechanical keyboard on a minimalist wooden desk.",
        audioTranscript:
          "9 AM deep-work ritual: pouring a can of BrewCraft Vanilla Oat Nitro Cold Brew right next to the PixelBook Pro 16.",
        ocrText: "9:00 AM DEEP WORK • BREWCRAFT NITRO + PIXELBOOK PRO",
        keywords: [
          "drinking iced coffee",
          "next to a laptop",
          "minimalist desk",
          "cold brew",
          "coding",
          "keyboard",
          "workspace",
          "coffee"
        ]
      },
      {
        momentId: "mom-401b",
        startTime: 19,
        endTime: 38,
        timestampLabel: "00:19 - 00:38",
        visualDescription:
          "Close-up of creator typing code on the PixelBook Pro 16 with ultra-thin bezels while sipping iced coffee.",
        audioTranscript:
          "Zero fan noise while compiling containers, and 22 hours of battery life so I never even unpack the charger.",
        ocrText: "22 HR BATTERY • SILENT COMPILATION",
        keywords: ["laptop screen", "typing", "developer", "ultrabook", "battery life", "desk tour"]
      }
    ]
  },
  {
    id: "vid-aerofit-watch-05",
    title: "5AM Coastal 10K Pace Check with AeroFit Titanium Watch",
    creator: "@elena.runs",
    platform: "TikTok",
    durationSeconds: 58,
    resolution: "1080x1920 (9:16)",
    uploadedAt: "2026-11-01T14:12:55Z",
    gcsUri: "gs://vividscale-raw-videos/tiktok/vid-aerofit-watch-05.mp4",
    processingTimeMs: 3680,
    legacyCostUsd: 0.24,
    geminiCostUsd: 0.0040,
    modelUsed: "gemini-3.8-flash + gemini-embedding-2",
    themeColor: "#8b5cf6",
    accentColor: "#14b8a6",
    summary:
      "Marathoner @elena.runs checks real-time VO2 max, heart-rate zones, and cadence on her AeroFit Ultra Titanium smartwatch while running along a scenic coastal bike path at sunrise, finishing with HydraLyte electrolyte water.",
    brandSafety: {
      overallScore: 99,
      status: "SAFE",
      verdictLabel: "SAFE FOR ENTERPRISE ADS",
      summaryRationale:
        "Exemplary athletic & wellness content. Runner stays on dedicated pedestrian coastal trail, uses accurate fitness tracking terminology, and includes clear sponsor tags.",
      garmCategories: [
        {
          category: "Adult & Explicit Content",
          riskLevel: "NONE",
          score: 100,
          modality: "Visual + Audio",
          notes: "Standard athletic running apparel."
        },
        {
          category: "Dangerous Acts",
          riskLevel: "NONE",
          score: 99,
          modality: "Visual Frame",
          notes: "Dedicated pedestrian path with reflective vest at dawn."
        },
        {
          category: "Competitor Brand Clash",
          riskLevel: "NONE",
          score: 100,
          modality: "Visual + OCR",
          notes: "Exclusive focus on AeroFit Titanium watch and HydraLyte bottle."
        }
      ],
      flags: []
    },
    productPlacements: [
      {
        id: "pp-501",
        productName: "AeroFit Ultra Titanium GPS Smartwatch",
        brand: "AeroFit Wearables",
        category: "Wearables & Fitness Tech",
        startTime: 4,
        endTime: 32,
        timestampLabel: "00:04 - 00:32",
        prominence: "Primary Hero",
        modality: ["Visual Frame", "On-Screen OCR", "Audio Mention"],
        confidence: 0.99,
        sentiment: "Enthusiastic",
        boundingBox: { x: 0.28, y: 0.38, w: 0.44, h: 0.30, label: "AeroFit Titanium Watch (99%)" },
        description: "Sapphire display showing dual-band GPS pace (6:42/mi) and Zone 3 heart rate (154 BPM) on runner's wrist."
      },
      {
        id: "pp-502",
        productName: "HydraLyte Citrus Squeeze Flask",
        brand: "HydraLyte Sports",
        category: "Sports Nutrition",
        startTime: 38,
        endTime: 54,
        timestampLabel: "00:38 - 00:54",
        prominence: "Secondary Feature",
        modality: ["Visual Frame", "Audio Mention"],
        confidence: 0.94,
        sentiment: "Positive",
        boundingBox: { x: 0.48, y: 0.30, w: 0.24, h: 0.34, label: "HydraLyte Flask (94%)" },
        description: "Runner hydrates from handheld squeeze bottle at coastal overlook after completing 10K split."
      }
    ],
    localizedMarketing: {
      "en-US": {
        languageName: "English (US)",
        headline: "Crush Your PR with Dual-Band GPS & 14-Day Titanium Battery ⌚🏃‍♀️",
        adCopy:
          "Track real-time lactate threshold, heart-rate zones, and sub-meter coastal GPS accuracy with the new AeroFit Ultra Titanium.",
        cta: "Shop AeroFit Ultra Titanium — Free Express Shipping",
        seoTags: ["#AeroFitWatch", "#MarathonTraining", "#RunTok", "#5AMClub", "#FitnessTech"]
      },
      "es-MX": {
        languageName: "Español (LATAM)",
        headline: "Supera tu Récord con GPS de Doble Banda y 14 Días de Batería ⌚🏃‍♀️",
        adCopy:
          "Monitorea tus zonas de frecuencia cardíaca y ritmo en tiempo real con el nuevo AeroFit Ultra de titanio.",
        cta: "Compra AeroFit Ultra Hoy",
        seoTags: ["#RunningMexico", "#Maraton", "#RelojInteligente", "#AeroFit", "#VidaFit"]
      },
      "ja-JP": {
        languageName: "日本語 (JP)",
        headline: "デュアルバンドGPS＆14日間バッテリーで自己ベスト更新 ⌚🏃‍♀️",
        adCopy:
          "心拍ゾーン、VO2 Max、高精度ペース計測を手元に。チタン製AeroFit Ultraで朝の10kmランをもっとスマートに。",
        cta: "AeroFit Ultra チタンモデルを詳しく見る",
        seoTags: ["#ランニング", "#マラソン練習", "#スマートウォッチ", "#朝ラン", "#AeroFit"]
      },
      "de-DE": {
        languageName: "Deutsch (DE)",
        headline: "Neue Bestzeit mit Dual-Band-GPS & 14 Tagen Titan-Akku ⌚🏃‍♀️",
        adCopy:
          "Präzise Herzfrequenzzonen und Echtzeit-Pace direkt am Handgelenk mit der AeroFit Ultra Titanium.",
        cta: "AeroFit Ultra Titanium entdecken",
        seoTags: ["#Laufen", "#MarathonTraining", "#Smartwatch", "#AeroFit", "#Laufliebe"]
      },
      "pt-BR": {
        languageName: "Português (BR)",
        headline: "Bata seu Recorde Pessoal com GPS Dual-Band e 14 Dias de Bateria ⌚🏃‍♀️",
        adCopy:
          "Acompanhe zonas de frequência cardíaca e pace em tempo real com o novo smartwatch AeroFit Ultra Titanium.",
        cta: "Garanta seu AeroFit Ultra Titanium",
        seoTags: ["#CorridaDeRua", "#Maratona", "#Smartwatch", "#AeroFit", "#TreinoMatinal"]
      }
    },
    moments: [
      {
        momentId: "mom-501a",
        startTime: 4,
        endTime: 32,
        timestampLabel: "00:04 - 00:32",
        visualDescription:
          "Runner checking smartwatch fitness metrics outdoors on a coastal trail at sunrise; wrist display shows 154 BPM heart rate and 6:42/mi pace.",
        audioTranscript:
          "Mile 5 along the coast and the AeroFit Titanium dual-band GPS is locked at a 6:42 pace in Zone 3!",
        ocrText: "PACE 6:42/MI • HR 154 BPM ZONE 3 • AEROFIT ULTRA",
        keywords: [
          "runner",
          "checking smartwatch",
          "fitness metrics",
          "outdoors",
          "heart rate",
          "coastal",
          "marathon",
          "watch"
        ]
      },
      {
        momentId: "mom-501b",
        startTime: 38,
        endTime: 58,
        timestampLabel: "00:38 - 00:58",
        visualDescription:
          "Runner stops at scenic ocean overlook, drinks from HydraLyte sports flask, and taps save workout on smartwatch.",
        audioTranscript:
          "10K done before 6 AM, recovery timer says 18 hours, and still at 91% battery after a full week of training.",
        ocrText: "10.0 KM COMPLETE • 91% BATTERY REMAINING",
        keywords: ["hydration", "electrolyte", "ocean overlook", "recovery", "workout summary"]
      }
    ]
  }
];

export const SAMPLE_SEARCH_QUERIES = [
  {
    label: "Soda near Electric Car",
    query: "Find all video moments where a user drinks a soda near an electric car"
  },
  {
    label: "Skincare Medical Claims",
    query: "Creator unboxing skincare serum and making dermatologist claims"
  },
  {
    label: "Iced Coffee & Laptop Desk",
    query: "Person drinking iced coffee next to a laptop on a minimalist desk"
  },
  {
    label: "Unsafe Stunt / No Helmet",
    query: "Dangerous stunt or skateboard trick without safety gear"
  },
  {
    label: "Runner Smartwatch Outdoors",
    query: "Runner checking smartwatch fitness metrics outdoors"
  }
];
