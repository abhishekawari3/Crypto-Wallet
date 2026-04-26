import crypto from "node:crypto";
import { TOKEN_SECRET, TOKEN_TTL_MS } from "../config.js";
import { readUsers, writeUsers } from "../storage/users.js";

export async function createUser({ name, email, password }) {
  const users = await readUsers();

  if (users.some((user) => user.email === email)) {
    const error = new Error("Account already exists");
    error.status = 409;
    throw error;
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password: hashPassword(password),
    wallets: [],
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

export async function authenticateUser(email, password) {
  const users = await readUsers();
  const user = users.find((item) => item.email === email);

  if (!user || !verifyPassword(password, user.password)) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  return user;
}

export async function findUserById(id) {
  const users = await readUsers();
  return users.find((user) => user.id === id) || null;
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;

  const actual = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256");
  const expected = Buffer.from(hash, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function signToken(payload) {
  const body = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(encoded).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  return payload.exp > Date.now() ? payload : null;
}

export function getBearerToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : "";
}
