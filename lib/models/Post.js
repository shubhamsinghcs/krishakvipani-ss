import { ObjectId } from "mongodb";

export async function createPostSchema(db) {
  try {
    await db.createCollection("posts");
  } catch {
    /* ignore if exists */
  }
  try {
    await db.collection("posts").createIndex({ createdAt: -1 });
  } catch {
    /* ignore */
  }
}

export async function insertPost(db, { userId, authorName, text }) {
  const doc = {
    userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId,
    authorName,
    role: "किसान",
    text,
    likes: 0,
    replies: 0,
    createdAt: new Date(),
  };
  const res = await db.collection("posts").insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function getRecentPosts(db, limit = 50) {
  return await db.collection("posts").find().sort({ createdAt: -1 }).limit(limit).toArray();
}
