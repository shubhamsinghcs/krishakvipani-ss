import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthUserCookie } from "@/lib/auth";
import { createOrderSchema, insertOrder } from "@/lib/models/Order";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const userId = getAuthUserCookie(request);
  if (!userId) return NextResponse.json({ success: false, message: "ऑर्डर करने के लिए लॉग इन करें।" }, { status: 401 });

  try {
    const { productId, quantity, totalCost } = await request.json();

    const db = await getDb();
    await createOrderSchema(db);
    const order = await insertOrder(db, { userId, productId, quantity, totalCost });

    return NextResponse.json({ success: true, order });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "सर्वर त्रुटि।" }, { status: 500 });
  }
}
