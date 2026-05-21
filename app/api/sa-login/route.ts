import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function POST(req: NextRequest) {
  const key = process.env.SUPER_ADMIN_KEY;
  if (!key || key.length < 8) {
    return NextResponse.json({ error: "Sunucuda SUPER_ADMIN_KEY tanimli degil." }, { status: 500 });
  }

  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {}

  if (!body.password || body.password !== key) {
    return NextResponse.json({ error: "Anahtar dogru degil." }, { status: 401 });
  }

  const issued = Date.now().toString();
  const payload = `super-admin:${issued}`;
  const sig = sign(payload, key);
  const cookieValue = `${payload}:${sig}`;

  const res = NextResponse.json({ ok: true });
  res.cookies.set("sa_bypass", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sa_bypass", "", { path: "/", maxAge: 0 });
  return res;
}
