export const PORT = Number(process.env.PORT || 8787);
export const TOKEN_SECRET = process.env.TOKEN_SECRET || "dev-secret-change-this-before-production";
export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const CLIENT_ORIGINS = new Set([
  ...String(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  "https://crypto-wallet-six-mu.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean));

export const ASSETS = {
  BTCUSDT: { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  ETHUSDT: { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  SOLUSDT: { id: "solana", symbol: "SOL", name: "Solana" },
};
