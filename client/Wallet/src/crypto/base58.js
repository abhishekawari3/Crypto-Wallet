const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE = ALPHABET.length;
const LOOKUP = new Map([...ALPHABET].map((char, index) => [char, index]));

export function encodeBase58(bytes) {
  const source = toBytes(bytes);
  if (source.length === 0) return "";

  let zeroes = 0;
  while (zeroes < source.length && source[zeroes] === 0) zeroes += 1;

  const digits = [0];
  for (let i = zeroes; i < source.length; i += 1) {
    let carry = source[i];

    for (let j = 0; j < digits.length; j += 1) {
      carry += digits[j] << 8;
      digits[j] = carry % BASE;
      carry = Math.floor(carry / BASE);
    }

    while (carry > 0) {
      digits.push(carry % BASE);
      carry = Math.floor(carry / BASE);
    }
  }

  return `${ALPHABET[0].repeat(zeroes)}${digits.reverse().map((digit) => ALPHABET[digit]).join("")}`;
}

export function decodeBase58(value) {
  if (typeof value !== "string") throw new TypeError("Expected base58 string");
  if (value.length === 0) return new Uint8Array();

  let zeroes = 0;
  while (zeroes < value.length && value[zeroes] === ALPHABET[0]) zeroes += 1;

  const bytes = [0];
  for (let i = zeroes; i < value.length; i += 1) {
    const digit = LOOKUP.get(value[i]);
    if (digit === undefined) throw new Error("Invalid base58 character");

    let carry = digit;
    for (let j = 0; j < bytes.length; j += 1) {
      carry += bytes[j] * BASE;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }

    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  return Uint8Array.from([...Array(zeroes).fill(0), ...bytes.reverse()]);
}

function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }

  throw new TypeError("Expected byte array");
}
