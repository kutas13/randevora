import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Service role key eksik" }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const body = await request.json();
  const { full_name, title, phone, email, password, role, business_id } = body;

  if (!email || !password || !full_name || !business_id) {
    return NextResponse.json({ error: "Ad, e-posta, şifre ve işletme bilgisi gerekli." }, { status: 400 });
  }

  try {
    // 1. Auth kullanıcısı oluştur
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name, business_id },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authUser.user.id;

    // 2. employees tablosuna ekle
    const { data: employee, error: empError } = await admin.from("employees").insert({
      business_id,
      user_id: userId,
      full_name,
      title,
      phone,
      email,
      role: role === "admin" ? "admin" : "employee",
    }).select("id").single();

    if (empError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Çalışan kaydı oluşturulamadı: " + empError.message }, { status: 500 });
    }

    // 3. public.users tablosuna ekle (login sonrası yönlendirme için)
    await admin.from("users").insert({
      id: userId,
      business_id,
      role: role === "admin" ? "admin" : "employee",
      full_name,
      email,
    });

    return NextResponse.json({ success: true, employee_id: employee.id, user_id: userId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
