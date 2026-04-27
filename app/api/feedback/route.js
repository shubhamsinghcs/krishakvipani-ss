import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ensureFeedbackIndexes, saveFeedback } from "@/lib/models/Feedback";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { isCorrect, context, result } = body;

    const db = await getDb();
    await ensureFeedbackIndexes(db).catch(() => {});
    
    await saveFeedback(db, { isCorrect, context, result });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "फीडबैक सेव नहीं हुआ।" }, { status: 500 });
  }
}
