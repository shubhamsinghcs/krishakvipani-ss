/**
 * FieldSample Model - MongoDB Schema & Indexing for Indian Field Images.
 * Captures field photographs with agronomic metadata, collection context, and expert verification.
 */

export const FIELD_COLLECTIONS = "field_samples";

export async function ensureFieldSampleIndexes(db) {
  try {
    const coll = db.collection(FIELD_COLLECTIONS);
    await Promise.allSettled([
      coll.createIndex({ crop_id: 1, disease_id: 1 }),
      coll.createIndex({ expert_verification_status: 1 }),
      coll.createIndex({ "group_metadata.farm_id": 1 }),
      coll.createIndex({ "group_metadata.session_id": 1 }),
      coll.createIndex({ season: 1, growth_stage: 1 }),
      coll.createIndex({ createdAt: -1 }),
    ]);
  } catch (err) {
    console.error("ensureFieldSampleIndexes error:", err.message);
  }
}

export async function insertFieldSample(db, sample) {
  const coll = db.collection(FIELD_COLLECTIONS);
  const doc = {
    ...sample,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return await coll.insertOne(doc);
}

export async function getVerifiedFieldSamples(db, filter = {}, limit = 500) {
  const coll = db.collection(FIELD_COLLECTIONS);
  return await coll.find(filter).limit(limit).toArray();
}
