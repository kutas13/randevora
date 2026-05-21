import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { employee_id } = await request.json();

  if (!employee_id) {
    return NextResponse.json({ error: "employee_id gerekli" }, { status: 400 });
  }

  // Çalışan bilgisi (user_id ve role)
  const { data: empData, error: empFetchErr } = await admin
    .from("employees")
    .select("id, user_id, role, business_id")
    .eq("id", employee_id)
    .single();

  if (empFetchErr || !empData) {
    return NextResponse.json({ error: "Çalışan bulunamadı." }, { status: 404 });
  }

  // İşletme sahibinin (owner) silinmesini engelle
  if (empData.user_id) {
    const { data: ownerCheck } = await admin
      .from("businesses")
      .select("id")
      .eq("id", empData.business_id)
      .eq("owner_id", empData.user_id)
      .maybeSingle();

    if (ownerCheck) {
      return NextResponse.json(
        { error: "İşletme sahibi (owner) silinemez. Önce işletmeyi devretmelisiniz." },
        { status: 400 },
      );
    }
  }

  // 1) İlişkili tüm randevuları sil (FK on delete restrict olduğu için zorunlu)
  const { error: aptErr } = await admin.from("appointments").delete().eq("employee_id", employee_id);
  if (aptErr) {
    return NextResponse.json({ error: "Randevular silinemedi: " + aptErr.message }, { status: 500 });
  }

  // 2) Çalışma saatleri
  await admin.from("working_hours").delete().eq("employee_id", employee_id);

  // 3) İzin/blok kayıtları
  await admin.from("blocked_dates").delete().eq("employee_id", employee_id);

  // 4) employees tablosundan sil
  const { error: delErr } = await admin.from("employees").delete().eq("id", employee_id);
  if (delErr) {
    return NextResponse.json({ error: "Çalışan silinemedi: " + delErr.message }, { status: 500 });
  }

  // 5) public.users ve auth.users kaydını sil (varsa)
  if (empData.user_id) {
    // Aynı user_id farklı bir employees satırına bağlı değilse auth'tan sil
    const { data: stillReferenced } = await admin
      .from("employees")
      .select("id")
      .eq("user_id", empData.user_id)
      .limit(1);

    if (!stillReferenced || stillReferenced.length === 0) {
      await admin.from("users").delete().eq("id", empData.user_id);
      // auth.users -> on delete cascade ile public.users zaten silinir
      await admin.auth.admin.deleteUser(empData.user_id);
    }
  }

  return NextResponse.json({ success: true });
}
