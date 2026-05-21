import { handleAuthRoutes } from "./routes/authRoutes.js";
import { handlePriceRoutes } from "./routes/priceRoutes.js";
import { handleWalletRoutes } from "./routes/walletRoutes.js";
import { sendJson, sendNoContent } from "./utils/http.js";

export async function handleRequest(req, res) {
  try {
    if (req.method === "OPTIONS") {
      sendNoContent(res);
      return;
    }

    const url = new URL(req.url || "/", getRequestOrigin(req));

    if (await handleAuthRoutes(req, res, url.pathname)) return;
    if (await handleWalletRoutes(req, res, url.pathname)) return;
    if (await handlePriceRoutes(req, res, url.pathname)) return;

    sendJson(res, 404, { error: "Route not found" });
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    const message = status >= 500 ? "Server error" : error.message;
    sendJson(res, status, { error: message || "Server error" });
  }
}

function getRequestOrigin(req) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  return `${protocol}://${host}`;
}
