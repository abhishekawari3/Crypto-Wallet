import crypto from "node:crypto";
import { TOKEN_SECRET } from "../config.js";
import { getUserWallets, findWallet, insertWallet } from "../storage/users.js";

const KEY = crypto.createHash("sha256").update(TOKEN_SECRET).digest();

export async function getWallets(userId) {
  const wallets = await getUserWallets(userId);
  return wallets.map(publicWallet);
}

export async function saveWallet(userId, wallet) {
  const address = wallet.address || wallet.publicKey;

  if (!["ethereum", "solana"].includes(wallet.chain) || !address || !wallet.privateKey) {
    const error = new Error("chain, address/publicKey, and privateKey are required");
    error.status = 400;
    throw error;
  }

  const existing = await findWallet(
    userId,
    wallet.chain,
    wallet.chain === "ethereum" ? address : null,
    wallet.chain === "solana" ? address : null
  );

  if (existing) {
    return publicWallet(existing);
  }

  const wallets = await getUserWallets(userId);
  const record = {
    id: crypto.randomUUID(),
    userId,
    chain: wallet.chain,
    walletIndex: Number(wallet.index || wallets.filter((item) => item.chain === wallet.chain).length),
    address: wallet.chain === "ethereum" ? address : undefined,
    publicKey: wallet.chain === "solana" ? address : undefined,
    encryptedPrivateKey: encrypt(wallet.privateKey),
    createdAt: new Date().toISOString(),
  };

  await insertWallet(record);
  return publicWallet(record);
}

function publicWallet(wallet) {
  return {
    id: wallet.id,
    chain: wallet.chain,
    index: wallet.walletIndex,
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
