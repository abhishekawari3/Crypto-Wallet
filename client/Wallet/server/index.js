import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { PORT } from "./config.js";
import { handleRequest } from "./app.js";
import { addPriceClient, startPriceService } from "./services/priceService.js";

const server = createServer(handleRequest);

const priceServer = new WebSocketServer({ server, path: "/prices" });
priceServer.on("connection", addPriceClient);

server.listen(PORT, () => {
  startPriceService();
  console.log(`NexaWallet backend running on http://localhost:${PORT}`);
  console.log(`Price websocket ready at ws://localhost:${PORT}/prices`);
});
