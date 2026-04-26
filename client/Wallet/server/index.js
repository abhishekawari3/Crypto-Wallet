import { createServer } from "node:http";
import ws from "ws";
import { PORT } from "./config.js";
import { handleAuthRoutes } from "./routes/authRoutes.js";
import { handlePriceRoutes } from "./routes/priceRoutes.js";
import { handleWalletRoutes } from "./routes/walletRoutes.js";
import { addPriceClient, startPriceService } from "./services/priceService.js";
import { sendJson, setCorsHeaders } from "./utils/http.js";

const WebSocketServer = ws.Server;

const server = createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (await handleAuthRoutes(req, res, url.pathname)) return;
    if (await handleWalletRoutes(req, res, url.pathname)) return;
    if (handlePriceRoutes(req, res, url.pathname)) return;

    sendJson(res, 404, { error: "Route not found" });
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || "Server error" });
  }
});

const priceServer = new WebSocketServer({ server, path: "/prices" });
priceServer.on("connection", addPriceClient);

server.listen(PORT, () => {
  startPriceService();
  console.log(`NexaWallet backend running on http://localhost:${PORT}`);
  console.log(`Price websocket ready at ws://localhost:${PORT}/prices`);
});
