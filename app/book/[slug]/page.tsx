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
    .select("id, name, category, booking_window, slot_capacity")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!business) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents, price_variable, color")
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
    <main className="min-h-screen bg-gradient-to-b from-[var(--panel)] to-[var(--background)] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Randevora" className="mx-auto size-14 rounded-xl object-cover shadow-lg" />
          <h1 className="mt-4 text-3xl font-black">{business.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{business.category} · Online randevu al</p>
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
        />
      </div>
    </main>
  );
}
