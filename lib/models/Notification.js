export async function ensureNotificationIndexes(db) {
  try {
    const col = db.collection("notifications");
    await col.createIndex({ userId: 1, read: 1, createdAt: -1 });
  } catch (e) {
    /* ignore */
  }
}

export async function saveNotification(db, { userId, title, body, meta = {} }) {
  const col = db.collection("notifications");
  const now = new Date();
  const doc = { userId, title, body, meta, read: false, createdAt: now, updatedAt: now };
  const res = await col.insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function getUserNotifications(db, userId, limit = 50) {
  const col = db.collection("notifications");
  return await col.find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function markNotificationRead(db, id) {
  const { ObjectId } = await import("mongodb");
  const col = db.collection("notifications");
  const res = await col.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { read: true, updatedAt: new Date() } }, { returnDocument: "after" });
  return res.value;
}

export async function deleteNotification(db, id) {
  const { ObjectId } = await import("mongodb");
  const col = db.collection("notifications");
  await col.deleteOne({ _id: new ObjectId(id) });
}
