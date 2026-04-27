import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { signToken } from "@/lib/auth";
import { createUser, ensureUserIndexes, findUserByPhone, sanitizeUser } from "@/lib/models/User";

export const dynamic = "force-dynamic";

const SALT_ROUNDS = 10;
const PHONE_RE = /^[6-9]\d{9}$/;

function parseBody(text) {
  try {
    return JSON.parse(text || "{}");
  } catch {
    return null;
  }
}

function validateSignup(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "अमान्य अनुरोध।" };
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.replace(/\s/g, "") : "";
  const password = typeof body.password === "string" ? body.password : "";
  const district = typeof body.district === "string" ? body.district.trim() : "";

  if (name.length < 2 || name.length > 80) {
    return { ok: false, message: "नाम 2–80 अक्षरों का होना चाहिए।" };
  }
  if (!PHONE_RE.test(phone)) {
    return { ok: false, message: "मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।" };
  }
  if (password.length < 8 || password.length > 128) {
    return { ok: false, message: "पासवर्ड 8–128 अक्षरों का होना चाहिए।" };
  }
  if (district.length > 100) {
    return { ok: false, message: "जिला नाम बहुत लंबा है।" };
  }
  return { ok: true, name, phone, password, district };
}

export async function POST(request) {
  try {
    let raw;
    try {
      raw = await request.text();
    } catch {
      return NextResponse.json({ success: false, message: "अनुरोध पढ़ने में त्रुटि।" }, { status: 400 });
    }
    if (!raw || raw.length > 8000) {
      return NextResponse.json({ success: false, message: "अनुरोध बहुत बड़ा है।" }, { status: 413 });
    }

    const body = parseBody(raw);
    const v = validateSignup(body);
    if (!v.ok) {
      return NextResponse.json({ success: false, message: v.message }, { status: 400 });
    }

    const db = await getDb();
    try {
      await ensureUserIndexes(db);
    } catch {
      /* index may already exist */
    }

    const existing = await findUserByPhone(db, v.phone);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "यह मोबाइल नंबर पहले से पंजीकृत है।" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(v.password, SALT_ROUNDS);
    const user = await createUser(db, {
      name: v.name,
      phone: v.phone,
      passwordHash,
      district: v.district || "",
    });

    const userId = String(user._id);
    const token = signToken({ sub: userId });

    return NextResponse.json(
      {
        success: true,
        token,
        user: sanitizeUser(user),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "यह मोबाइल नंबर पहले से पंजीकृत है।" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि। कृपया बाद में प्रयास करें।" },
      { status: 500 }
    );
  }
}
