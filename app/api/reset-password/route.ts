import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { email, newPassword } = await request.json();

  if (!email || !newPassword) {
    return NextResponse.json({ error: "E-posta ve yeni şifre gerekli." }, { status: 400 });
  }

  // Kullanıcıyı email ile bul
  const { data: users, error: listErr } = await admin.auth.admin.listUsers();

  if (listErr) {
    return NextResponse.json({ error: "Kullanıcılar alınamadı." }, { status: 500 });
  }

  const user = users.users.find((u) => u.email === email);

  if (!user) {
    return NextResponse.json({ error: "Bu e-posta ile kayıtlı kullanıcı bulunamadı." }, { status: 404 });
  }

  // Şifreyi güncelle
  const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (updateErr) {
    return NextResponse.json({ error: "Şifre güncellenemedi: " + updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
