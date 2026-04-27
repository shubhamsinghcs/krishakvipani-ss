import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthUserCookie } from "@/lib/auth";
import { createPostSchema, insertPost, getRecentPosts } from "@/lib/models/Post";
import { findUserById } from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    await createPostSchema(db);
    const posts = await getRecentPosts(db, 30);
    return NextResponse.json({ success: true, posts });
  } catch (err) {
    return NextResponse.json({ success: false, message: "डेटा लाने में त्रुटि।" }, { status: 500 });
  }
}

export async function POST(request) {
  const userId = getAuthUserCookie(request);
  if (!userId) return NextResponse.json({ success: false, message: "लॉग इन करें।" }, { status: 401 });

  try {
    const { text } = await request.json();
    if (!text || text.length > 500) {
      return NextResponse.json({ success: false, message: "अनुरोध अमान्य है।" }, { status: 400 });
    }

    const db = await getDb();
    const user = await findUserById(db, userId);
    if (!user) return NextResponse.json({ success: false, message: "उपयोगकर्ता नहीं मिला।" }, { status: 404 });

    await createPostSchema(db);
    const post = await insertPost(db, { userId, authorName: user.name, text });

    return NextResponse.json({ success: true, post });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "सर्वर त्रुटि।" }, { status: 500 });
  }
}
