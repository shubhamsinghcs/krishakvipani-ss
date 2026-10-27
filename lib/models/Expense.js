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

export async function insertExpense(db, { userId, desc, amount, date, category }) {
  // Always store userId as ObjectId for consistent querying
  const userOid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
  const doc = {
    userId: userOid,
    desc,
    amount: parseFloat(amount),
    date,
    category: category || "other",
    createdAt: new Date(),
  };
  const res = await db.collection("expenses").insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function getExpensesByUser(db, userId) {
  // Coerce to ObjectId to match what insertExpense stores
  const userOid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
  return await db.collection("expenses").find({ userId: userOid }).sort({ createdAt: -1 }).toArray();
}

/**
 * Aggregate expense summary for a user, optionally filtered by date range.
 * @returns {{ totalExpenses: number, count: number }}
 */
export async function getExpenseSummary(db, userId, { startDate, endDate } = {}) {
  const userOid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
  const match = { userId: userOid };

  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = startDate;
    if (endDate) match.date.$lte = endDate;
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: { $ifNull: ["$amount", 0] } },
        count: { $sum: 1 },
      },
    },
  ];

  const [result] = await db.collection("expenses").aggregate(pipeline).toArray();
  return result
    ? { totalExpenses: result.totalExpenses, count: result.count }
    : { totalExpenses: 0, count: 0 };
}
