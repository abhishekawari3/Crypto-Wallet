import { marketSnapshot, refreshPricesFromRest } from "../services/priceService.js";
import { sendJson } from "../utils/http.js";

export async function handlePriceRoutes(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/prices") {
    await refreshPricesFromRest();
    sendJson(res, 200, { data: marketSnapshot() });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/health") {
    await refreshPricesFromRest();
    sendJson(res, 200, {
      ok: true,
      service: "NexaWallet API",
      prices: marketSnapshot(),
    });
    return true;
  }

  return false;
}
