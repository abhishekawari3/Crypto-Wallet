import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_USERS_FILE = join(__dirname, "..", "data", "users.json");
const DATA_DIR = process.env.VERCEL ? join(tmpdir(), "nexawallet") : join(__dirname, "..", "data");
const USERS_FILE = join(DATA_DIR, "users.json");

export async function readUsers() {
  try {
    const content = await readFile(USERS_FILE, "utf8");
    return JSON.parse(content);
  } catch {
    const seedUsers = await readSeedUsers();
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(USERS_FILE, JSON.stringify(seedUsers, null, 2));
    return seedUsers;
  }
}

export async function writeUsers(users) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function readSeedUsers() {
  try {
    return JSON.parse(await readFile(SOURCE_USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}
