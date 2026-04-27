import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { updateDriverLocation } from "@/lib/models/Driver";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { phone, lat, lng, available } = await request.json();

    if (!phone || lat === undefined || lng === undefined) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();
    
    await updateDriverLocation(db, phone, lat, lng, available);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "स्थिति अपडेट करने में त्रुटि।" }, { status: 500 });
  }
}
