import { ObjectId } from "mongodb";

export const DRIVERS_COLLECTION = "drivers";

export async function ensureDriverIndexes(db) {
  const coll = db.collection(DRIVERS_COLLECTION);
  // 2dsphere index for location proximity searches
  await coll.createIndex({ location: "2dsphere" });
  await coll.createIndex({ phone: 1 }, { unique: true });
}

export async function registerDriver(db, data) {
  const { name, phone, truckType, lat, lng } = data;
  
  const doc = {
    name: String(name || "").trim(),
    phone: String(phone || "").trim(),
    truckType: String(truckType || "Standard").trim(),
    location: {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)] // [longitude, latitude]
    },
    available: true,
    lastUpdated: new Date(),
  };

  const res = await db.collection(DRIVERS_COLLECTION).updateOne(
    { phone: doc.phone },
    { $set: doc },
    { upsert: true }
  );
  return res;
}

export async function getNearbyDrivers(db, lat, lng, radiusKm = 50) {
  return db.collection(DRIVERS_COLLECTION).find({
    available: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radiusKm * 1000 // Convert to meters
      }
    }
  }).limit(20).toArray();
}

export async function updateDriverLocation(db, phone, lat, lng, available = true) {
  return db.collection(DRIVERS_COLLECTION).updateOne(
    { phone: String(phone).trim() },
    { 
      $set: { 
        location: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        available: Boolean(available),
        lastUpdated: new Date()
      } 
    }
  );
}
