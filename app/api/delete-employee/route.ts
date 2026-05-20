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

  // Önce user_id'yi al (sonra auth'dan silmek için)
  const { data: empData } = await admin
    .from("employees")
    .select("user_id")
    .eq("id", employee_id)
    .single();

  // Randevuları sil
  await admin.from("appointments").delete().eq("employee_id", employee_id);

  // Working hours sil
  await admin.from("working_hours").delete().eq("employee_id", employee_id);

  // Blocked dates sil
  await admin.from("blocked_dates").delete().eq("employee_id", employee_id);

  // Personeli sil
  const { error } = await admin.from("employees").delete().eq("id", employee_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auth kullanıcısını sil
  if (empData?.user_id) {
    await admin.from("users").delete().eq("id", empData.user_id);
    await admin.auth.admin.deleteUser(empData.user_id);
  }

  return NextResponse.json({ success: true });
}
