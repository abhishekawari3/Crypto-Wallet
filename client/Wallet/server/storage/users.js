import { getCollections } from "./mongo.js";

export async function findUserByEmail(email) {
  const collections = await getStore();
  return collections.users.findOne({ email });
}

export async function findUserById(id) {
  const collections = await getStore();
  return collections.users.findOne({ id });
}

export async function createUser(user) {
  const collections = await getStore();
  await collections.users.insertOne(user);
  return findUserById(user.id);
}

export async function getUserWallets(userId) {
  const collections = await getStore();
  return collections.wallets.find({ userId }).sort({ walletIndex: 1 }).toArray();
}

export async function findWallet(userId, chain, address, publicKey) {
  const collections = await getStore();
  if (chain === "ethereum") {
    return collections.wallets.findOne({ userId, chain, address });
  }

  return collections.wallets.findOne({ userId, chain, publicKey });
}

export async function insertWallet(wallet) {
  const collections = await getStore();
  await collections.wallets.insertOne(wallet);
  return collections.wallets.findOne({ id: wallet.id });
}

async function getStore() {
  const collections = await getCollections();
  if (collections) return collections;

  const error = new Error("Database connection is not configured");
  error.status = 503;
  throw error;
}
