import { MongoClient } from "mongodb";

import { safeEnv } from "@/lib/env";

const uri = safeEnv("MONGODB_URI", "");

const globalForMongo = globalThis;

let clientPromise;

if (!uri) {
  console.warn("⚠️ MONGODB_URI not found. Running without DB.");
} else {
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri);

    globalForMongo._mongoClientPromise = client
      .connect()
      .then((connectedClient) => {
        console.log("✅ MongoDB Connected");
        return connectedClient;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        return null;
      });
  }

  clientPromise = globalForMongo._mongoClientPromise;
}

export async function getDb(dbName = safeEnv("MONGODB_DB_NAME", "krishakvipani")) {
  if (!clientPromise) {
    throw new Error("Database not available");
  }

  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;