import { ObjectId } from "mongodb";

export async function createExpenseSchema(db) {
  try {
    await db.createCollection("expenses");
  } catch {
    /* ignore */
  }
  try {
    await db.collection("expenses").createIndex({ userId: 1, createdAt: -1 });
  } catch {
    /* ignore */
  }
}

export async function insertExpense(db, { userId, desc, amount, date }) {
  const doc = {
    userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId,
    desc,
    amount: parseFloat(amount),
    date,
    createdAt: new Date(),
  };
  const res = await db.collection("expenses").insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function getExpensesByUser(db, userId) {
  const q = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
  return await db.collection("expenses").find({ userId: q }).sort({ createdAt: -1 }).toArray();
}
