import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/auth";
import { ensureCropHistoryIndexes, insertCropScan, listCropHistoryForUser } from "@/lib/models/CropHistory";

export const dynamic = "force-dynamic";

function parseBody(text) {
  try {
    return JSON.parse(text || "{}");
  } catch {
    return null;
  }
}

function validateScanResult(result) {
  if (!result || typeof result !== "object") {
    return { ok: false, message: "अमान्य परिणाम।" };
  }
  const disease = typeof result.disease === "string" ? result.disease.trim() : "";
  const crop_type = typeof result.crop_type === "string" ? result.crop_type.trim() : "";
  let confidence = result.confidence;
  if (typeof confidence === "string") {
    confidence = Number.parseFloat(confidence);
  }
  if (!Number.isFinite(confidence)) confidence = 0;
  confidence = Math.min(100, Math.max(0, confidence));

  if (!disease && !crop_type) {
    return { ok: false, message: "फसल या रोग डेटा आवश्यक है।" };
  }

  return {
    ok: true,
    result: {
      disease,
      crop_type,
      confidence,
      severity: typeof result.severity === "string" ? result.severity : "",
      is_healthy: Boolean(result.is_healthy),
      crop_stage: typeof result.crop_stage === "string" ? result.crop_stage : "",
      symptoms: Array.isArray(result.symptoms) ? result.symptoms.slice(0, 20) : [],
      chemical_remedy: typeof result.chemical_remedy === "string" ? result.chemical_remedy : "",
      organic_remedy: typeof result.organic_remedy === "string" ? result.organic_remedy : "",
      prevention: typeof result.prevention === "string" ? result.prevention : "",
      severity_reason: typeof result.severity_reason === "string" ? result.severity_reason : "",
    },
  };
}

function mapEntry(doc) {
  return {
    id: String(doc._id),
    crop: doc.crop_type || "",
    disease: doc.disease || "",
    confidence: typeof doc.confidence === "number" ? doc.confidence : 0,
    date: doc.createdAt ? doc.createdAt.toISOString() : null,
    severity: doc.severity || "",
    is_healthy: Boolean(doc.is_healthy),
  };
}

export async function GET(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "अधिकृत नहीं। कृपया लॉग इन करें।" }, { status: 401 });
    }

    const db = await getDb();
    try {
      await ensureCropHistoryIndexes(db);
    } catch {
      /* non-fatal */
    }

    const items = await listCropHistoryForUser(db, userId, 50);
    const history = items.map(mapEntry);

    return NextResponse.json({ success: true, history, total: history.length }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "इतिहास लोड करने में त्रुटि।" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "अधिकृत नहीं। कृपया लॉग इन करें।" }, { status: 401 });
    }

    let raw;
    try {
      raw = await request.text();
    } catch {
      return NextResponse.json({ success: false, message: "अनुरोध पढ़ने में त्रुटि।" }, { status: 400 });
    }
    if (!raw || raw.length > 50000) {
      return NextResponse.json({ success: false, message: "अनुरोध बहुत बड़ा है।" }, { status: 413 });
    }

    const body = parseBody(raw);
    const v = validateScanResult(body?.result);
    if (!v.ok) {
      return NextResponse.json({ success: false, message: v.message }, { status: 400 });
    }

    const db = await getDb();
    try {
      await ensureCropHistoryIndexes(db);
    } catch {
      /* non-fatal */
    }

    const saved = await insertCropScan(db, userId, v.result);

    return NextResponse.json(
      {
        success: true,
        entry: mapEntry(saved),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "इतिहास सहेजने में त्रुटि।" },
      { status: 500 }
    );
  }
}
