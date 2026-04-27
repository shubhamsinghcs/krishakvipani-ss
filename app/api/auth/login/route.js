import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { signToken } from "@/lib/auth";
import { findUserByPhone, sanitizeUser } from "@/lib/models/User";

export const dynamic = "force-dynamic";

const PHONE_RE = /^[6-9]\d{9}$/;

function parseBody(text) {
  try {
    return JSON.parse(text || "{}");
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    let raw;
    try {
      raw = await request.text();
    } catch {
      return NextResponse.json({ success: false, message: "अनुरोध पढ़ने में त्रुटि।" }, { status: 400 });
    }
    if (!raw || raw.length > 4000) {
      return NextResponse.json({ success: false, message: "अनुरोध बहुत बड़ा है।" }, { status: 413 });
    }

    const body = parseBody(raw);
    const phone = typeof body?.phone === "string" ? body.phone.replace(/\s/g, "") : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!PHONE_RE.test(phone)) {
      return NextResponse.json({ success: false, message: "मान्य मोबाइल नंबर दर्ज करें।" }, { status: 400 });
    }
    if (!password || password.length > 128) {
      return NextResponse.json({ success: false, message: "अमान्य पासवर्ड।" }, { status: 400 });
    }

    const db = await getDb();
    const user = await findUserByPhone(db, phone);
    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "मोबाइल या पासवर्ड गलत है।" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { success: false, message: "मोबाइल या पासवर्ड गलत है।" },
        { status: 401 }
      );
    }

    const userId = String(user._id);
    const token = signToken({ sub: userId });

    const response = NextResponse.json(
      {
        success: true,
        token,
        user: sanitizeUser(user),
      },
      { status: 200 }
    );

    // Set cookie for middleware.js to read
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि। कृपया बाद में प्रयास करें।" },
      { status: 500 }
    );
  }
}
