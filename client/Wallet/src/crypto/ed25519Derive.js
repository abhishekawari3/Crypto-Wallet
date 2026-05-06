const HARDENED_OFFSET = 0x80000000;
const MASTER_KEY = new TextEncoder().encode("ed25519 seed");

export async function deriveEd25519Path(path, seed) {
  const segments = parsePath(path);
  let { key, chainCode } = await hmacSha512(MASTER_KEY, toBytes(seed));

  for (const segment of segments) {
    const data = new Uint8Array(1 + key.length + 4);
    data[0] = 0;
    data.set(key, 1);
    writeUint32(data, 1 + key.length, segment + HARDENED_OFFSET);

    ({ key, chainCode } = await hmacSha512(chainCode, data));
  }

  return { key, chainCode };
}

function parsePath(path) {
  if (!/^m(\/[0-9]+')+$/.test(path)) {
    throw new Error("Only hardened ed25519 derivation paths are supported");
  }

  return path
    .split("/")
    .slice(1)
    .map((part) => Number(part.slice(0, -1)));
}

async function hmacSha512(keyBytes, dataBytes) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, dataBytes));

  return {
    key: digest.slice(0, 32),
    chainCode: digest.slice(32),
  };
}

function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value?.buffer instanceof ArrayBuffer) {
    return new Uint8Array(value.buffer, value.byteOffset || 0, value.byteLength);
  }

  throw new TypeError("Seed must be a byte array");
}

function writeUint32(bytes, offset, value) {
  bytes[offset] = value >>> 24;
  bytes[offset + 1] = value >>> 16;
  bytes[offset + 2] = value >>> 8;
  bytes[offset + 3] = value;
}
