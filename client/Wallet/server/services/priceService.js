import WebSocket from "ws";
import { ASSETS } from "../config.js";

const clients = new Set();
const prices = new Map();
let upstream = null;
let reconnectTimer = null;

export function addPriceClient(client) {
  clients.add(client);
  send(client, { type: "status", status: upstream?.readyState === WebSocket.OPEN ? "live" : "connecting" });
  send(client, { type: "snapshot", data: marketSnapshot() });

  client.on("close", () => {
    clients.delete(client);
  });
}

export function startPriceService() {
  connectPriceStream();
  refreshPricesFromRest();
  setInterval(refreshPricesFromRest, 15000).unref?.();
}

export function marketSnapshot() {
  return Object.values(ASSETS).map((asset) => prices.get(asset.id) || { ...asset, price: null, change24h: null, updatedAt: null });
}

function connectPriceStream() {
  if (process.env.DISABLE_PRICE_WS === "true") return;

  clearTimeout(reconnectTimer);
  const streams = "btcusdt@ticker/ethusdt@ticker/solusdt@ticker";
  upstream = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  upstream.on("open", () => {
    broadcast({ type: "status", status: "live" });
  });

  upstream.on("message", (message) => {
    let payload;
    try {
      payload = JSON.parse(message.toString());
    } catch {
      return;
    }
    const ticker = payload.data;
    const meta = ASSETS[ticker?.s];

    if (!meta) return;

    const update = {
      ...meta,
      price: Number(ticker.c),
      change24h: Number(ticker.P),
      updatedAt: new Date().toISOString(),
    };

    prices.set(meta.id, update);
    broadcast({ type: "prices", data: [update] });
  });

  upstream.on("close", scheduleReconnect);
  upstream.on("error", scheduleReconnect);
}

function scheduleReconnect() {
  if (upstream?.readyState === WebSocket.OPEN) {
    upstream.close();
  }

  broadcast({ type: "status", status: "reconnecting" });
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connectPriceStream, 3000);
}

export async function refreshPricesFromRest() {
  try {
    const symbols = encodeURIComponent(JSON.stringify(Object.keys(ASSETS)));
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`);
    if (!response.ok) throw new Error("Price REST fallback failed");

    const data = await response.json();
    const now = new Date().toISOString();
    const updates = data
      .map((ticker) => {
        const meta = ASSETS[ticker.symbol];
        if (!meta) return null;

        return {
          ...meta,
          price: Number(ticker.lastPrice),
          change24h: Number(ticker.priceChangePercent),
          updatedAt: now,
        };
      })
      .filter(Boolean);

    for (const update of updates) {
      prices.set(update.id, update);
    }

    if (updates.length) {
      broadcast({ type: "prices", data: updates });
    }
  } catch {
    broadcast({ type: "status", status: upstream?.readyState === WebSocket.OPEN ? "live" : "reconnecting" });
  }
}

function send(client, payload) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(payload));
  }
}

function broadcast(payload) {
  for (const client of clients) {
    send(client, payload);
  }
}
