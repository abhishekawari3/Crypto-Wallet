import { CLIENT_ORIGINS } from "../config.js";

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGINS.has(origin) ? origin : "http://127.0.0.1:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

export function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

export async function readBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function cleanEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function cleanText(value) {
  return String(value || "").trim();
}
