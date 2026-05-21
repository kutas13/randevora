// Edge Runtime uyumlu HMAC imzalama / dogrulama (Web Crypto API)

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const len = hex.length / 2;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signSaBypass(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return bufToHex(sig);
}

export async function verifySaBypass(
  cookieValue: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!cookieValue || !secret || secret.length < 8) return false;

  const parts = cookieValue.split(":");
  if (parts.length !== 3) return false;
  const [scope, issued, sig] = parts;
  if (scope !== "super-admin") return false;

  const issuedMs = Number(issued);
  if (!Number.isFinite(issuedMs)) return false;

  const maxAgeMs = 1000 * 60 * 60 * 24 * 7;
  if (Date.now() - issuedMs > maxAgeMs) return false;

  let expected: string;
  try {
    expected = await signSaBypass(`${scope}:${issued}`, secret);
  } catch {
    return false;
  }

  try {
    return timingSafeEqual(hexToBytes(sig), hexToBytes(expected));
  } catch {
    return false;
  }
}
