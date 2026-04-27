import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ensureUserIndexes } from "@/lib/models/User";
import { ensureCropHistoryIndexes } from "@/lib/models/CropHistory";

export const dynamic = "force-dynamic";

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database operation timed out")), ms);
    }),
  ]);
}

export async function GET() {
  try {
    const db = await withTimeout(getDb(), 10000);

    try {
      await withTimeout(ensureUserIndexes(db), 5000);
    } catch {
      /* non-fatal */
    }
    try {
      await withTimeout(ensureCropHistoryIndexes(db), 5000);
    } catch {
      /* non-fatal */
    }

    const col = db.collection("connectivity_tests");
    const doc = {
      testedAt: new Date(),
      source: "api-test-db",
      ok: true,
    };

    const insertResult = await withTimeout(col.insertOne(doc), 8000);
    const inserted = await withTimeout(col.findOne({ _id: insertResult.insertedId }), 8000);

    if (!inserted) {
      return NextResponse.json(
        { success: false, message: "Inserted document could not be read back." },
        { status: 503 }
      );
    }

    const { _id, testedAt, source, ok } = inserted;
    return NextResponse.json(
      {
        success: true,
        message: "MongoDB read/write OK",
        document: { _id: String(_id), testedAt, source, ok },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error?.message || "Database connection failed";
    const status = message.includes("timeout") ? 503 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
