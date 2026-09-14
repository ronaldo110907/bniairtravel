"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHomeButton() {
  const pathname = usePathname();
  const router = useRouter();

  const [homeLoading, setHomeLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    setHomeLoading(false);
  }, [pathname]);

  async function handleLogout() {
    if (logoutLoading) return;

    const confirmed = confirm("로그아웃하시겠습니까?");
    if (!confirmed) return;

    setLogoutLoading(true);

    try {
      const res = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!res.ok) {
        alert("로그아웃에 실패했습니다.");
        setLogoutLoading(false);
        return;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("로그아웃에 실패했습니다.");
      setLogoutLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2">
      <button
        type="button"
        onClick={handleLogout}
        disabled={logoutLoading}
        className="
          rounded-xl bg-red-600 px-4 py-3
          text-sm font-bold text-white shadow-lg
          transition hover:bg-red-700
          disabled:pointer-events-none disabled:opacity-60
        "
      >
        {logoutLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            로그아웃 중...
          </span>
        ) : (
          "🚪 로그아웃"
        )}
      </button>

      <Link
        href="/admin"
        onClick={() => {
          if (pathname !== "/admin") {
            setHomeLoading(true);
          }
        }}
        className={`
          rounded-xl bg-gray-900 px-5 py-3
          text-sm font-bold text-white shadow-lg
          transition hover:bg-black
          ${homeLoading ? "pointer-events-none" : ""}
        `}
      >
        {homeLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            이동 중...
          </span>
        ) : (
          "🏠 관리자 메인"
        )}
      </Link>
    </div>
  );
}
