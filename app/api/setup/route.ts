import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPER_ADMIN_EMAIL = "gmyusuf13@gmail.com";
const SUPER_ADMIN_PASSWORD = "47504750Ff*";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY eksik!" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // 1. Mevcut kullanıcıyı kontrol et
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === SUPER_ADMIN_EMAIL
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Şifreyi güncelle ve email'i onayla
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: SUPER_ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { role: "super_admin", full_name: "Super Admin" },
      });

      if (updateError) {
        return NextResponse.json(
          { error: `Güncelleme hatası: ${updateError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Yeni kullanıcı oluştur
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { role: "super_admin", full_name: "Super Admin" },
        });

      if (createError) {
        return NextResponse.json(
          {
            error: `Kullanıcı oluşturulamadı: ${createError.message}`,
            hint: "schema.sql'i Supabase SQL Editor'de çalıştırın. Trigger sorun çıkarıyor olabilir.",
          },
          { status: 500 }
        );
      }
      userId = newUser.user.id;
    }

    // 2. public.users tablosuna super admin olarak ekle
    const { error: upsertError } = await supabase.from("users").upsert(
      {
        id: userId,
        role: "super_admin",
        full_name: "Super Admin",
        email: SUPER_ADMIN_EMAIL,
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      return NextResponse.json({
        partial: true,
        message: `Auth kullanıcısı tamam ama public.users hatası: ${upsertError.message}. schema.sql çalıştırılmamış olabilir.`,
        userId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Super admin hazır! /login sayfasından giriş yapabilirsiniz.",
      email: SUPER_ADMIN_EMAIL,
      userId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
