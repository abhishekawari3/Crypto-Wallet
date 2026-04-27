import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "nexa_wallet";
const client = new MongoClient(uri, { maxPoolSize: 10 });

await client.connect();
const db = client.db(dbName);

export const users = db.collection("users");
export const wallets = db.collection("wallets");

await users.createIndex({ email: 1 }, { unique: true });
await wallets.createIndex({ userId: 1, chain: 1, walletIndex: 1 });
