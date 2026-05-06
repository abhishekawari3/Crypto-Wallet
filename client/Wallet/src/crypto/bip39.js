import { pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";
import { sha512 } from "@noble/hashes/sha512";
import english from "bip39/src/wordlists/english.json";

const INVALID_MNEMONIC = "Invalid mnemonic";
const textEncoder = new TextEncoder();

export function generateMnemonic(strength = 128) {
  if (strength % 32 !== 0 || strength < 128 || strength > 256) {
    throw new TypeError("Entropy strength must be 128-256 bits and divisible by 32");
  }

  const entropy = new Uint8Array(strength / 8);
  crypto.getRandomValues(entropy);
  return entropyToMnemonic(entropy);
}

export function validateMnemonic(mnemonic) {
  try {
    mnemonicToEntropy(mnemonic);
    return true;
  } catch {
    return false;
  }
}

export async function mnemonicToSeed(mnemonic, password = "") {
  const normalizedMnemonic = normalize(mnemonic);
  const salt = `mnemonic${normalize(password)}`;

  return pbkdf2Async(sha512, textEncoder.encode(normalizedMnemonic), textEncoder.encode(salt), {
    c: 2048,
    dkLen: 64,
  });
}

function entropyToMnemonic(entropy) {
  const entropyBytes = toBytes(entropy);
  if (entropyBytes.length < 16 || entropyBytes.length > 32 || entropyBytes.length % 4 !== 0) {
    throw new TypeError("Invalid entropy");
  }

  const entropyBits = bytesToBinary(entropyBytes);
  const checksumBits = deriveChecksumBits(entropyBytes);
  const chunks = `${entropyBits}${checksumBits}`.match(/.{1,11}/g) || [];

  return chunks.map((binary) => english[parseInt(binary, 2)]).join(" ");
}

function mnemonicToEntropy(mnemonic) {
  const words = normalize(mnemonic).split(" ");
  if (words.length % 3 !== 0) throw new Error(INVALID_MNEMONIC);

  const bits = words
    .map((word) => {
      const index = english.indexOf(word);
      if (index === -1) throw new Error(INVALID_MNEMONIC);
      return index.toString(2).padStart(11, "0");
    })
    .join("");

  const dividerIndex = Math.floor(bits.length / 33) * 32;
  const entropyBits = bits.slice(0, dividerIndex);
  const checksumBits = bits.slice(dividerIndex);
  const entropy = Uint8Array.from(entropyBits.match(/.{1,8}/g).map((binary) => parseInt(binary, 2)));

  if (entropy.length < 16 || entropy.length > 32 || entropy.length % 4 !== 0) {
    throw new Error("Invalid entropy");
  }

  if (deriveChecksumBits(entropy) !== checksumBits) {
    throw new Error("Invalid mnemonic checksum");
  }

  return entropy;
}

function deriveChecksumBits(entropy) {
  return bytesToBinary(sha256(entropy)).slice(0, (entropy.length * 8) / 32);
}

function bytesToBinary(bytes) {
  return Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join("");
}

function normalize(value) {
  return String(value || "").normalize("NFKD").trim().toLowerCase().replace(/\s+/g, " ");
}

function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }

  throw new TypeError("Expected byte array");
}
