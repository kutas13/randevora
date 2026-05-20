import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/booking";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const employeeId = url.searchParams.get("employee_id");
  const date = url.searchParams.get("date");
  const durationMinutes = Number(url.searchParams.get("duration") || "30");

  if (!employeeId || !date) {
    return NextResponse.json({ error: "employee_id ve date parametreleri gerekli" }, { status: 400 });
  }

  const supabase = await createClient();

  const dayStart = `${date}T00:00:00`;
  const dayEnd = `${date}T23:59:59`;

  const { data: existingAppointments } = await supabase
    .from("appointments")
    .select("starts_at, ends_at")
    .eq("employee_id", employeeId)
    .gte("starts_at", dayStart)
    .lte("starts_at", dayEnd)
    .in("status", ["pending", "confirmed"]);

  const { data: workingHours } = await supabase
    .from("working_hours")
    .select("starts_at, ends_at")
    .eq("employee_id", employeeId)
    .eq("weekday", new Date(date).getDay());

  const workStart = workingHours?.[0]?.starts_at ?? "09:00";
  const workEnd = workingHours?.[0]?.ends_at ?? "18:00";

  const busy = (existingAppointments || []).map((a) => ({
    startsAt: new Date(a.starts_at).toTimeString().slice(0, 5),
    endsAt: new Date(a.ends_at).toTimeString().slice(0, 5),
  }));

  const { data: blockedDates } = await supabase
    .from("blocked_dates")
    .select("starts_at, ends_at")
    .eq("employee_id", employeeId)
    .lte("starts_at", dayEnd)
    .gte("ends_at", dayStart);

  if (blockedDates && blockedDates.length > 0) {
    return NextResponse.json({ slots: [], blocked: true });
  }

  const slots = getAvailableSlots({
    workStart,
    workEnd,
    durationMinutes,
    busy,
    stepMinutes: 15,
  });

  return NextResponse.json({ slots, blocked: false });
}
