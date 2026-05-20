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
    .select("id, name, category")
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
    .select("id, name, duration_minutes, price_cents, price_variable, color")
    .eq("business_id", business.id)
    .eq("active", true);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--panel)] to-[var(--background)] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-xl font-black text-white shadow-lg shadow-teal-600/25">
            {employee.full_name.charAt(0)}
          </span>
          <h1 className="mt-4 text-3xl font-black">{employee.full_name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{employee.title || "Personel"} · {business.name}</p>
        </div>

        <BookingForm
          businessId={business.id}
          services={services || []}
          employees={[]}
          fixedEmployeeId={employee.id}
        />
      </div>
    </main>
  );
}
