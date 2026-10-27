import { getDb } from "@/lib/mongodb";
import { saveNotification } from "@/lib/models/Notification";
import { updateReminder } from "@/lib/models/Reminder";

export async function processDueReminders(db) {
  const now = new Date();
  const col = db.collection("reminders");
  const due = await col.find({ enabled: true, done: { $ne: true }, notified: { $ne: true }, dueDate: { $lte: now } }).toArray();
  for (const r of due) {
    try {
      await saveNotification(db, { userId: r.userId, title: `Reminder: ${r.title}`, body: r.notes || 'Reminder due', meta: { type: 'reminder', reminderId: r._id } });
    } catch (e) {
      console.error('notifyReminders: failed to save notification', e);
    }
    try {
      await updateReminder(db, r._id, { notified: true });
    } catch (e) {
      console.error('notifyReminders: failed to mark notified', e);
    }
  }
  return { count: due.length };
}

export async function runNotifyReminders() {
  const db = await getDb();
  return processDueReminders(db);
}
