"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function normalizeSlug(val: string) {
  return val
    .toLowerCase()
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ö/g, "o").replace(/ç/g, "c").replace(/ı/g, "i")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2),
  businessName: z.string().min(2),
  slug: z.string().min(1).transform(normalizeSlug).pipe(z.string().min(3, "Slug en az 3 karakter olmalı")),
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
  let redirectUrl = "/pending-approval";

  try {
    const values = registerSchema.parse({
      fullName: formData.get("fullName"),
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
      redirectUrl = `/register?error=${encodeURIComponent("Bu slug zaten kullanımda. Başka bir slug deneyin.")}`;
      redirect(redirectUrl);
    }

    // Bu e-posta zaten auth.users'da var mi? (yetim kayit kontrolu)
    const { data: usersList } = await admin.auth.admin.listUsers();
    const existingAuthUser = usersList?.users.find((u) => u.email?.toLowerCase() === values.email.toLowerCase());

    let userId: string;

    if (existingAuthUser) {
      // public.users'da kaydi var mi?
      const { data: existingProfile } = await admin
        .from("users")
        .select("id, role, business_id")
        .eq("id", existingAuthUser.id)
        .maybeSingle();

      // Super admin ise asla silme/dokunma
      if (existingProfile?.role === "super_admin") {
        redirectUrl = `/register?error=${encodeURIComponent("Bu e-posta sistem yöneticisine ait. Farklı bir e-posta deneyin.")}`;
        redirect(redirectUrl);
      }

      // Onayli/bekleyen isletmesi var mi?
      let hasActiveBusiness = false;
      if (existingProfile?.business_id) {
        const { data: biz } = await admin.from("businesses").select("id, status").eq("id", existingProfile.business_id).maybeSingle();
        if (biz && biz.status !== "rejected") hasActiveBusiness = true;
      }

      if (hasActiveBusiness) {
        redirectUrl = `/register?error=${encodeURIComponent("Bu e-posta zaten kayıtlı. Lütfen giriş yapın veya farklı bir e-posta kullanın.")}`;
        redirect(redirectUrl);
      }

      // Yetim kayit: temizle ve sifresini guncelle
      await admin.from("employees").delete().eq("user_id", existingAuthUser.id);
      await admin.from("users").delete().eq("id", existingAuthUser.id);

      const { error: updateErr } = await admin.auth.admin.updateUserById(existingAuthUser.id, {
        password: values.password,
        email_confirm: true,
        user_metadata: {
          full_name: values.fullName,
          business_name: values.businessName,
          business_slug: values.slug,
          category: values.category,
          role: "owner",
        },
      });

      if (updateErr) {
        redirectUrl = `/register?error=${encodeURIComponent(updateErr.message)}`;
        redirect(redirectUrl);
      }

      userId = existingAuthUser.id;
    } else {
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true,
        user_metadata: {
          full_name: values.fullName,
          business_name: values.businessName,
          business_slug: values.slug,
          category: values.category,
          role: "owner",
        },
      });

      if (createError || !newUser?.user) {
        redirectUrl = `/register?error=${encodeURIComponent(createError?.message || "Kullanıcı oluşturulamadı.")}`;
        redirect(redirectUrl);
      }

      userId = newUser.user.id;
    }

    // İşletmeyi oluştur (status: pending)
    const { data: business, error: bizError } = await admin
      .from("businesses")
      .insert({
        owner_id: userId,
        name: values.businessName,
        slug: values.slug,
        category: values.category,
        status: "pending",
        plan: "starter",
      })
      .select("id")
      .single();

    if (bizError || !business) {
      // Yeni olusturulan user'i geri al (orphan birakma)
      try { await admin.auth.admin.deleteUser(userId); } catch {}
      redirectUrl = `/register?error=${encodeURIComponent(bizError?.message || "İşletme oluşturulamadı.")}`;
      redirect(redirectUrl);
    }

    // Kullanıcı profilini upsert et (mevcut id ile cakisma olmasin)
    const { error: userInsertErr } = await admin.from("users").upsert({
      id: userId,
      business_id: business.id,
      role: "owner",
      full_name: values.fullName,
      email: values.email,
    }, { onConflict: "id" });

    if (userInsertErr) {
      try { await admin.from("businesses").delete().eq("id", business.id); } catch {}
      try { await admin.auth.admin.deleteUser(userId); } catch {}
      redirectUrl = `/register?error=${encodeURIComponent(userInsertErr.message)}`;
      redirect(redirectUrl);
    }

    // Employee kaydı oluştur (owner = admin personel olarak da geçer)
    await admin.from("employees").insert({
      business_id: business.id,
      user_id: userId,
      full_name: values.fullName,
      role: "admin",
      active: true,
    });

  } catch (e: any) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    let msg = "Bir hata oluştu.";
    if (e?.issues) {
      msg = e.issues.map((i: any) => i.message).join(", ");
    } else if (e?.message) {
      msg = e.message;
    }
    redirectUrl = `/register?error=${encodeURIComponent(msg)}`;
  }

  redirect(redirectUrl);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
