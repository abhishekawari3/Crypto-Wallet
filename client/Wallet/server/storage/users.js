import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const USERS_FILE = join(DATA_DIR, "users.json");

export async function readUsers() {
  try {
    const content = await readFile(USERS_FILE, "utf8");
    return JSON.parse(content);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(USERS_FILE, "[]");
    return [];
  }
}

export async function writeUsers(users) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}
