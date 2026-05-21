import { CLIENT_ORIGIN, IS_PRODUCTION, MAX_BODY_BYTES } from "../config.js";

const ALLOWED_METHODS = "GET,POST,OPTIONS";
const ALLOWED_HEADERS = "Content-Type,Authorization";

export function sendJson(res, status, payload) {
  res.writeHead(status, {
    ...securityHeaders(),
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(payload));
}

export function sendNoContent(res, status = 204) {
  res.writeHead(status, securityHeaders());
  res.end();
}

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return parseJson(req.body);

  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error("Request body is too large");
      error.status = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return parseJson(Buffer.concat(chunks).toString("utf8"));
}

export function cleanEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function cleanText(value) {
  return String(value || "").trim();
}

function parseJson(value) {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    const error = new Error("Invalid JSON body");
    error.status = 400;
    throw error;
  }
}

export function securityHeaders() {
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
  };

  if (CLIENT_ORIGIN) {
    headers["Access-Control-Allow-Origin"] = CLIENT_ORIGIN;
    headers.Vary = "Origin";
  } else if (!IS_PRODUCTION) {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}
