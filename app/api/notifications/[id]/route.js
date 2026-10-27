import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { markNotificationRead, deleteNotification } from "@/lib/models/Notification";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const userId = getAuthUserId(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  try {
    const db = await getDb();
    const updated = await markNotificationRead(db, params.id);
    return NextResponse.json({ success: true, notification: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Failed to mark read" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const userId = getAuthUserId(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  try {
    const db = await getDb();
    await deleteNotification(db, params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
