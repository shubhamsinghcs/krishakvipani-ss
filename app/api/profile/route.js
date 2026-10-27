import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getFarmerProfile, upsertFarmerProfile, updateFarmerPreferences } from "@/lib/models/FarmerProfile";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const db = await getDb();
    const profile = await getFarmerProfile(db, userId);

    return NextResponse.json(
      { success: true, profile: profile || {} },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userId = getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const db = await getDb();

    await upsertFarmerProfile(db, userId, {
      name: body.name || "",
      district: body.district || "",
      cropType: body.cropType || "",
      farmSize: body.farmSize || "",
      phoneNumber: body.phoneNumber || "",
      language: body.language || "en",
      preferences: {
        notifications: body.preferences?.notifications ?? true,
        weatherAlerts: body.preferences?.weatherAlerts ?? true,
        priceUpdates: body.preferences?.priceUpdates ?? true,
        diseaseWarnings: body.preferences?.diseaseWarnings ?? true,
      },
    });

    const profile = await getFarmerProfile(db, userId);
    return NextResponse.json(
      { success: true, profile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
