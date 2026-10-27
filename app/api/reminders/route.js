import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ensureReminderIndexes, saveReminder, getUserReminders } from "@/lib/models/Reminder";
import { saveNotification } from "@/lib/models/Notification";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const userId = getAuthUserId(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  try {
    const db = await getDb();
    await ensureReminderIndexes(db);
    const list = await getUserReminders(db, userId);
    return NextResponse.json({ success: true, reminders: list }, { status: 200 });
  } catch (e) {
    console.error("Reminders GET error:", e);
    return NextResponse.json({ success: false, message: "Failed to load reminders" }, { status: 500 });
  }
}

export async function POST(request) {
  const userId = getAuthUserId(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  try {
    const body = await request.json();
    const db = await getDb();
    await ensureReminderIndexes(db);
    const saved = await saveReminder(db, { ...body, userId });
    // create a persistent in-app notification for the new reminder
    try {
      await saveNotification(db, { userId, title: `Reminder: ${saved.title}`, body: saved.notes || "Reminder set", meta: { type: "reminder", reminderId: saved._id } });
    } catch (e) {
      console.error("Failed to save reminder notification", e);
    }
    return NextResponse.json({ success: true, reminder: saved }, { status: 201 });
  } catch (e) {
    console.error("Reminders POST error:", e);
    return NextResponse.json({ success: false, message: "Failed to save reminder" }, { status: 500 });
  }
}
