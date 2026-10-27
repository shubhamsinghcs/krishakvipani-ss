export async function ensureReminderIndexes(db) {
  try {
    const col = db.collection("reminders");
    await col.createIndex({ userId: 1, dueDate: 1 });
    await col.createIndex({ userId: 1, createdAt: -1 });
  } catch (e) {
    /* ignore */
  }
}

export async function saveReminder(db, reminder) {
  const col = db.collection("reminders");
  const now = new Date();
  const doc = {
    userId: reminder.userId,
    title: reminder.title || "Reminder",
    notes: reminder.notes || "",
    dueDate: reminder.dueDate ? new Date(reminder.dueDate) : null,
    repeat: reminder.repeat || "none",
    enabled: reminder.enabled !== false,
    done: !!reminder.done,
    notified: false,
    createdAt: now,
    updatedAt: now,
  };
  const res = await col.insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function getUserReminders(db, userId) {
  const col = db.collection("reminders");
  const rows = await col.find({ userId }).sort({ dueDate: 1, createdAt: -1 }).toArray();
  return rows;
}

export async function updateReminder(db, id, patch) {
  const col = db.collection("reminders");
  const { ObjectId } = await import("mongodb");
  const now = new Date();
  const update = { $set: { ...patch, updatedAt: now } };
  if (patch.dueDate) update.$set.dueDate = new Date(patch.dueDate);
  const res = await col.findOneAndUpdate({ _id: new ObjectId(id) }, update, { returnDocument: "after" });
  return res.value;
}

export async function deleteReminder(db, id) {
  const col = db.collection("reminders");
  const { ObjectId } = await import("mongodb");
  await col.deleteOne({ _id: new ObjectId(id) });
}
