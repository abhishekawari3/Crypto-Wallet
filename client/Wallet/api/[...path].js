import { handleAuthRoutes } from "../server/routes/authRoutes.js";
import { handlePriceRoutes } from "../server/routes/priceRoutes.js";
import { handleWalletRoutes } from "../server/routes/walletRoutes.js";
import { sendJson, setCorsHeaders } from "../server/utils/http.js";

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);

    if (await handleAuthRoutes(req, res, url.pathname)) return;
    if (await handleWalletRoutes(req, res, url.pathname)) return;
    if (await handlePriceRoutes(req, res, url.pathname)) return;

    sendJson(res, 404, { error: "Route not found" });
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || "Server error" });
  }
}
