import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ensureDriverIndexes, registerDriver } from "@/lib/models/Driver";
import { validatePhoneNumber, sanitizePhoneNumber } from "@/lib/transportMessage";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();

    const { name, phone, truckType, capacity, city, vehicleNumber, preferredRoutes } = body;

    // Validation
    if (!name || !phone || !truckType || !capacity || !city) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizePhoneNumber(phone);
    const capacityNum = parseFloat(capacity);

    if (isNaN(capacityNum) || capacityNum <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid truck capacity" },
        { status: 400 }
      );
    }

    const db = await getDb();
    await ensureDriverIndexes(db);

    const result = await registerDriver(db, {
      name: String(name).trim(),
      phone: cleanPhone,
      truckType: String(truckType).trim(),
      capacity: capacityNum,
      city: String(city).trim(),
      vehicleNumber: String(vehicleNumber || "").trim(),
      preferredRoutes: Array.isArray(preferredRoutes) ? preferredRoutes : [],
      lat: 30.7046,
      lng: 76.212,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Driver registered successfully",
        phone: cleanPhone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Driver registration error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Driver already registered with this phone number" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}
