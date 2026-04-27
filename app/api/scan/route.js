import { NextResponse } from "next/server";
import { DISEASE_REMEDIES } from "@/lib/constants";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ensureScanIndexes, saveScan } from "@/lib/models/Scan";
import { callGemini } from "@/lib/gemini";
import { t } from "@/lib/i18n";
import { autoTranslate } from "@/lib/autoTranslate";

export const dynamic = "force-dynamic";

const MIN_FILE_SIZE = 50 * 1024; // 50KB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES = 3;

const scanCache = new Map();

const GEMINI_PROMPT = `You are an expert Indian agricultural scientist.
You must analyze the image(s) and provide a strict diagnostic report.

First, determine if the image is a real crop/plant. Be extremely strict.
If it is a real crop, detect the crop name and then detect any diseases.

You MUST return ONLY valid JSON in this exact structure:
{
  "is_crop": true/false,
  "confidence": 95,
  "reason": "1-sentence explanation of why it is or isn't a crop",
  "crop": {
    "name": "crop name or unknown",
    "confidence": 90,
    "stage": "seedling/vegetative/flowering/fruiting/harvest/unknown"
  },
  "disease": {
    "disease": "disease name or Healthy",
    "confidence": 85,
    "severity": "Low/Medium/High/None",
    "symptoms": ["symptom 1", "symptom 2"],
    "chemical_remedy": "chemical treatment",
    "organic_remedy": "organic treatment",
    "prevention": "prevention steps",
    "is_healthy": true/false
  }
}

Important Rules:
1. ONLY return the JSON. No markdown tags.
2. Provide all output text in English (it will be translated later).
`;

function enrichWithRemedy(diseasePayload) {
  const disease = diseasePayload?.disease || "";
  const remedyData = DISEASE_REMEDIES[disease];
  if (!remedyData) return diseasePayload;

  return {
    ...diseasePayload,
    severity: diseasePayload.severity || remedyData.severity || "Medium",
    chemical_remedy: diseasePayload.chemical_remedy || remedyData.remedy || "",
    organic_remedy: diseasePayload.organic_remedy || remedyData.organic_remedy || "",
  };
}

async function tryPersistScanHistory(userId, finalPayload) {
  if (!userId) return;
  try {
    const db = await getDb();
    try { await ensureScanIndexes(db); } catch {}
    await saveScan(db, {
      userId,
      crop: finalPayload.crop?.name || "Unknown",
      disease: finalPayload.disease?.disease || "Healthy",
      confidence: finalPayload.disease?.confidence || 0
    });
  } catch (error) {}
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
  const lang = url.searchParams.get("lang") || request.headers.get("x-lang") || request.headers.get("x-language") || "en";
  try {
    const formData = await request.formData();
    const files = await collectImageFiles(formData);

    // STEP 1: FILE VALIDATION
    if (!files.length) {
      return NextResponse.json({ success: false, message: t("scanner.invalidType", lang) || "अमान्य फ़ाइल" }, { status: 400 });
    }

    const images = [];
    for (const file of files) {
      if (file.size < MIN_FILE_SIZE || file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          success: false, 
          message: await autoTranslate("File size must be between 50KB and 5MB.", lang) 
        }, { status: 413 });
      }
      const bytes = await file.arrayBuffer();
      const base64Image = Buffer.from(bytes).toString("base64");
      images.push({ mimeType: file.type, base64: base64Image });
    }

    const userId = getAuthUserId(request) || "anonymous";
    
    // STEP 2/3/4: AI PIPELINE (Single Call for speed, JSON parsed internally)
    const geminiResult = await callGemini(GEMINI_PROMPT, images);

    if (!geminiResult.success || !geminiResult.data) {
      return NextResponse.json({ 
        success: true, 
        fallback: true, 
        message: await autoTranslate("AI is currently unavailable", lang) 
      }, { status: 200 });
    }

    const parsed = geminiResult.data;

    // AI CROP VALIDATION (STRICT)
    if (parsed.is_crop === false || (typeof parsed.confidence === 'number' && parsed.confidence < 60)) {
       return NextResponse.json({ 
           success: false, 
           message: await autoTranslate("❌ This is not a valid crop photo", lang) 
       }, { status: 400 });
    }

    const reason = (parsed.reason || "").toLowerCase();
    const keywords = ["leaf", "plant", "crop", "wheat", "rice"];
    const hasKeyword = keywords.some(kw => reason.includes(kw));

    if (!hasKeyword) {
        return NextResponse.json({ 
            success: false, 
            message: await autoTranslate("❌ This is not a valid crop photo", lang) 
        }, { status: 400 });
    }

    // AI CROP & DISEASE DETECTION (ENRICH & TRANSLATE)
    const diseaseEnriched = enrichWithRemedy(parsed.disease || {});
    
    // Auto-translate fields if needed
    const finalCrop = {
        name: await autoTranslate(parsed.crop?.name || "Unknown", lang),
        confidence: parsed.crop?.confidence || 0,
        stage: await autoTranslate(parsed.crop?.stage || "unknown", lang)
    };

    const translatedSymptoms = [];
    if (Array.isArray(diseaseEnriched.symptoms)) {
        for (const s of diseaseEnriched.symptoms) {
            translatedSymptoms.push(await autoTranslate(s, lang));
        }
    }

    const finalDisease = {
        disease: await autoTranslate(diseaseEnriched.disease || "Healthy", lang),
        confidence: diseaseEnriched.confidence || 0,
        severity: await autoTranslate(diseaseEnriched.severity || "None", lang),
        symptoms: translatedSymptoms,
        chemical_remedy: await autoTranslate(diseaseEnriched.chemical_remedy || "", lang),
        organic_remedy: await autoTranslate(diseaseEnriched.organic_remedy || "", lang),
        prevention: await autoTranslate(diseaseEnriched.prevention || "", lang),
        is_healthy: Boolean(diseaseEnriched.is_healthy)
    };

    const finalPayload = { crop: finalCrop, disease: finalDisease };
    scanCache.set(userId, finalPayload);

    if (userId !== "anonymous") {
      await tryPersistScanHistory(userId, finalPayload);
    }
    
    return NextResponse.json({ success: true, crop: finalCrop, disease: finalDisease }, { status: 200 });
  } catch (error) {
    console.error("Scan Error:", error);
    return NextResponse.json({ 
      success: true, 
      fallback: true, 
      message: await autoTranslate("AI scanning failed", lang) 
    }, { status: 200 });
  }
}
