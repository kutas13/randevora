import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking/booking-form";

export default async function EmployeeBookingPage({ params }: { params: Promise<{ slug: string; employeeId: string }> }) {
  const { slug, employeeId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, category, booking_window, slot_capacity, slot_merge")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!business) notFound();

  const { data: employee } = await supabase
    .from("employees")
    .select("id, full_name, title")
    .eq("id", employeeId)
    .eq("business_id", business.id)
    .eq("active", true)
    .single();

  if (!employee) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, duration_max_minutes, price_cents, price_max_cents, price_variable, deposit_cents, latest_booking_time, color")
    .eq("business_id", business.id)
    .eq("active", true);

  const { data: workingHours } = await supabase
    .from("working_hours")
    .select("employee_id, weekday, starts_at, ends_at")
    .eq("employee_id", employee.id);

  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

  const { data: blockedDates } = await supabase
    .from("blocked_dates")
    .select("employee_id, starts_at, ends_at, reason, recurring")
    .eq("employee_id", employee.id);

  const initials = (employee.full_name || "?")
    .split(" ")
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase() || "")
    .join("");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(176,124,79,0.18),transparent_60%)]" />

      <div className="relative mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="relative mx-auto inline-flex">
            <span className="absolute inset-0 rounded-full bg-[var(--accent)]/20 blur-xl" />
            <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#b07c4f] to-[#d4956a] text-2xl font-black text-white shadow-xl ring-2 ring-white/40">
              {initials}
            </div>
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">{employee.full_name}</h1>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[12px] font-medium text-[var(--muted)]">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {employee.title || "Personel"} · {business.name}
          </p>
        </div>

        <BookingForm
          businessId={business.id}
          services={services || []}
          employees={[]}
          fixedEmployeeId={employee.id}
          workingHours={workingHours || []}
          blockedDates={blockedDates || []}
          bookingWindow={business.booking_window || "weekly"}
          slotCapacity={business.slot_capacity || 1}
          slotMerge={business.slot_merge !== false}
        />

        <p className="mt-8 text-center text-[11px] text-[var(--muted)]">
          <a href="/" className="underline hover:text-[var(--foreground)]">Randevora</a> ile güvenle randevu alın
        </p>
      </div>
    </main>
  );
}
