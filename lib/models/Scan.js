import { ObjectId } from "mongodb";

export const SCANS_COLLECTION = "scans";

export async function ensureScanIndexes(db) {
  const coll = db.collection(SCANS_COLLECTION);
  await coll.createIndex({ userId: 1, createdAt: -1 });
  // Automated image retention policy: Clean up unstarred scans after 30 days
  try {
    await coll.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 30 * 24 * 3600, partialFilterExpression: { is_starred: { $ne: true } } }
    );
  } catch {
    /* ignore index existence conflicts */
  }
}

export async function saveScan(db, data) {
  const { userId, crop, disease, confidence, thumbnail, resultSnapshot, is_starred } = data;
  
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
    crop: String(crop || "Crop"),
    disease: String(disease || "Healthy"),
    confidence: typeof confidence === "number" ? confidence : 0,
    thumbnail: thumbnail || null,
    resultSnapshot: resultSnapshot || null,
    is_starred: Boolean(is_starred),
    createdAt: new Date(),
  };

  const res = await db.collection(SCANS_COLLECTION).insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function getUserScans(db, userId, limit = 50) {
  let queryUserId = userId;
  if (typeof userId === "string" && ObjectId.isValid(userId) && userId.length === 24) {
    try {
      queryUserId = new ObjectId(userId);
    } catch {
      queryUserId = userId;
    }
  }

  return db
    .collection(SCANS_COLLECTION)
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
