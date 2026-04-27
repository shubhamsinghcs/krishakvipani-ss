import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthUserCookie } from "@/lib/auth";
import { createExpenseSchema, insertExpense, getExpensesByUser } from "@/lib/models/Expense";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const userId = getAuthUserCookie(request);
  if (!userId) return NextResponse.json({ success: false, message: "लॉग इन करें।" }, { status: 401 });

  try {
    const db = await getDb();
    await createExpenseSchema(db);
    const expenses = await getExpensesByUser(db, userId);
    return NextResponse.json({ success: true, expenses });
  } catch (err) {
    return NextResponse.json({ success: false, message: "डेटा लाने में त्रुटि।" }, { status: 500 });
  }
}

export async function POST(request) {
  const userId = getAuthUserCookie(request);
  if (!userId) return NextResponse.json({ success: false, message: "लॉग इन करें।" }, { status: 401 });

  try {
    const { desc, amount, date } = await request.json();
    if (!desc || !amount) {
      return NextResponse.json({ success: false, message: "विवरण और राशि आवश्यक है।" }, { status: 400 });
    }

    const db = await getDb();
    await createExpenseSchema(db);
    const expense = await insertExpense(db, { userId, desc, amount, date });

    return NextResponse.json({ success: true, expense });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "सर्वर त्रुटि।" }, { status: 500 });
  }
}
