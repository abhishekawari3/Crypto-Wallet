import { marketSnapshot } from "../services/priceService.js";
import { sendJson } from "../utils/http.js";

export function handlePriceRoutes(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/prices") {
    sendJson(res, 200, { data: marketSnapshot() });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      service: "NexaWallet API",
      prices: marketSnapshot(),
    });
    return true;
  }

  return false;
}
