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
    .select("id, name, duration_minutes, duration_max_minutes, price_cents, price_max_cents, price_variable, color")
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--panel)] to-[var(--background)] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Randevora" className="mx-auto size-14 rounded-xl object-cover shadow-lg" />
          <h1 className="mt-4 text-3xl font-black">{employee.full_name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{employee.title || "Personel"} · {business.name}</p>
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
      </div>
    </main>
  );
}
