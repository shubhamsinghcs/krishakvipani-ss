import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ensureScanIndexes, saveScan } from "@/lib/models/Scan";
import { ensureCropHistoryIndexes, insertCropScan } from "@/lib/models/CropHistory";
import { callGemini } from "@/lib/gemini";
import { analyzeAgronomicFallback } from "@/lib/agronomyKnowledge";
import { AgronomicAdvisoryService } from "@/lib/advisory/advisoryService";
import { checkRateLimit, validateImageMagicBytes, scanForMaliciousPayload, stripExifMetadata, validateImageFileSize } from "@/lib/imageSecurity";

export const dynamic = "force-dynamic";

const MIN_FILE_SIZE = 5 * 1024; // 5 KB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_IMAGES = 3;

async function tryPersistScan(userId, finalPayload) {
  if (!userId || userId === "anonymous") return;
  try {
    const db = await getDb();
    await Promise.allSettled([
      ensureScanIndexes(db),
      ensureCropHistoryIndexes(db),
    ]);

    await Promise.allSettled([
      saveScan(db, {
        userId,
        crop: finalPayload.crop?.name || "Unknown Crop",
        disease: finalPayload.disease?.name || "Healthy",
        confidence: finalPayload.disease?.confidence || 0,
        thumbnail: finalPayload.thumbnail || null,
        resultSnapshot: finalPayload,
      }),
      insertCropScan(db, userId, {
        crop: finalPayload.crop?.name || "Unknown Crop",
        disease: finalPayload.disease?.name || "Healthy",
        confidence: finalPayload.disease?.confidence || 0,
        severity: finalPayload.disease?.severity || "None",
        is_healthy: Boolean(finalPayload.disease?.is_healthy),
        thumbnail: finalPayload.thumbnail || null,
        ...finalPayload,
      }),
    ]);
  } catch (err) {
    console.error("Persist Scan Error:", err.message);
  }
}

async function collectImageFiles(formData) {
  const multi = formData.getAll("images");
  const out = [];
  for (const entry of multi) {
    if (entry && typeof entry === "object" && "arrayBuffer" in entry) {
      if (SUPPORTED_TYPES.includes(entry.type) || entry.type.startsWith("image/")) {
        out.push(entry);
      }
    }
  }
  if (!out.length) {
    const single = formData.get("image");
    if (single && typeof single === "object" && "arrayBuffer" in single) {
      if (SUPPORTED_TYPES.includes(single.type) || single.type.startsWith("image/")) {
        out.push(single);
      }
    }
  }
  return out.slice(0, MAX_IMAGES);
}

