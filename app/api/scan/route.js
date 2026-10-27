import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ensureScanIndexes, saveScan } from "@/lib/models/Scan";
import { callGemini } from "@/lib/gemini";
import { autoTranslate } from "@/lib/autoTranslate";

export const dynamic = "force-dynamic";

const MIN_FILE_SIZE = 50 * 1024;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES = 3;
const CROP_CONFIDENCE_THRESHOLD = 70;

const CROP_VALIDATION_PROMPT = `You are an expert agricultural AI system designed to validate crop images.

Analyze the uploaded image(s) STRICTLY.

Return a JSON object with:
{
  "is_valid_crop": boolean,
  "confidence": 0-100,
  "reason": "brief reason",
  "has_human": boolean,
  "has_building": boolean,
  "is_blurry": boolean,
  "is_screenshot": boolean
}

Rules:
1. REJECT if contains humans (faces, hands, people)
2. REJECT if contains buildings, houses, structures
3. REJECT if blurry or low quality
4. REJECT if screenshot or UI elements
5. ONLY ACCEPT: crop leaves, plants, grains, fruits, farm produce
6. Set is_valid_crop=true ONLY if confidence >= 70
7. Return ONLY the JSON. No markdown.
`;

const DISEASE_ANALYSIS_PROMPT = `You are an expert Indian agricultural scientist AI.

Analyze the crop image(s) and provide a detailed diagnostic report.

Return ONLY valid JSON in this exact structure:
{
  "crop": {
    "name": "crop name",
    "confidence": 0-100,
    "stage": "seedling|vegetative|flowering|fruiting|harvest|unknown"
  },
  "disease": {
    "name": "disease name or Healthy",
    "confidence": 0-100,
    "severity": "None|Low|Medium|High",
    "symptoms": ["symptom1", "symptom2"],
    "chemical_remedy": "treatment details",
    "organic_remedy": "organic treatment",
    "prevention": "prevention steps",
    "action_required": "immediate action steps"
  }
}

Output ONLY JSON. No markdown tags.
`;

async function tryPersistScan(userId, finalPayload) {
  if (!userId || userId === "anonymous") return;
  try {
    const db = await getDb();
    await ensureScanIndexes(db);
    await saveScan(db, {
      userId,
      crop: finalPayload.crop?.name || "Unknown",
      disease: finalPayload.disease?.name || "Healthy",
      confidence: finalPayload.disease?.confidence || 0,
    });
  } catch {}
}

async function collectImageFiles(formData) {
  const multi = formData.getAll("images");
  const out = [];
  for (const entry of multi) {
    if (entry && typeof entry === "object" && "arrayBuffer" in entry && SUPPORTED_TYPES.includes(entry.type)) {
      out.push(entry);
    }
  }
  if (!out.length) {
    const single = formData.get("image");
    if (single && typeof single === "object" && "arrayBuffer" in single && SUPPORTED_TYPES.includes(single.type)) {
      out.push(single);
    }
  }
  return out.slice(0, MAX_IMAGES);
}

export async function POST(request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") || "en";

  try {
    const formData = await request.formData();
    const files = await collectImageFiles(formData);

    if (!files.length) {
      return NextResponse.json(
        { success: false, message: await autoTranslate("No valid images found", lang) },
        { status: 400 }
      );
    }

    const images = [];
    for (const file of files) {
      if (file.size < MIN_FILE_SIZE || file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: await autoTranslate("Image must be 50KB-5MB", lang) },
          { status: 413 }
        );
      }
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      images.push({ mimeType: file.type, data: base64 });
    }

    // STEP 1: STRICT CROP VALIDATION
    const validationResult = await callGemini(CROP_VALIDATION_PROMPT, images);

    if (!validationResult.success || !validationResult.data) {
      return NextResponse.json(
        { success: false, message: await autoTranslate("Image validation failed", lang) },
        { status: 400 }
      );
    }

    const validation = validationResult.data;

    if (validation.has_human) {
      return NextResponse.json(
        { success: false, message: await autoTranslate("Images containing people not allowed", lang) },
        { status: 400 }
      );
    }

    if (validation.has_building) {
      return NextResponse.json(
        { success: false, message: await autoTranslate("Please upload only crop/plant images", lang) },
        { status: 400 }
      );
    }

    if (validation.is_blurry) {
      return NextResponse.json(
        { success: false, message: await autoTranslate("Image is too blurry. Please take a clear photo", lang) },
        { status: 400 }
      );
    }

    if (validation.is_screenshot) {
      return NextResponse.json(
        { success: false, message: await autoTranslate("Screenshots not allowed. Upload a photo instead", lang) },
        { status: 400 }
      );
    }

    if (!validation.is_valid_crop || validation.confidence < CROP_CONFIDENCE_THRESHOLD) {
      return NextResponse.json(
        { success: false, message: await autoTranslate("This does not appear to be a crop image. Please upload a clear plant or crop photo", lang) },
        { status: 400 }
      );
    }

    // STEP 2: DISEASE ANALYSIS
    const analysisResult = await callGemini(DISEASE_ANALYSIS_PROMPT, images);

    if (!analysisResult.success || !analysisResult.data) {
      return NextResponse.json(
        { success: false, message: await autoTranslate("Analysis failed. Please try again", lang) },
        { status: 400 }
      );
    }

    const analysis = analysisResult.data;

    // STEP 3: TRANSLATE & ENRICH
    const finalPayload = {
      validation_confidence: validation.confidence,
      crop: {
        name: await autoTranslate(analysis.crop?.name || "Unknown", lang),
        confidence: Math.min(100, Math.round(analysis.crop?.confidence || 0)),
        stage: await autoTranslate(analysis.crop?.stage || "unknown", lang),
      },
      disease: {
        name: await autoTranslate(analysis.disease?.name || "Healthy", lang),
        confidence: Math.min(100, Math.round(analysis.disease?.confidence || 0)),
        severity: await autoTranslate(analysis.disease?.severity || "None", lang),
        symptoms: await Promise.all(
          (analysis.disease?.symptoms || []).map((s) => autoTranslate(s, lang))
        ),
        chemical_remedy: await autoTranslate(analysis.disease?.chemical_remedy || "", lang),
        organic_remedy: await autoTranslate(analysis.disease?.organic_remedy || "", lang),
        prevention: await autoTranslate(analysis.disease?.prevention || "", lang),
        action_required: await autoTranslate(analysis.disease?.action_required || "", lang),
        is_healthy: (analysis.disease?.name || "").toLowerCase() === "healthy",
      },
      timestamp: new Date().toISOString(),
      language: lang,
    };

    const userId = getAuthUserId(request) || "anonymous";
    await tryPersistScan(userId, finalPayload);

    return NextResponse.json({ success: true, result: finalPayload }, { status: 200 });
  } catch (error) {
    console.error("Scan Error:", error);
    return NextResponse.json(
      { success: false, message: await autoTranslate("Scan failed. Please try again", "en") },
      { status: 500 }
    );
  }
}
