import { MONGODB_URI } from "../config.js";

const uri = MONGODB_URI;
const dbName = process.env.MONGODB_DB || "nexa_wallet";
let clientPromise;
let collectionsPromise;

export function hasMongoConfig() {
  return Boolean(uri);
}

export async function getCollections() {
  if (!uri) return null;
  if (!collectionsPromise) {
    collectionsPromise = connect();
  }

  return collectionsPromise;
}

async function connect() {
  if (!clientPromise) {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  const db = client.db(dbName);
  const users = db.collection("users");
  const wallets = db.collection("wallets");

  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    wallets.createIndex({ userId: 1, chain: 1, walletIndex: 1 }),
    wallets.createIndex({ userId: 1, chain: 1, address: 1 }),
    wallets.createIndex({ userId: 1, chain: 1, publicKey: 1 }),
  ]);

  return { users, wallets };
}
