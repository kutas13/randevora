"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

  // Kullanıcı rolünü kontrol et
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("role, business_id")
    .eq("id", data.user.id)
    .single();

  // Profil yoksa metadata'dan oluşturmayı dene
  if (userError || !user) {
    const meta = data.user.user_metadata;
    if (meta?.role === "super_admin") {
      redirect("/super-admin");
    }
    redirect(`/login?error=${encodeURIComponent("Kullanıcı profili bulunamadı. /api/setup adresini ziyaret edin.")}`);
  }

  // Super admin direkt panele
  if (user.role === "super_admin") {
    redirect("/super-admin");
  }

  // İşletme onay durumunu kontrol et
  if (user.business_id) {
    const { data: business } = await supabase
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

  const supabase = await createClient();

  // Slug benzersizliğini kontrol et
  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", values.slug)
    .single();

  if (existingBusiness) {
    redirect(`/register?error=${encodeURIComponent("Bu slug zaten kullanımda. Başka bir slug deneyin.")}`);
  }

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        business_name: values.businessName,
        business_slug: values.slug,
        category: values.category,
        role: "owner",
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/pending-approval");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
