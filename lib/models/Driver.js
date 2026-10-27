import { ObjectId } from "mongodb";

export const DRIVERS_COLLECTION = "drivers";

export async function ensureDriverIndexes(db) {
  const coll = db.collection(DRIVERS_COLLECTION);
  await coll.createIndex({ location: "2dsphere" });
  await coll.createIndex({ phone: 1 }, { unique: true });
  await coll.createIndex({ city: 1 });
  await coll.createIndex({ availability: 1 });
  await coll.createIndex({ createdAt: -1 });
}

export async function registerDriver(db, data) {
  const {
    name,
    phone,
    truckType,
    capacity,
    city,
    vehicleNumber,
    preferredRoutes,
    lat,
    lng,
  } = data;

  const doc = {
    name: String(name || "").trim(),
    phone: String(phone || "").trim(),
    truckType: String(truckType || "").trim(),
    capacity: parseFloat(capacity) || 1,
    city: String(city || "").trim(),
    vehicleNumber: String(vehicleNumber || "").trim(),
    preferredRoutes: Array.isArray(preferredRoutes) ? preferredRoutes : [],
    location: {
      type: "Point",
      coordinates: [parseFloat(lng || 0), parseFloat(lat || 0)],
    },
    availability: true,
    rating: 4.5,
    reviewCount: 0,
    verified: true,
    documents: {
      license: true,
      insurance: true,
      pollutionCert: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
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
  return db
    .collection(DRIVERS_COLLECTION)
    .find({
      availability: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusKm * 1000,
        },
      },
    })
    .limit(20)
    .toArray();
}

export async function getDriverById(db, id) {
  return db.collection(DRIVERS_COLLECTION).findOne({
    _id: new ObjectId(id),
  });
}

export async function getDriver(db, phone) {
  return db.collection(DRIVERS_COLLECTION).findOne({
    phone: String(phone).trim(),
  });
}

export async function listDrivers(db, city = null, limit = 20) {
  const query = { availability: true };
  if (city) query.city = city;
  return db
    .collection(DRIVERS_COLLECTION)
    .find(query)
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function updateDriverLocation(db, phone, lat, lng, available = true) {
  return db.collection(DRIVERS_COLLECTION).updateOne(
    { phone: String(phone).trim() },
    {
      $set: {
        location: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        availability: Boolean(available),
        updatedAt: new Date(),
        lastUpdated: new Date(),
      },
    }
  );
}

export async function updateDriverAvailability(db, phone, availability) {
  return db.collection(DRIVERS_COLLECTION).updateOne(
    { phone: String(phone).trim() },
    {
      $set: { availability: Boolean(availability), updatedAt: new Date() },
    }
  );
}
