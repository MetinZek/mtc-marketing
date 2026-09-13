/**
 * Pure session-token crypto — no next/headers, no server-only, so it
 * runs in middleware (edge) as well as server actions / components.
 * Single-operator model: an HMAC-signed token with an expiry, keyed by
 * ADMIN_SESSION_SECRET. Passwords are checked against ADMIN_PASSWORD.
 */

export const SESSION_COOKIE = "mtc_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short — set 32+ random chars in .env.local.",
    );
  }
  return value;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Issue a signed session token valid for SESSION_TTL_SECONDS. */
export async function createSessionToken(): Promise<string> {
  const payload = b64urlEncode(
    encoder.encode(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
      }),
    ),
  );
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${b64urlEncode(new Uint8Array(sig))}`;
}

/** Verify a token's signature and that it has not expired. */
export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const key = await hmacKey();
  const ok = await crypto.subtle
    .verify("HMAC", key, b64urlDecode(sig), encoder.encode(payload))
    .catch(() => false);
  if (!ok) return false;

  try {
    const parsed = JSON.parse(decoder.decode(b64urlDecode(payload)));
    return (
      typeof parsed?.exp === "number" &&
      parsed.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

/** Constant-time comparison of a candidate password against ADMIN_PASSWORD. */
export async function passwordMatches(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set — add it to .env.local.");
  }
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const va = new Uint8Array(a);
  const vb = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < va.length; i += 1) diff |= (va[i] ?? 0) ^ (vb[i] ?? 0);
  return diff === 0;
}
