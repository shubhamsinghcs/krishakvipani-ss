import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ensureDriverIndexes, listDrivers, getNearbyDrivers } from "@/lib/models/Driver";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const db = await getDb();
    await ensureDriverIndexes(db);

    let drivers = [];

    if (!isNaN(lat) && !isNaN(lng)) {
      drivers = await getNearbyDrivers(db, lat, lng, 50);
    } else if (city) {
      drivers = await listDrivers(db, city, limit);
    } else {
      drivers = await listDrivers(db, null, limit);
    }

    return NextResponse.json(
      {
        success: true,
        drivers: drivers,
        count: drivers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List drivers error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
