import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // =========================
  // 관리자 페이지 로그인 체크
  // =========================
  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  const adminSession = request.cookies.get("admin_user");

  if (isAdminPage && !adminSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 기본 응답 생성
  const response = NextResponse.next();

  // =========================
  // 예약페이지 캐시 방지
  // =========================
  if (pathname === "/reservation") {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/reservation"],
};
