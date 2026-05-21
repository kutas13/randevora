import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { verifySaBypass } from "@/lib/sa-bypass";

const publicPaths = ["/", "/login", "/register", "/pending-approval", "/book", "/api", "/sa-login"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const superAdminKey = process.env.SUPER_ADMIN_KEY;

  const pathnameEarly = request.nextUrl.pathname;
  const saCookie = request.cookies.get("sa_bypass")?.value;
  const saBypass = verifySaBypass(saCookie, superAdminKey);

  if (saBypass && pathnameEarly.startsWith("/super-admin")) {
    return response;
  }

  if (saBypass && pathnameEarly === "/login") {
    return NextResponse.redirect(new URL("/super-admin", request.url));
  }

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isSlugPage = /^\/[a-z0-9-]+$/.test(pathname) && !pathname.startsWith("/dashboard") && !pathname.startsWith("/super-admin");

  if (isPublicPath || isSlugPage) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin client ile RLS bypass ederek kontrol et
  if (!serviceRoleKey) return response;
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await admin
    .from("users")
    .select("role, business_id")
    .eq("id", user.id)
    .single();

  // Super admin sayfası kontrolü
  if (pathname.startsWith("/super-admin")) {
    if (profile?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Dashboard kontrolü
  if (pathname.startsWith("/dashboard")) {
    if (profile?.role === "super_admin") {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }

    if (profile?.business_id) {
      const { data: business } = await admin
        .from("businesses")
        .select("status")
        .eq("id", profile.business_id)
        .single();

      if (business?.status !== "approved") {
        return NextResponse.redirect(new URL("/pending-approval", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
