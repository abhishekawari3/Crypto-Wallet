export const PORT = Number(process.env.PORT || 8787);
export const TOKEN_SECRET = process.env.TOKEN_SECRET || "dev-secret-change-this-before-production";
export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CLIENT_ORIGINS = new Set([
  process.env.CLIENT_ORIGIN,
  "https://crypto-wallet-six-mu.vercel.app",
].filter(Boolean));

export const ASSETS = {
  BTCUSDT: { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  ETHUSDT: { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  SOLUSDT: { id: "solana", symbol: "SOL", name: "Solana" },
};
