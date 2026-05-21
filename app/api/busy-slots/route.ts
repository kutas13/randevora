import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Anon kullanıcılar (public booking) randevu çakışmalarını görmek zorunda.
// RLS'i sıkılaştırdığımız için bu endpoint admin client ile sadece dolu saatleri (HH:00) döner.
// Kişisel veri sızmaz.
export async function POST(request: NextRequest) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { employeeId, date, slotCapacity } = await request.json();

  if (!employeeId || !date) {
    return NextResponse.json({ error: "employeeId ve date gerekli" }, { status: 400 });
  }

  const capacity = Math.max(1, Number(slotCapacity) || 1);

  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59`;

  const { data, error } = await admin
    .from("appointments")
    .select("starts_at, ends_at, employee_id")
    .eq("employee_id", employeeId)
    .gte("starts_at", start)
    .lte("starts_at", end)
    .in("status", ["pending", "confirmed"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const countByHour: Record<string, number> = {};
  (data || []).forEach((a) => {
    const s = new Date(a.starts_at);
    const e = new Date(a.ends_at);
    let current = new Date(s);
    while (current < e) {
      const hour = `${String(current.getHours()).padStart(2, "0")}:00`;
      countByHour[hour] = (countByHour[hour] || 0) + 1;
      current = new Date(current.getTime() + 60 * 60 * 1000);
    }
  });

  const busy = Object.entries(countByHour)
    .filter(([, count]) => count >= capacity)
    .map(([hour]) => hour);

  return NextResponse.json({ busy });
}
