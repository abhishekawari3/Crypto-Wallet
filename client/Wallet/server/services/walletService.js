import crypto from "node:crypto";
import { TOKEN_SECRET } from "../config.js";
import { findWallet, getUserWallets, insertWallet } from "../storage/users.js";

const KEY = crypto.createHash("sha256").update(TOKEN_SECRET).digest();
const CHAINS = new Set(["ethereum", "solana"]);

export async function getWallets(userId) {
  const wallets = await getUserWallets(userId);
  return wallets.map(publicWallet);
}

export async function saveWallet(userId, wallet) {
  const chain = String(wallet.chain || "").toLowerCase();
  const address = cleanAddress(wallet.address || wallet.publicKey);
  const privateKey = String(wallet.privateKey || "").trim();

  if (!CHAINS.has(chain) || !address || !privateKey) {
    const error = new Error("chain, address/publicKey, and privateKey are required");
    error.status = 400;
    throw error;
  }

  const existing = await findWallet(
    userId,
    chain,
    chain === "ethereum" ? address : null,
    chain === "solana" ? address : null
  );

  if (existing) return publicWallet(existing);

  const wallets = await getUserWallets(userId);
  const chainWallets = wallets.filter((item) => item.chain === chain);
  const walletIndex = Number.isInteger(Number(wallet.index)) ? Number(wallet.index) : chainWallets.length;
  const record = {
    id: crypto.randomUUID(),
    userId,
    chain,
    walletIndex,
    address: chain === "ethereum" ? address : undefined,
    publicKey: chain === "solana" ? address : undefined,
    encryptedPrivateKey: encrypt(privateKey),
    createdAt: new Date().toISOString(),
  };

  const saved = await insertWallet(record);
  return publicWallet(saved || record);
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

function cleanAddress(value) {
  return String(value || "").trim();
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

  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}
