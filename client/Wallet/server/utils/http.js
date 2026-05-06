import { CLIENT_ORIGINS } from "../config.js";

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const isAllowedVercelPreview = origin && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
  res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGINS.has(origin) || isAllowedVercelPreview ? origin : "http://127.0.0.1:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Vary", "Origin");
}

export function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return parseJson(req.body);

  const chunks = [];

  for await (const chunk of req) {
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
