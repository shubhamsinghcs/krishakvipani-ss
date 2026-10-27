import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { updateReminder, deleteReminder } from "@/lib/models/Reminder";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const userId = getAuthUserId(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  try {
    const body = await request.json();
    const db = await getDb();
    const updated = await updateReminder(db, params.id, body);
    return NextResponse.json({ success: true, reminder: updated }, { status: 200 });
  } catch (e) {
    console.error("Reminders PATCH error:", e);
    return NextResponse.json({ success: false, message: "Failed to update reminder" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const userId = getAuthUserId(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  try {
    const db = await getDb();
    await deleteReminder(db, params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Reminders DELETE error:", e);
    return NextResponse.json({ success: false, message: "Failed to delete reminder" }, { status: 500 });
  }
}