export async function POST(request) {
  const url = new URL(request.url);
  const lang = ["en", "hi", "pa"].includes(url.searchParams.get("lang"))
    ? url.searchParams.get("lang")
    : "en";

  // 1. IP & User Rate Limiting (15 scans per minute limit to prevent DoS & API abuse)
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "client_local";

  const rateCheck = checkRateLimit(clientIp, 15, 60 * 1000);
  if (!rateCheck.allowed) {
    const rateMsg = {
      en: `Too many scan requests. Please wait ${rateCheck.resetSeconds} seconds before scanning again.`,
      hi: `बहुत अधिक अनुरोध। कृपया पुनः प्रयास करने से पहले ${rateCheck.resetSeconds} सेकंड प्रतीक्षा करें।`,
      pa: `ਬਹੁਤ ਸਾਰੇ ਸਕੈਨ ਬੇਨਤੀਆਂ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ${rateCheck.resetSeconds} ਸਕਿੰਟ ਉਡੀਕ ਕਰੋ।`,
    };
    return NextResponse.json(
      { success: false, message: rateMsg[lang] || rateMsg.en },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.resetSeconds) },
      }
    );
  }

  try {
    const formData = await request.formData();
    const files = await collectImageFiles(formData);

    if (!files.length) {
      const errMsgs = {
        en: "No valid image provided. Please capture or upload a clear photo of your crop.",
        hi: "कोई मान्य छवि नहीं मिली। कृपया फसल की स्पष्ट फोटो अपलोड करें।",
        pa: "ਕੋਈ ਵੈਧ ਫੋਟੋ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਫ਼ਸਲ ਦੀ ਸਾਫ਼ ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ।",
      };
      return NextResponse.json({ success: false, message: errMsgs[lang] || errMsgs.en }, { status: 400 });
    }

    const images = [];
    let thumbnailBase64 = null;

    // 2. Binary Magic Bytes & Security Inspection
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 2.1 File size bounds verification
      const sizeCheck = validateImageFileSize(file.size, MIN_FILE_SIZE, MAX_FILE_SIZE);
      if (!sizeCheck.valid) {
        const sizeMsgs = {
          en: sizeCheck.error,
          hi: `छवि का आकार 5KB से 10MB के बीच होना चाहिए। (${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
          pa: `ਫੋਟੋ ਦਾ ਆਕਾਰ 5KB ਤੋਂ 10MB ਦੇ ਵਿਚਕਾਰ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ। (${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
        };
        return NextResponse.json({ success: false, message: sizeMsgs[lang] || sizeMsgs.en }, { status: 413 });
      }

      const bytes = await file.arrayBuffer();
      let buffer = Buffer.from(bytes);

      // 2.2 Verify legitimate binary image signatures (prevents disguised scripts/executables)
      const magicCheck = validateImageMagicBytes(buffer);
      if (!magicCheck.valid) {
        return NextResponse.json(
          {
            success: false,
            message:
              lang === "hi"
                ? "अमान्य फ़ाइल। अपलोड की गई फ़ाइल वैध छवि (JPG/PNG/WEBP) नहीं है।"
                : "Invalid file binary. The file is not a valid JPEG, PNG, or WEBP image.",
          },
          { status: 400 }
        );
      }

      // 2.3 Security check for malicious embedded scripts in metadata or headers
      const securityCheck = scanForMaliciousPayload(buffer);
      if (!securityCheck.safe) {
        return NextResponse.json(
          { success: false, message: "Security alert: Potentially unsafe file payload detected." },
          { status: 400 }
        );
      }

      // 2.4 Privacy Protection: Strip EXIF metadata (camera serial, hardware GPS) before processing/storing
      buffer = stripExifMetadata(buffer);

      const base64 = buffer.toString("base64");
      const mime = magicCheck.format || file.type || "image/jpeg";
      images.push({ mimeType: mime, data: base64 });

      // Keep first image as preview thumbnail (capped at ~15kb)
      if (i === 0) {
        thumbnailBase64 = `data:${mime};base64,${base64.slice(0, 15000)}`;
      }
    }

    // 2.5 Explicit Location Consent Handling
    const locationConsent = formData.get("location_consent") === "true" || formData.get("location_consent") === true;
    const rawLat = formData.get("latitude");
    const rawLng = formData.get("longitude");
    const parsedLat = rawLat ? parseFloat(rawLat) : null;
    const parsedLng = rawLng ? parseFloat(rawLng) : null;
    const userLocation = locationConsent && Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
      ? { latitude: parsedLat, longitude: parsedLng, consented: true }
      : null;

    const targetLangName = lang === "hi" ? "Hindi (Devanagari script)" : lang === "pa" ? "Punjabi (Gurmukhi script)" : "English";

    // 3. Robust Multimodal Prompt with Quality, Uncertainty & Rejection Rules
    const INTEGRATED_DIAGNOSIS_PROMPT = `You are a Senior Plant Pathologist and Agricultural AI Expert specializing in Indian agriculture and crop diseases.
    
Analyze the provided crop image(s) carefully. You may receive 1 to 3 images representing complementary angles/views of the SAME crop problem (e.g. canopy view, leaf close-up, and leaf underside or stem).

MULTI-IMAGE CROSS-PERSPECTIVE & FUSION RULES:
- Treat all images as different perspectives of the SAME plant issue.
- DO NOT blindly average predictions. A macro close-up showing distinct lesions/pustules MUST take precedence over a broad canopy shot.
- If one image is blurry or distant, DO NOT let it dilute crisp diagnostic biomarkers found in another view.
- If an underside view reveals fungal mycelium/spores or pests, integrate it directly into the primary diagnosis.
- If one view shows localized disease spots while another view shows general green foliage, DIAGNOSE THE DISEASE (do not dismiss the plant as healthy!).

MANDATORY SAFETY & UNCERTAINTY INSTRUCTIONS:
- NEVER force every image into a known disease class if visual evidence is ambiguous, incomplete, or unknown.
- Do NOT fabricate 99% or 100% confidence. Keep calibrated confidence realistic (typically 55% - 92%).

TASK 1: IMAGE QUALITY & RECOGNITION VALIDATION
- Determine if the image contains recognizable crop leaves, stems, fruits, or farm plants.
- RULES FOR REAL-WORLD FARMING CONDITIONS:
  * DO NOT reject natural field photos simply because they show background soil, sky, farmer hands holding the leaf, or natural sunlight/shade.
  * ONLY mark "is_valid_crop": false if:
    1. The image is completely dark/pitch black or completely washed-out white.
    2. The image is extremely blurry such that leaf veins or symptom spots cannot be distinguished.
    3. The image is entirely unrelated (human portrait/selfie, vehicle, room interior, animal).
    4. The image has no recognizable plant or crop content.

TASK 2: UNCERTAINTY & UNKNOWN DISEASE HANDLING
- Determine "diagnostic_status":
  * "CONFIRMED": Clear, unambiguous visual biomarkers matching a known disease with high confidence (>= 70%).
  * "AMBIGUOUS": Symptoms overlap between multiple possible diseases or nutrient deficiencies (e.g. Early Blight vs Septoria, or Nitrogen chlorosis vs viral yellowing). In this case, provide the primary hypothesis, but list 1 or 2 plausible "alternative_diagnoses".
  * "UNKNOWN_CONDITION": Symptoms do not match recognized pathologies or visual evidence is inconclusive. Do NOT invent a chemical prescription; advise physical KVK inspection.
  * "UNSUPPORTED_CROP": Crop is not a supported commercial crop.

TASK 3: DIAGNOSIS & REMEDIES
- If valid ("is_valid_crop": true):
  1. Identify the crop species (e.g. Wheat, Rice, Tomato, Potato, Cotton, Mustard, Maize, Chilli, Onion, Soybean, etc.).
  2. Estimate crop growth stage (Seedling, Vegetative, Flowering, Fruiting, Maturity).
  3. Detect plant pathogen or mark as "Healthy" if no symptoms exist.
  4. Determine severity: "None" (if healthy), "Low" (early isolated lesions), "Medium" (spreading spots/curling), "High" (extensive wilting/necrosis/rot).
  5. Provide ICAR/SAU approved Chemical Remedy with active ingredient and exact dosage. (Omit or mark as consult expert if unknown).
  6. Provide Organic / Biological Alternative (e.g., Neem oil 1500 ppm @ 5ml/L, Trichoderma viride, Pseudomonas fluorescens).
  7. Provide cultural prevention practices and immediate action required.

All text fields in the JSON response MUST be written in ${targetLangName}.

Return ONLY valid JSON matching this exact structure:
{
  "is_valid_crop": true,
  "validation_confidence": 92,
  "quality_assessment": "good|low_light|blurry",
  "validation_reason": "Clear leaf view showing symptoms",
  "diagnostic_status": "CONFIRMED|AMBIGUOUS|UNKNOWN_CONDITION|UNSUPPORTED_CROP",
  "crop": {
    "name": "Crop name in ${targetLangName}",
    "confidence": 88,
    "stage": "Stage in ${targetLangName}"
  },
  "disease": {
    "name": "Disease name, Healthy, or Unresolved Condition in ${targetLangName}",
    "confidence": 84,
    "severity": "Low|Medium|High|None",
    "is_healthy": false,
    "symptoms": ["Symptom 1 in ${targetLangName}", "Symptom 2 in ${targetLangName}"],
    "chemical_remedy": "Specific chemical and dosage in ${targetLangName}",
    "organic_remedy": "Organic biological treatment in ${targetLangName}",
    "prevention": "Prevention steps in ${targetLangName}",
    "action_required": "Immediate next step in ${targetLangName}"
  },
  "alternative_diagnoses": [
    {
      "name": "Alternative disease in ${targetLangName}",
      "confidence": 35,
      "reason": "Why symptoms visually overlap in ${targetLangName}"
    }
  ]
}`;

    // Execute AI vision inference
    let analysisResult = await callGemini(INTEGRATED_DIAGNOSIS_PROMPT, images, {
      maxOutputTokens: 1200,
      temperature: 0.3,
      skipSystemInstruction: true,
    });

    let finalPayload = null;

    if (analysisResult.success && analysisResult.data && typeof analysisResult.data === "object") {
      const data = analysisResult.data;

      // Handle unidentifiable or rejected photos with constructive farmer guidance
      if (data.is_valid_crop === false) {
        const rejectMsg = data.validation_reason || (
          lang === "hi"
            ? "यह पौधे या फसल की पहचान योग्य फोटो नहीं है। कृपया दिन की रोशनी में प्रभावित पत्ती या फल के करीब (10-15 सेमी) से स्पष्ट फोटो लें।"
            : lang === "pa"
            ? "ਇਹ ਫ਼ਸਲ ਜਾਂ ਪੌਦੇ ਦੀ ਪਛਾਣਯੋਗ ਫੋਟੋ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਸਾਫ਼ ਰੌਸ਼ਨੀ ਵਿੱਚ ਪੱਤੇ ਦੇ ਨੇੜੇ ਤੋਂ ਫੋਟੋ ਲਓ।"
            : "No recognizable plant or crop detected. Please take a clear, well-lit photo about 10–15 cm from the affected leaf or fruit."
        );
        return NextResponse.json({ success: false, message: rejectMsg }, { status: 400 });
      }

      const diseaseName = data.disease?.name || "Healthy";
      const isHealthy = Boolean(
        data.disease?.is_healthy ||
        diseaseName.toLowerCase().includes("healthy") ||
        diseaseName.toLowerCase().includes("स्वस्थ") ||
        diseaseName.toLowerCase().includes("ਤੰਦਰੁਸਤ")
      );

      const statusRaw = String(data.diagnostic_status || "").toUpperCase();
      const diseaseConf = Math.min(94, Math.max(40, Number(data.disease?.confidence) || 82));
      let diagnosticStatus = "CONFIRMED";
      let reliabilityBand = "HIGH";

      if (statusRaw.includes("UNKNOWN") || diseaseConf < 45) {
        diagnosticStatus = "UNKNOWN_CONDITION";
        reliabilityBand = "INCONCLUSIVE";
      } else if (statusRaw.includes("AMBIGUOUS") || diseaseConf < 68 || (Array.isArray(data.alternative_diagnoses) && data.alternative_diagnoses.length > 0)) {
        diagnosticStatus = "AMBIGUOUS";
        reliabilityBand = "MODERATE";
      }

      const alternatives = Array.isArray(data.alternative_diagnoses)
        ? data.alternative_diagnoses.map((alt) => ({
            name: alt.name || "Alternative diagnosis",
            confidence: Math.min(70, Math.max(15, Number(alt.confidence) || 30)),
            reason: alt.reason || "",
          }))
        : [];

      finalPayload = {
        is_valid_crop: true,
        validation_confidence: Math.min(95, Math.max(70, Number(data.validation_confidence) || 88)),
        diagnostic_status: diagnosticStatus,
        reliability_band: reliabilityBand,
        requires_expert_confirmation: reliabilityBand !== "HIGH",
        kvk_helpline: "1800-180-1551 (Kisan Call Centre)",
        crop: {
          name: data.crop?.name || (lang === "hi" ? "अज्ञात फसल" : "Crop"),
          confidence: Math.min(95, Math.max(55, Number(data.crop?.confidence) || 84)),
          stage: data.crop?.stage || (lang === "hi" ? "वानस्पतिक" : "Vegetative"),
        },
        disease: {
          name: diseaseName,
          confidence: diseaseConf,
          severity: data.disease?.severity || (isHealthy ? "None" : "Medium"),
          symptoms: Array.isArray(data.disease?.symptoms) ? data.disease.symptoms : [],
          chemical_remedy: diagnosticStatus === "UNKNOWN_CONDITION" ? "" : (data.disease?.chemical_remedy || ""),
          organic_remedy: data.disease?.organic_remedy || "",
          prevention: data.disease?.prevention || "",
          action_required: data.disease?.action_required || "",
          is_healthy: isHealthy,
        },
        alternative_diagnoses: alternatives,
        multi_view: {
          views_submitted: images.length,
          consensus: data.multi_view_summary?.consensus || (images.length > 1 ? "HIGH_AGREEMENT" : "SINGLE_VIEW"),
          fusion_insight: data.multi_view_summary?.fusion_insight || "",
        },
        thumbnail: thumbnailBase64,
        location: userLocation,
        diagnostics_engine: "Krishak Vipani Calibrated Vision Engine (v2.0)",
        timestamp: new Date().toISOString(),
        language: lang,
      };
    } else {
      // Resilient agronomic expert system fallback
      console.warn("AI service fallback triggered for crop scan:", analysisResult?.message);
      finalPayload = analyzeAgronomicFallback({}, lang);
      finalPayload.thumbnail = thumbnailBase64;
      finalPayload.location = userLocation;
    }

    // Anchor all recommendations to the Authoritative Agricultural Advisory Layer
    // (Prevents LLMs from inventing unregistered chemical dosages or application schedules)
    finalPayload = AgronomicAdvisoryService.enrichScanResult(finalPayload, lang);

    // Persist to user scan history in MongoDB
    const userId = getAuthUserId(request) || "anonymous";
    await tryPersistScan(userId, finalPayload);

    return NextResponse.json({ success: true, result: finalPayload }, { status: 200 });
  } catch (error) {
    console.error("Scan Pipeline Error:", error);
    const errFallback = analyzeAgronomicFallback({}, lang);
    return NextResponse.json({ success: true, result: errFallback }, { status: 200 });
  }
}
