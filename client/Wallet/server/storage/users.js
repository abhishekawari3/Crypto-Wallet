import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getCollections, hasMongoConfig } from "./mongo.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = process.env.LOCAL_DATA_FILE || join(__dirname, "..", "data", "nexa-wallet.json");
const memory = { users: [], wallets: [] };
let fileLoaded = false;

export async function findUserByEmail(email) {
  const collections = await getStore();
  if (collections.mongo) return collections.users.findOne({ email });
  return collections.users.find((user) => user.email === email) || null;
}

export async function findUserById(id) {
  const collections = await getStore();
  if (collections.mongo) return collections.users.findOne({ id });
  return collections.users.find((user) => user.id === id) || null;
}

export async function createUser(user) {
  const collections = await getStore();
  if (collections.mongo) {
    await collections.users.insertOne(user);
    return findUserById(user.id);
  }

  collections.users.push(user);
  await persistLocal(collections);
  return findUserById(user.id);
}

export async function getUserWallets(userId) {
  const collections = await getStore();
  if (collections.mongo) return collections.wallets.find({ userId }).sort({ walletIndex: 1 }).toArray();
  return collections.wallets
    .filter((wallet) => wallet.userId === userId)
    .sort((a, b) => a.walletIndex - b.walletIndex);
}

export async function findWallet(userId, chain, address, publicKey) {
  const collections = await getStore();
  if (chain === "ethereum") {
    if (collections.mongo) return collections.wallets.findOne({ userId, chain, address });
    return collections.wallets.find((wallet) => wallet.userId === userId && wallet.chain === chain && wallet.address === address) || null;
  }

  if (collections.mongo) return collections.wallets.findOne({ userId, chain, publicKey });
  return collections.wallets.find((wallet) => wallet.userId === userId && wallet.chain === chain && wallet.publicKey === publicKey) || null;
}

export async function insertWallet(wallet) {
  const collections = await getStore();
  if (collections.mongo) {
    await collections.wallets.insertOne(wallet);
    return collections.wallets.findOne({ id: wallet.id });
  }

  collections.wallets.push(wallet);
  await persistLocal(collections);
  return collections.wallets.find((item) => item.id === wallet.id) || null;
}

async function getStore() {
  const collections = await getCollections();
  if (collections) return { ...collections, mongo: true };

  if (hasMongoConfig()) {
    const error = new Error("Database connection is not available");
    error.status = 503;
    throw error;
  }

  await loadLocal();
  return { ...memory, mongo: false };
}

async function loadLocal() {
  if (fileLoaded) return;
  fileLoaded = true;

  try {
    const data = JSON.parse(await readFile(dataFile, "utf8"));
    memory.users = Array.isArray(data.users) ? data.users : [];
    memory.wallets = Array.isArray(data.wallets) ? data.wallets : [];
  } catch {
    memory.users = [];
    memory.wallets = [];
  }
}

async function persistLocal(store) {
  if (process.env.VERCEL) return;

  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify({ users: store.users, wallets: store.wallets }, null, 2));
}
