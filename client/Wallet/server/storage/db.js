import Database from "better-sqlite3";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
await mkdir(dataDir, { recursive: true });

const databaseFile = process.env.DATABASE_URL || join(dataDir, "nexa-wallet.db");
const db = new Database(databaseFile);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  chain TEXT NOT NULL,
  walletIndex INTEGER NOT NULL,
  address TEXT,
  publicKey TEXT,
  encryptedPrivateKey TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
`);

export default db;
