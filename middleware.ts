import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "@/lib/auth/admin-policy";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });
  const protectedPage = (pathname === "/admin" || pathname.startsWith("/admin/")) && pathname !== "/admin/login";
  // API handlers also verify authorization themselves, including dispatch.
  if (protectedPage || pathname.startsWith("/api/admin/") || pathname === "/api/dispatch") {
    let allowed = false;
    try {
      const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(values) {
            values.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      });
      const { data, error } = await client.auth.getUser();
      allowed = !error && isAdminUser(data.user);
    } catch { allowed = false; }
    if (protectedPage && !allowed) {
      const redirect = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
      redirect.headers.set("Cache-Control", "private, no-store");
      return redirect;
    }
    response.headers.set("Cache-Control", "private, no-store");
  }
  if (pathname === "/reservation") {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }
  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*", "/api/dispatch", "/reservation"] };
