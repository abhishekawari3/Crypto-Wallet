export const PORT = Number(process.env.PORT || 8787);
export const IS_PRODUCTION = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
export const TOKEN_SECRET = readTokenSecret();
export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "";
export const MONGODB_URI = readMongoUri();
export const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 1024 * 1024);

export const ASSETS = {
  BTCUSDT: { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  ETHUSDT: { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  SOLUSDT: { id: "solana", symbol: "SOL", name: "Solana" },
};

function readTokenSecret() {
  const secret = process.env.TOKEN_SECRET || "";

  if (IS_PRODUCTION && secret.length < 32) {
    throw new Error("TOKEN_SECRET must be set to at least 32 characters in production");
  }

  return secret || "dev-secret-change-this-before-production";
}

function readMongoUri() {
  const uri = process.env.MONGODB_URI || "";

  if (IS_PRODUCTION && !uri) {
    throw new Error("MONGODB_URI must be set in production");
  }

  return uri;
}
