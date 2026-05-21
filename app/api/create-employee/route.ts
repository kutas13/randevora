import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

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
  const { full_name, title, phone, email, password, role, business_id: clientBusinessId } = body;

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "Ad, e-posta ve şifre gerekli." }, { status: 400 });
  }

  // Oturum açmış kullanıcıdan business_id'yi al (güvenlik için client'a güvenme)
  let business_id: string | null = null;
  try {
    const ssr = await createServerClient();
    const { data: { user } } = await ssr.auth.getUser();
    if (user) {
      const { data: profile } = await admin
        .from("users")
        .select("business_id, role")
        .eq("id", user.id)
        .single();
      if (profile?.business_id) {
        business_id = profile.business_id as string;
      }
    }
  } catch {
    // ignore, fallback to client value
  }

  // Fallback: oturumdan alınamadıysa client'tan gelen değeri kullan
  if (!business_id) business_id = clientBusinessId || null;

  if (!business_id) {
    return NextResponse.json({ error: "İşletme bilgisi bulunamadı. Lütfen tekrar giriş yapın." }, { status: 400 });
  }

  // İşletmenin gerçekten var olduğunu doğrula (FK constraint hatasını önlemek için)
  const { data: business, error: bizCheckErr } = await admin
    .from("businesses")
    .select("id, status")
    .eq("id", business_id)
    .maybeSingle();

  if (bizCheckErr) {
    return NextResponse.json({ error: "İşletme doğrulanamadı: " + bizCheckErr.message }, { status: 500 });
  }
  if (!business) {
    return NextResponse.json(
      { error: "İşletme kaydınız bulunamadı. Lütfen çıkış yapıp tekrar giriş yapın veya destek ile iletişime geçin." },
      { status: 400 },
    );
  }

  try {
    // 1. Aynı e-posta auth.users'da var mı?
    const { data: existing } = await admin.auth.admin.listUsers();
    const existingUser = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta zaten kullanımda." }, { status: 400 });
    }

    // 2. Auth kullanıcısı oluştur
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

    // 3. employees tablosuna ekle
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

    // 4. public.users tablosuna ekle (handle_new_user trigger devre dışı olabilir; upsert ile garanti)
    const { error: usrError } = await admin.from("users").upsert({
      id: userId,
      business_id,
      role: role === "admin" ? "admin" : "employee",
      full_name,
      email,
    });

    if (usrError) {
      // En kritik olan employees zaten oluştu; ama users yoksa login sonrası yönlendirme bozulur
      await admin.from("employees").delete().eq("id", employee.id);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Kullanıcı profili oluşturulamadı: " + usrError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, employee_id: employee.id, user_id: userId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
