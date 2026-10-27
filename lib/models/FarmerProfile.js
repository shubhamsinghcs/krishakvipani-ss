import { ObjectId } from "mongodb";

export async function ensureFarmerProfileIndexes(db) {
  const coll = db.collection("farmer_profiles");
  await coll.createIndex({ userId: 1 }, { unique: true, sparse: true });
  await coll.createIndex({ updatedAt: -1 });
}

export async function getFarmerProfile(db, userId) {
  const coll = db.collection("farmer_profiles");
  return coll.findOne({ userId });
}

export async function upsertFarmerProfile(db, userId, data) {
  const coll = db.collection("farmer_profiles");
  return coll.updateOne(
    { userId },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
}

export async function updateFarmerPreferences(db, userId, preferences) {
  const coll = db.collection("farmer_profiles");
  return coll.updateOne(
    { userId },
    {
      $set: {
        preferences,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
