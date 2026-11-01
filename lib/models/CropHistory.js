import { ObjectId } from "mongodb";

export const CROP_HISTORY_COLLECTION = "crop_history";

export async function ensureCropHistoryIndexes(db) {
  const coll = db.collection(CROP_HISTORY_COLLECTION);
  await coll.createIndex({ userId: 1, createdAt: -1 });
  // Automated retention policy: Clean up temporary history records after 90 days unless marked is_saved
  try {
    await coll.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 90 * 24 * 3600, partialFilterExpression: { is_saved: { $ne: true } } }
    );
  } catch {
    /* ignore index existence conflicts */
  }
}

export async function insertCropScan(db, userId, result) {
  const now = new Date();
  let parsedUserId = userId;
  if (typeof userId === "string" && ObjectId.isValid(userId) && userId.length === 24) {
    try {
      parsedUserId = new ObjectId(userId);
    } catch {
      parsedUserId = userId;
    }
  }

  const doc = {
    userId: parsedUserId,
    disease: result?.disease?.name || result?.disease || "Healthy",
    crop_type: result?.crop?.name || result?.crop_type || result?.crop || "Crop",
    confidence: typeof (result?.disease?.confidence ?? result?.confidence) === "number"
      ? (result?.disease?.confidence ?? result?.confidence)
      : 0,
    severity: result?.disease?.severity || result?.severity || "None",
    is_healthy: Boolean(result?.disease?.is_healthy ?? result?.is_healthy),
    thumbnail: result?.thumbnail || null,
    resultSnapshot: result,
    is_saved: Boolean(result?.is_saved),
    createdAt: now,
  };

  const res = await db.collection(CROP_HISTORY_COLLECTION).insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function listCropHistoryForUser(db, userId, limit = 50) {
  let queryUserId = userId;
  if (typeof userId === "string" && ObjectId.isValid(userId) && userId.length === 24) {
    try {
      queryUserId = new ObjectId(userId);
    } catch {
      queryUserId = userId;
    }
  }

  return db
    .collection(CROP_HISTORY_COLLECTION)
    .find({
      $or: [
        { userId: queryUserId },
        { userId: String(userId) },
      ],
    })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 100))
    .toArray();
}
