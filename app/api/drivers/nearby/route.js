import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ensureDriverIndexes, getNearbyDrivers } from "@/lib/models/Driver";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const radius = parseFloat(searchParams.get("radius") || "50");

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ success: false, message: "Invalid coordinates." }, { status: 400 });
    }

    const db = await getDb();
    await ensureDriverIndexes(db).catch(() => {});
    
    // We try/catch the nearby due to 2dsphere index requirement
    // If indices fail to create on Atlas, this crashes. We'll fallback gracefully
    let drivers = [];
    try {
      drivers = await getNearbyDrivers(db, lat, lng, radius);
    } catch {
      // Fallback: If 2dsphere index is missing, return all available
      drivers = await db.collection("drivers").find({ available: true }).limit(20).toArray();
    }

    return NextResponse.json({ success: true, drivers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "डेटा लाने में त्रुटि हुई।" }, { status: 500 });
  }
}
