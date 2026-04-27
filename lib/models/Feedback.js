import { ObjectId } from "mongodb";

export const FEEDBACK_COLLECTION = "feedback";

export async function ensureFeedbackIndexes(db) {
  const coll = db.collection(FEEDBACK_COLLECTION);
  await coll.createIndex({ createdAt: -1 });
}

export async function saveFeedback(db, data) {
  const { isCorrect, context, result } = data;
  
  const doc = {
    isCorrect: Boolean(isCorrect),
    context: String(context || ""),
    result: result || {},
    createdAt: new Date(),
  };

  const res = await db.collection(FEEDBACK_COLLECTION).insertOne(doc);
  return { ...doc, _id: res.insertedId };
}
