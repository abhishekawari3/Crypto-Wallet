import { users, wallets } from "./mongo.js";

export function findUserByEmail(email) {
  return users.findOne({ email });
}

export function findUserById(id) {
  return users.findOne({ id });
}

export async function createUser(user) {
  await users.insertOne(user);
  return findUserById(user.id);
}

export function getUserWallets(userId) {
  return wallets.find({ userId }).sort({ walletIndex: 1 }).toArray();
}

export function findWallet(userId, chain, address, publicKey) {
  if (chain === "ethereum") {
    return wallets.findOne({ userId, chain, address });
  }

  return wallets.findOne({ userId, chain, publicKey });
}

export async function insertWallet(wallet) {
  await wallets.insertOne(wallet);
  return wallets.findOne({ id: wallet.id });
}
