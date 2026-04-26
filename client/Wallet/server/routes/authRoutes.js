import { authenticateUser, createUser, findUserById, getBearerToken, publicUser, signToken, verifyToken } from "../services/authService.js";
import { cleanEmail, cleanText, readBody, sendJson } from "../utils/http.js";

export async function handleAuthRoutes(req, res, pathname) {
  if (req.method === "POST" && pathname === "/api/auth/register") {
    await register(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    await login(req, res);
    return true;
  }

  if (req.method === "GET" && pathname === "/api/auth/me") {
    await me(req, res);
    return true;
  }

  return false;
}

async function register(req, res) {
  const body = await readBody(req);
  const name = cleanText(body.name || body.fname);
  const email = cleanEmail(body.email);
  const password = String(body.password || "");

  if (!name || !email.includes("@") || password.length < 6) {
    sendJson(res, 400, { error: "Name, valid email, and 6+ character password are required" });
    return;
  }

  const user = await createUser({ name, email, password });
  const token = signToken({ sub: user.id, email: user.email });
  sendJson(res, 201, { token, user: publicUser(user) });
}

async function login(req, res) {
  const body = await readBody(req);
  const email = cleanEmail(body.email);
  const password = String(body.password || "");
  const user = await authenticateUser(email, password);
  const token = signToken({ sub: user.id, email: user.email });
  sendJson(res, 200, { token, user: publicUser(user) });
}

async function me(req, res) {
  const payload = verifyToken(getBearerToken(req));

  if (!payload) {
    sendJson(res, 401, { error: "Missing or invalid token" });
    return;
  }

  const user = await findUserById(payload.sub);

  if (!user) {
    sendJson(res, 401, { error: "User no longer exists" });
    return;
  }

  sendJson(res, 200, { user: publicUser(user) });
}
