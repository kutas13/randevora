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
    .select("id, name, category")
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
    .select("id, full_name, title")
    .eq("business_id", business.id)
    .eq("active", true);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--panel)] to-[var(--background)] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Randevora" className="size-14 rounded-xl object-cover shadow-lg" />
          <h1 className="mt-4 text-3xl font-black">{business.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{business.category} · Online randevu al</p>
        </div>

        <BookingForm
          businessId={business.id}
          services={services || []}
          employees={employees || []}
          fixedEmployeeId={null}
        />
      </div>
    </main>
  );
}
