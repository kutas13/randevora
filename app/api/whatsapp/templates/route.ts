import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { DEFAULT_TEMPLATES } from "@/lib/notifications/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveBusinessId(): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", user.id)
    .single();
  return profile?.business_id || null;
}

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  const businessId = await resolveBusinessId();
  if (!businessId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = adminClient();
  const { data } = await admin
    .from("business_message_templates")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  return NextResponse.json({
    customer_confirmation: data?.customer_confirmation || DEFAULT_TEMPLATES.customer_confirmation,
    customer_reminder_24h: data?.customer_reminder_24h || DEFAULT_TEMPLATES.customer_reminder_24h,
    customer_reminder_2h:
      data?.customer_reminder_2h || data?.customer_reminder_3h || DEFAULT_TEMPLATES.customer_reminder_2h,
    employee_new_booking: data?.employee_new_booking || DEFAULT_TEMPLATES.employee_new_booking,
    employee_reminder_24h: data?.employee_reminder_24h || DEFAULT_TEMPLATES.employee_reminder_24h,
    employee_reminder_2h: data?.employee_reminder_2h || DEFAULT_TEMPLATES.employee_reminder_2h,
  });
}

export async function PUT(request: NextRequest) {
  const businessId = await resolveBusinessId();
  if (!businessId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const fields = {
    customer_confirmation: typeof body.customer_confirmation === "string" ? body.customer_confirmation : null,
    customer_reminder_24h: typeof body.customer_reminder_24h === "string" ? body.customer_reminder_24h : null,
    customer_reminder_2h: typeof body.customer_reminder_2h === "string" ? body.customer_reminder_2h : null,
    employee_new_booking: typeof body.employee_new_booking === "string" ? body.employee_new_booking : null,
    employee_reminder_24h: typeof body.employee_reminder_24h === "string" ? body.employee_reminder_24h : null,
    employee_reminder_2h: typeof body.employee_reminder_2h === "string" ? body.employee_reminder_2h : null,
  };

  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== null && v.trim().length > 0) filtered[k] = v;
  }

  const admin = adminClient();
  const { error } = await admin.from("business_message_templates").upsert({
    business_id: businessId,
    ...filtered,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
