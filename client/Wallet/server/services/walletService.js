import crypto from "node:crypto";
import { TOKEN_SECRET } from "../config.js";
import { readUsers, writeUsers } from "../storage/users.js";

const KEY = crypto.createHash("sha256").update(TOKEN_SECRET).digest();

export async function getWallets(userId) {
  const users = await readUsers();
  const user = users.find((item) => item.id === userId);
  return (user?.wallets || []).map(publicWallet);
}

export async function saveWallet(userId, wallet) {
  const users = await readUsers();
  const userIndex = users.findIndex((item) => item.id === userId);

  if (userIndex === -1) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const user = users[userIndex];
  const wallets = user.wallets || [];
  const address = wallet.address || wallet.publicKey;

  if (!["ethereum", "solana"].includes(wallet.chain) || !address || !wallet.privateKey) {
    const error = new Error("chain, address/publicKey, and privateKey are required");
    error.status = 400;
    throw error;
  }

  const existing = wallets.find((item) => item.chain === wallet.chain && (item.address || item.publicKey) === address);
  if (existing) {
    return publicWallet(existing);
  }

  const record = {
    id: crypto.randomUUID(),
    chain: wallet.chain,
    index: Number(wallet.index || wallets.filter((item) => item.chain === wallet.chain).length),
    address: wallet.chain === "ethereum" ? address : undefined,
    publicKey: wallet.chain === "solana" ? address : undefined,
    encryptedPrivateKey: encrypt(wallet.privateKey),
    createdAt: new Date().toISOString(),
  };

  user.wallets = [...wallets, record];
  users[userIndex] = user;
  await writeUsers(users);
  return publicWallet(record);
}

function publicWallet(wallet) {
  return {
    id: wallet.id,
    chain: wallet.chain,
    index: wallet.index,
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: decrypt(wallet.encryptedPrivateKey),
    createdAt: wallet.createdAt,
  };
}

function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decrypt(value) {
  const [ivText, tagText, encryptedText] = String(value || "").split(".");
  if (!ivText || !tagText || !encryptedText) return "";

  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()]).toString("utf8");
}
