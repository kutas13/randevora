import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { service_id } = await request.json();

  if (!service_id) {
    return NextResponse.json({ error: "service_id gerekli" }, { status: 400 });
  }

  // Bu hizmete bağlı randevuları sil
  await admin.from("appointments").delete().eq("service_id", service_id);

  // Hizmeti sil
  const { error } = await admin.from("services").delete().eq("id", service_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
