import { ObjectId } from "mongodb";

export async function createOrderSchema(db) {
  try {
    await db.createCollection("orders");
  } catch {
    /* ignore */
  }
}

export async function insertOrder(db, { userId, productId, quantity, totalCost }) {
  const doc = {
    userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId,
    productId,
    quantity,
    totalCost,
    status: "Pending",
    createdAt: new Date(),
  };
  const res = await db.collection("orders").insertOne(doc);
  return { ...doc, _id: res.insertedId };
}
