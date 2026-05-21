import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking/booking-form";

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, duration_max_minutes, price_cents, price_max_cents, price_variable, deposit_cents, latest_booking_time, color")
    .eq("business_id", business.id)
    .eq("active", true);

  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, title, role")
    .eq("business_id", business.id)
    .eq("active", true);

  // Admin/owner'ı da listeye ekle (employees tablosunda yoksa users'dan çek)
  const allStaff = [...(employees || [])];
  const { data: owner } = await supabase
    .from("users")
    .select("id, full_name, role")
    .eq("business_id", business.id)
    .in("role", ["owner", "admin"]);

  if (owner) {
    for (const o of owner) {
      const alreadyInList = allStaff.some((e) => e.full_name === o.full_name);
      if (!alreadyInList) {
        // Owner'ı employees'e ekleyelim (varsa zaten orada)
        const { data: ownerEmp } = await supabase
          .from("employees")
          .select("id")
          .eq("business_id", business.id)
          .eq("user_id", o.id)
          .single();
        if (ownerEmp) {
          // Zaten employees'de var ama active=false olabilir
        } else {
          // Owner'ı employees tablosuna ekle
          const { data: newEmp } = await supabase
            .from("employees")
            .insert({ business_id: business.id, user_id: o.id, full_name: o.full_name, title: "Yönetici", role: o.role, active: true })
            .select("id, full_name, title, role")
            .single();
          if (newEmp) allStaff.unshift(newEmp);
        }
      }
    }
  }

  // Çalışma saatlerini çek
  const { data: workingHours } = await supabase
    .from("working_hours")
    .select("employee_id, weekday, starts_at, ends_at")
    .in("employee_id", allStaff.map((e) => e.id));

  // İzinli günleri çek (bu hafta)
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  
  const { data: blockedDates } = await supabase
    .from("blocked_dates")
    .select("employee_id, starts_at, ends_at, reason, recurring")
    .eq("business_id", business.id);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(176,124,79,0.18),transparent_60%)]" />

      <div className="relative mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="relative mx-auto inline-flex">
            <span className="absolute inset-0 rounded-2xl bg-[var(--accent)]/20 blur-xl" />
            <img
              src="/logo.png"
              alt="Randevora"
              className="relative size-16 rounded-2xl object-cover shadow-xl ring-1 ring-[var(--line)]"
            />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">{business.name}</h1>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[12px] font-medium text-[var(--muted)]">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {business.category} · Online randevu
          </p>
        </div>

        <BookingForm
          businessId={business.id}
          services={services || []}
          employees={allStaff}
          fixedEmployeeId={null}
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
