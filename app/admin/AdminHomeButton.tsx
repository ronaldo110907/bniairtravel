"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHomeButton() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  return (
    <Link
      href="/admin"
      onClick={() => setLoading(true)}
      className={`
        fixed bottom-6 right-6 z-[9999]
        rounded-xl bg-gray-900 px-5 py-3
        text-sm font-bold text-white shadow-lg
        transition hover:bg-black
        ${loading ? "pointer-events-none" : ""}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          이동 중...
        </span>
      ) : (
        "🏠 관리자 메인"
      )}
    </Link>
  );
}
