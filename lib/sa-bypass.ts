import crypto from "crypto";

export function verifySaBypass(cookieValue: string | undefined, secret: string | undefined): boolean {
  if (!cookieValue || !secret || secret.length < 8) return false;

  const parts = cookieValue.split(":");
  if (parts.length !== 3) return false;
  const [scope, issued, sig] = parts;
  if (scope !== "super-admin") return false;

  const issuedMs = Number(issued);
  if (!Number.isFinite(issuedMs)) return false;

  const maxAgeMs = 1000 * 60 * 60 * 24 * 7;
  if (Date.now() - issuedMs > maxAgeMs) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${scope}:${issued}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
