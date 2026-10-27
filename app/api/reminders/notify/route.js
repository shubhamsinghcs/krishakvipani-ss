import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { processDueReminders } from "@/lib/jobs/notifyReminders";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const userId = getAuthUserId(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  try {
    const db = await getDb();
    const result = await processDueReminders(db);
    return NextResponse.json({ success: true, count: result.count });
  } catch (e) {
    console.error('Reminders notify error', e);
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 });
  }
}
