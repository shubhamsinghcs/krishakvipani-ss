import { ObjectId } from "mongodb";

export const USERS_COLLECTION = "users";

export async function ensureUserIndexes(db) {
  const coll = db.collection(USERS_COLLECTION);
  await coll.createIndex({ phone: 1 }, { unique: true });
}

export async function createUser(db, { name, phone, passwordHash, district }) {
  const now = new Date();
  const doc = {
    name: String(name).trim(),
    phone: String(phone).trim(),
    password: passwordHash,
    district: String(district || "").trim(),
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection(USERS_COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function findUserByPhone(db, phone) {
  return db.collection(USERS_COLLECTION).findOne({ phone: String(phone).trim() });
}

export async function findUserById(db, id) {
  try {
    return db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(id) });
  } catch (_error) {
    return null;
  }
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password: _p, ...rest } = user;
  return rest;
}
