"use client";

import Link from "next/link";

export default function StickyBookingBar({
  product = "장가계",
}: {
  product?: string;
}) {
  return (
    <div className="sticky top-0 z-40 border-y border-black/5 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-black/50">
            청주공항 출발 · 이스타항공 전세기
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-xl font-bold text-[#1f1f1f] md:text-2xl">
              1,330,000원~
            </span>
            <span className="hidden pb-0.5 text-sm text-black/40 sm:inline">
              3박4일 / 4박5일
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="#departure-calendar"
            className="hidden rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-[#b88a44] hover:text-[#b88a44] sm:inline-flex"
          >
            출발일 보기
          </Link>

          <Link
            href={`/reservation?product=${product}`}
            className="inline-flex rounded-full bg-[#b88a44] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#9f7435]"
          >
            예약 문의
          </Link>
        </div>
      </div>
    </div>
  );
}
