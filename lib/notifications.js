import webpush from "web-push";
import { getDb } from "@/lib/mongodb";

const PUSH_SUBS = "push_subscriptions";

function isVapidConfigured() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  return Boolean(pub && priv && !pub.includes("your_") && !priv.includes("your_"));
}

export function configureWebPush() {
  if (!isVapidConfigured()) return false;
  webpush.setVapidDetails(
    "mailto:support@krishibazaar.local",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  return true;
}

export async function savePushSubscription(subscription, userId = null) {
  const db = await getDb();
  const doc = {
    endpoint: subscription.endpoint,
    keys: subscription.keys || {},
    userId: userId || null,
    createdAt: new Date(),
  };
  await db.collection(PUSH_SUBS).updateOne({ endpoint: doc.endpoint }, { $set: doc }, { upsert: true });
}

export async function sendRainAlertNotification(cityLabel) {
  if (!configureWebPush()) return { sent: 0, skipped: true };
  const db = await getDb();
  const subs = await db.collection(PUSH_SUBS).find({}).toArray();
  const body = `🌧️ बारिश आने वाली है — सिंचाई रोकें${cityLabel ? ` (${cityLabel})` : ""}`;
  const payload = JSON.stringify({
    title: "KrishakVipani मौसम अलर्ट",
    body,
    icon: "/logo.svg",
    data: { url: "/weather" },
  });
  let sent = 0;
  for (const sub of subs) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: sub.keys,
    };
    try {
      await webpush.sendNotification(pushSub, payload);
      sent += 1;
    } catch (error) {
      const status = error?.statusCode;
      if (status === 404 || status === 410) {
        await db.collection(PUSH_SUBS).deleteOne({ endpoint: sub.endpoint });
      }
    }
  }
  return { sent, skipped: false };
}
