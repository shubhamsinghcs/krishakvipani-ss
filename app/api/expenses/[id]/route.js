import { NextResponse } from "next/server";
import { getAuthUserCookie } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  // Use cookie-based auth — same method as GET/POST in /api/expenses/route.js
  const userId = getAuthUserCookie(request);
  if (!userId) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

  try {
    const db = await getDb();
    // Coerce userId to ObjectId to match what insertExpense stores
    const userOid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    const result = await db.collection("expenses").deleteOne({
      _id: new ObjectId(params.id),
      userId: userOid,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Expense not found or not yours" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
