"use client";

import Link from "next/link";

export default function MobileBookingButton({
  product = "장가계",
}: {
  product?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-black/45">장가계 직항</p>
          <p className="truncate text-lg font-bold text-[#1f1f1f]">
            1,330,000원~
          </p>
        </div>

        <Link
          href={`/reservation?product=${product}`}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#b88a44] px-6 py-3 text-sm font-bold text-white transition active:scale-95"
        >
          예약 문의
        </Link>
      </div>
    </div>
  );
}
