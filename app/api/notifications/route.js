import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ensureNotificationIndexes, saveNotification, getUserNotifications } from "@/lib/models/Notification";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const userId = getAuthUserId(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  try {
    const db = await getDb();
    await ensureNotificationIndexes(db);
    const list = await getUserNotifications(db, userId);
    return NextResponse.json({ success: true, notifications: list }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Failed to load notifications" }, { status: 500 });
  }
}

export async function POST(request) {
  const userId = getAuthUserId(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  try {
    const body = await request.json();
    const { title, message, meta } = body;
    const db = await getDb();
    await ensureNotificationIndexes(db);
    const saved = await saveNotification(db, { userId, title, body: message, meta });
    return NextResponse.json({ success: true, notification: saved }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Failed to save notification" }, { status: 500 });
  }
}
