"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  businessName: z.string().min(2),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  category: z.string().optional(),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent("Geçerli e-posta ve şifre girin.")}`);
  }

  const values = parsed.data;
  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword(values);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Admin client ile sorgula (RLS bypass)
  const admin = createAdminClient();

  const { data: user } = await admin
    .from("users")
    .select("role, business_id")
    .eq("id", data.user.id)
    .single();

  // Profil yoksa oluştur
  if (!user) {
    const meta = data.user.user_metadata;
    const role = meta?.role === "super_admin" ? "super_admin" : "owner";

    await admin.from("users").upsert({
      id: data.user.id,
      role,
      full_name: meta?.full_name || meta?.business_name || "User",
      email: data.user.email,
      business_id: null,
    });

    if (role === "super_admin") {
      redirect("/super-admin");
    }
    redirect("/dashboard");
  }

  // Super admin direkt panele
  if (user.role === "super_admin") {
    redirect("/super-admin");
  }

  // İşletme onay durumunu kontrol et
  if (user.business_id) {
    const { data: business } = await admin
      .from("businesses")
      .select("status")
      .eq("id", user.business_id)
      .single();

    if (business?.status === "pending") {
      await supabase.auth.signOut();
      redirect(`/login?error=${encodeURIComponent("İşletmeniz henüz onay bekliyor. Super admin onayı sonrası giriş yapabilirsiniz.")}`);
    }

    if (business?.status === "rejected") {
      await supabase.auth.signOut();
      redirect(`/login?error=${encodeURIComponent("İşletme başvurunuz reddedildi.")}`);
    }

    if (business?.status === "suspended") {
      await supabase.auth.signOut();
      redirect(`/login?error=${encodeURIComponent("İşletmeniz askıya alındı.")}`);
    }
  }

  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const values = registerSchema.parse({
    businessName: formData.get("businessName"),
    slug: formData.get("slug"),
    email: formData.get("email"),
    password: formData.get("password"),
    category: formData.get("category") || "small_business",
  });

  const admin = createAdminClient();

  // Slug benzersizliğini kontrol et
  const { data: existingBusiness } = await admin
    .from("businesses")
    .select("id")
    .eq("slug", values.slug)
    .single();

  if (existingBusiness) {
    redirect(`/register?error=${encodeURIComponent("Bu slug zaten kullanımda. Başka bir slug deneyin.")}`);
  }

  // Admin API ile kullanıcı oluştur (trigger'a bağımlı değil)
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: values.email,
    password: values.password,
    email_confirm: true,
    user_metadata: {
      business_name: values.businessName,
      business_slug: values.slug,
      category: values.category,
      role: "owner",
    },
  });

  if (createError) {
    redirect(`/register?error=${encodeURIComponent(createError.message)}`);
  }

  const userId = newUser.user.id;

  // İşletmeyi oluştur (status: pending)
  const { data: business, error: bizError } = await admin
    .from("businesses")
    .insert({
      owner_id: userId,
      name: values.businessName,
      slug: values.slug,
      category: values.category,
      status: "pending",
    })
    .select("id")
    .single();

  if (bizError) {
    redirect(`/register?error=${encodeURIComponent(bizError.message)}`);
  }

  // Kullanıcı profilini oluştur
  await admin.from("users").insert({
    id: userId,
    business_id: business.id,
    role: "owner",
    full_name: values.businessName,
    email: values.email,
  });

  // Abonelik oluştur
  await admin.from("subscriptions").insert({
    business_id: business.id,
    plan: "free",
    status: "active",
  });

  redirect("/pending-approval");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
