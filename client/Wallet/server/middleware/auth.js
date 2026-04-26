import { findUserById, getBearerToken, verifyToken } from "../services/authService.js";
import { sendJson } from "../utils/http.js";

export async function requireUser(req, res) {
  const payload = verifyToken(getBearerToken(req));

  if (!payload) {
    sendJson(res, 401, { error: "Missing or invalid token" });
    return null;
  }

  const user = await findUserById(payload.sub);

  if (!user) {
    sendJson(res, 401, { error: "User no longer exists" });
    return null;
  }

  return user;
}
