import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { verifySaBypass } from "@/lib/sa-bypass";

const publicPaths = ["/", "/login", "/register", "/pending-approval", "/book", "/api", "/sa-login"];

async function safeMiddleware(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const superAdminKey = process.env.SUPER_ADMIN_KEY;

  const pathname = request.nextUrl.pathname;
  const saCookie = request.cookies.get("sa_bypass")?.value;

  let saBypass = false;
  if (saCookie && superAdminKey) {
    try {
      saBypass = await verifySaBypass(saCookie, superAdminKey);
    } catch {
      saBypass = false;
    }
  }

  if (saBypass && pathname.startsWith("/super-admin")) {
    return response;
  }
  if (saBypass && pathname === "/login") {
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

  let user: { id: string } | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ? { id: data.user.id } : null;
  } catch {
    user = null;
  }

  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isSlugPage = /^\/[a-z0-9-]+$/.test(pathname) && !pathname.startsWith("/dashboard") && !pathname.startsWith("/super-admin");

  if (isPublicPath || isSlugPage) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!serviceRoleKey) return response;
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let profile: { role: string; business_id: string | null } | null = null;
  try {
    const { data } = await admin.from("users").select("role, business_id").eq("id", user.id).single();
    profile = data as any;
  } catch {
    profile = null;
  }

  if (pathname.startsWith("/super-admin")) {
    if (profile?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (profile?.role === "super_admin") {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }

    if (profile?.business_id) {
      try {
        const { data: business } = await admin.from("businesses").select("status").eq("id", profile.business_id).single();
        if (business?.status !== "approved") {
          return NextResponse.redirect(new URL("/pending-approval", request.url));
        }
      } catch {}
    }
  }

  return response;
}

export async function middleware(request: NextRequest) {
  try {
    return await safeMiddleware(request);
  } catch (e) {
    // Middleware'i hicbir zaman 500 birakma - hata varsa istegi gec
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
