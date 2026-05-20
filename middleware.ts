import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const publicPaths = ["/", "/login", "/register", "/pending-approval", "/book", "/api"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

  // Public paths - herkes erişebilir
  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  // Dynamic slug pages are public too
  const isSlugPage = /^\/[a-z0-9-]+$/.test(pathname) && !pathname.startsWith("/dashboard") && !pathname.startsWith("/super-admin");

  if (isPublicPath || isSlugPage) {
    return response;
  }

  // Dashboard ve super-admin için auth gerekli
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Super admin sayfası kontrolü
  if (pathname.startsWith("/super-admin")) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Dashboard kontrolü - işletme onaylı mı?
  if (pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, business_id")
      .eq("id", user.id)
      .single();

    if (profile?.role === "super_admin") {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }

    if (profile?.business_id) {
      const { data: business } = await supabase
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
