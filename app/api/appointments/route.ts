import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bookingSchema = z.object({
  businessId: z.string().uuid(),
  serviceId: z.string().uuid(),
  employeeId: z.string().uuid(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(7),
  startsAt: z.string().datetime(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    const supabase = await createClient();

    const { data: service } = await supabase
      .from("services")
      .select("duration_minutes, price_cents")
      .eq("id", data.serviceId)
      .single();

    if (!service) {
      return NextResponse.json({ error: "Hizmet bulunamadı" }, { status: 404 });
    }

    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60 * 1000);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .upsert(
        { business_id: data.businessId, full_name: data.customerName, phone: data.customerPhone },
        { onConflict: "business_id,phone" },
      )
      .select("id")
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: "Müşteri oluşturulamadı" }, { status: 500 });
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        business_id: data.businessId,
        customer_id: customer.id,
        employee_id: data.employeeId,
        service_id: data.serviceId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        price_cents: service.price_cents,
        notes: data.notes ?? null,
      })
      .select("id")
      .single();

    if (appointmentError) {
      if (appointmentError.code === "23P01") {
        return NextResponse.json({ error: "Bu zaman diliminde çakışan bir randevu var" }, { status: 409 });
      }
      return NextResponse.json({ error: appointmentError.message }, { status: 500 });
    }

    await supabase.from("notifications").insert({
      business_id: data.businessId,
      appointment_id: appointment.id,
      kind: "appointment_created",
      channel: "in_app",
      payload: { customer_name: data.customerName, customer_phone: data.customerPhone },
    });

    return NextResponse.json({ id: appointment.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz veri", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const employeeId = url.searchParams.get("employee_id");

  let query = supabase
    .from("appointments")
    .select("*, customers(full_name, phone), services(name, color), employees(full_name)")
    .order("starts_at", { ascending: true });

  if (date) {
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;
    query = query.gte("starts_at", dayStart).lte("starts_at", dayEnd);
  }

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
