import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ensureDriverIndexes, registerDriver } from "@/lib/models/Driver";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { name, phone, truckType, lat, lng } = await request.json();

    if (!name || !phone || !lat || !lng) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();
    await ensureDriverIndexes(db).catch(() => {});
    
    await registerDriver(db, { name, phone, truckType, lat, lng });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error registering driver." }, { status: 500 });
  }
}
