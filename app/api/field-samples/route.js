import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ensureFieldSampleIndexes, insertFieldSample, getVerifiedFieldSamples } from "@/lib/models/FieldSample";
import { validateImageMagicBytes, scanForMaliciousPayload, stripExifMetadata, validateImageFileSize, checkRateLimit, MIN_FILE_SIZE, MAX_FILE_SIZE } from "@/lib/imageSecurity";
import { SUPPORTED_CROPS } from "@/lib/supportedCrops";

export const dynamic = "force-dynamic";

const VALID_PLANT_PARTS = [
  "leaf_upper",
  "leaf_lower",
  "stem_collar",
  "fruit_pod",
  "flower_inflorescence",
  "root_crown",
  "whole_canopy",
];

const VALID_GROWTH_STAGES = [
  "seedling",
  "vegetative",
  "flowering",
  "fruiting_grain_fill",
  "maturity_harvest",
];

const VALID_SEASONS = ["Kharif", "Rabi", "Zaid"];

const VALID_CONDITIONS = [
  "direct_sunlight",
  "canopy_shade",
  "diffuse_cloudy",
  "morning_dew",
  "post_irrigation",
];

export async function POST(request) {
  try {
    // 1. Sliding Window Rate Limiting
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "client_local";

    const rateCheck = checkRateLimit(`field_${clientIp}`, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: `Too many submissions. Please wait ${rateCheck.resetSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetSeconds) } }
      );
    }

    const userId = getAuthUserId(request) || "anonymous";
    const formData = await request.formData();

    const imageFile = formData.get("image");
    if (!imageFile || typeof imageFile !== "object" || !("arrayBuffer" in imageFile)) {
      return NextResponse.json({ success: false, message: "Valid image file is required." }, { status: 400 });
    }

    // 2. File Size Boundaries
    const sizeCheck = validateImageFileSize(imageFile.size, MIN_FILE_SIZE, MAX_FILE_SIZE);
    if (!sizeCheck.valid) {
      return NextResponse.json({ success: false, message: sizeCheck.error }, { status: 413 });
    }

    const cropId = String(formData.get("crop_id") || "").toLowerCase().trim();
    const diseaseId = String(formData.get("disease_id") || "unspecified").toLowerCase().trim();
    const plantPart = String(formData.get("plant_part") || "leaf_upper").toLowerCase().trim();
    const growthStage = String(formData.get("growth_stage") || "vegetative").toLowerCase().trim();
    const season = String(formData.get("season") || "Kharif").trim();
    const condition = String(formData.get("collection_condition") || "direct_sunlight").toLowerCase().trim();

    // Grouping identifiers for leakage prevention
    const farmId = String(formData.get("farm_id") || `farm_${userId}`);
    const sessionId = String(formData.get("session_id") || `sess_${Date.now()}`);
    const plantId = String(formData.get("plant_id") || `plant_${Date.now()}`);

    // Location (Explicit Consent Required)
    const locationConsent = formData.get("location_consent") === "true" || formData.get("location_consent") === true;
    const state = String(formData.get("state") || "Unspecified");
    const district = String(formData.get("district") || "Unspecified");
    const rawLat = formData.get("latitude");
    const rawLng = formData.get("longitude");
    const parsedLat = rawLat ? parseFloat(rawLat) : null;
    const parsedLng = rawLng ? parseFloat(rawLng) : null;
    const validCoords = locationConsent && Number.isFinite(parsedLat) && Number.isFinite(parsedLng);

    // Validate image binary integrity
    const bytes = await imageFile.arrayBuffer();
    let buffer = Buffer.from(bytes);

    const magicCheck = validateImageMagicBytes(buffer);
    if (!magicCheck.valid) {
      return NextResponse.json({ success: false, message: "Invalid image format. Must be JPEG, PNG, or WEBP." }, { status: 400 });
    }

    const secCheck = scanForMaliciousPayload(buffer);
    if (!secCheck.safe) {
      return NextResponse.json({ success: false, message: "Security alert: Potentially unsafe file payload." }, { status: 400 });
    }

    // Strip EXIF metadata to sanitize device and location markers from binary
    buffer = stripExifMetadata(buffer);

    const base64Data = buffer.toString("base64");

    const sampleDoc = {
      contributor_id: userId,
      crop_id: cropId,
      disease_id: diseaseId,
      plant_part: VALID_PLANT_PARTS.includes(plantPart) ? plantPart : "leaf_upper",
      growth_stage: VALID_GROWTH_STAGES.includes(growthStage) ? growthStage : "vegetative",
      season: VALID_SEASONS.includes(season) ? season : "Kharif",
      collection_condition: VALID_CONDITIONS.includes(condition) ? condition : "direct_sunlight",
      location: {
        state,
        district,
        coordinates: validCoords ? { latitude: parsedLat, longitude: parsedLng } : null,
        consented: locationConsent,
      },
      group_metadata: {
        farm_id: farmId,
        session_id: sessionId,
        plant_id: plantId,
        leakage_group_key: `${farmId}_${sessionId}_${plantId}`,
      },
      image: {
        format: magicCheck.format,
        size_bytes: buffer.length,
        base64: `data:${magicCheck.format};base64,${base64Data}`,
      },
      expert_verification_status: "PENDING_REVIEW",
      expert_review: null,
    };

    const db = await getDb();
    await ensureFieldSampleIndexes(db);
    const result = await insertFieldSample(db, sampleDoc);

    return NextResponse.json(
      {
        success: true,
        message: "Field sample successfully recorded for expert verification.",
        sample_id: result.insertedId,
        leakage_group_key: sampleDoc.group_metadata.leakage_group_key,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Field sample submission error:", err);
    return NextResponse.json({ success: false, message: "Failed to record field sample." }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropId = searchParams.get("crop_id");
    const status = searchParams.get("status") || "VERIFIED_BY_ICAR_PATHOLOGIST";

    const filter = {};
    if (cropId) filter.crop_id = cropId.toLowerCase();
    if (status !== "all") filter.expert_verification_status = status;

    const db = await getDb();
    await ensureFieldSampleIndexes(db);
    const samples = await getVerifiedFieldSamples(db, filter, 100);

    return NextResponse.json({ success: true, count: samples.length, samples }, { status: 200 });
  } catch (err) {
    console.error("Field samples retrieval error:", err);
    return NextResponse.json({ success: false, message: "Failed to retrieve samples." }, { status: 500 });
  }
}
