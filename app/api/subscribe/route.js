import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { savePushSubscription } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function parseBody(text) {
  try {
    return JSON.parse(text || "{}");
  } catch {
    return null;
  }
}

function validateSubscription(sub) {
  if (!sub || typeof sub !== "object") {
    return { ok: false, message: "अमान्य सदस्यता।" };
  }
  const endpoint = typeof sub.endpoint === "string" ? sub.endpoint.trim() : "";
  if (!endpoint || endpoint.length > 2048 || !/^https?:\/\//i.test(endpoint)) {
    return { ok: false, message: "अमान्य endpoint।" };
  }
  const keys = sub.keys && typeof sub.keys === "object" ? sub.keys : {};
  const p256dh = typeof keys.p256dh === "string" ? keys.p256dh.trim() : "";
  const auth = typeof keys.auth === "string" ? keys.auth.trim() : "";
  if (!p256dh || p256dh.length > 500 || !auth || auth.length > 200) {
    return { ok: false, message: "अमान्य कुंजी।" };
  }
  return {
    ok: true,
    subscription: {
      endpoint,
      keys: { p256dh, auth },
    },
  };
}

export async function POST(request) {
  try {
    let raw;
    try {
      raw = await request.text();
    } catch {
      return NextResponse.json({ success: false, message: "अनुरोध पढ़ने में त्रुटि।" }, { status: 400 });
    }
    if (!raw || raw.length > 16000) {
      return NextResponse.json({ success: false, message: "अनुरोध बहुत बड़ा है।" }, { status: 413 });
    }

    const body = parseBody(raw);
    const v = validateSubscription(body?.subscription);
    if (!v.ok) {
      return NextResponse.json({ success: false, message: v.message }, { status: 400 });
    }

    const userId = getAuthUserId(request);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), 10000);
    });

    await Promise.race([savePushSubscription(v.subscription, userId), timeoutPromise]);

    return NextResponse.json({ success: true, message: "सदस्यता सहेजी गई।" }, { status: 201 });
  } catch (error) {
    const msg = error?.message === "timeout" ? "समय समाप्त।" : "सदस्यता सहेजने में त्रुटि।";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
