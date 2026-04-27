import { ObjectId } from "mongodb";

export const SCANS_COLLECTION = "scans";

export async function ensureScanIndexes(db) {
  const coll = db.collection(SCANS_COLLECTION);
  await coll.createIndex({ userId: 1, createdAt: -1 });
}

export async function saveScan(db, data) {
  const { userId, crop, disease, confidence } = data;
  
  if (!userId || !crop || !disease) {
    throw new Error("Missing required Scan fields: userId, crop, or disease");
  }

  const doc = {
    userId: typeof userId === "string" ? new ObjectId(userId) : userId,
    crop: String(crop),
    disease: String(disease),
    confidence: typeof confidence === "number" ? confidence : 0,
    createdAt: new Date(),
  };

  const res = await db.collection(SCANS_COLLECTION).insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function getUserScans(db, userId, limit = 50) {
  return db
    .collection(SCANS_COLLECTION)
    .find({ userId: typeof userId === "string" ? new ObjectId(userId) : userId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 100))
    .toArray();
}
