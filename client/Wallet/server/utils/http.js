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
