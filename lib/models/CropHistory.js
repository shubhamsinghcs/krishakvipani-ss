import { ObjectId } from "mongodb";

export const CROP_HISTORY_COLLECTION = "crop_history";

export async function ensureCropHistoryIndexes(db) {
  const coll = db.collection(CROP_HISTORY_COLLECTION);
  await coll.createIndex({ userId: 1, createdAt: -1 });
}

export async function insertCropScan(db, userId, result) {
  const now = new Date();
  const doc = {
    userId: new ObjectId(userId),
    disease: result?.disease ?? "",
    crop_type: result?.crop_type ?? "",
    confidence: typeof result?.confidence === "number" ? result.confidence : 0,
    severity: result?.severity ?? "",
    is_healthy: Boolean(result?.is_healthy),
    resultSnapshot: result,
    createdAt: now,
  };
  const res = await db.collection(CROP_HISTORY_COLLECTION).insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function listCropHistoryForUser(db, userId, limit = 50) {
  return db
    .collection(CROP_HISTORY_COLLECTION)
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 100))
    .toArray();
}
