"use client";

import Link from "next/link";
import { Map } from "lucide-react";

const moveToItinerary = (course: "3N4D" | "4N5D") => {
  window.dispatchEvent(
    new CustomEvent("change-itinerary", {
      detail: course,
    }),
  );

  document.getElementById("travel-itinerary")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

type Props = {
  product?: string;
  departure?: string;
  price?: string;
  showItineraryButtons?: boolean;
};

export default function StickyBookingBar({
  product = "장가계",
  departure = "청주공항 출발",
  price = "출발일 확인",
  showItineraryButtons = true,
}: Props) {
  return (
    <div className="sticky top-0 z-40 border-y border-black/5 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-black/50">
            {departure} · {product} 직항
          </p>

          <div className="mt-1 flex items-end gap-2">
            <span className="text-xl font-bold text-[#1f1f1f] md:text-2xl">
              {price}
            </span>

            <span className="hidden pb-0.5 text-sm text-black/40 sm:inline">
              일정표 확인하기
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showItineraryButtons && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => moveToItinerary("3N4D")}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-[#b88a44] hover:text-[#b88a44]"
              >
                <Map size={16} />
                3박4일 일정
              </button>

              <button
                type="button"
                onClick={() => moveToItinerary("4N5D")}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-[#b88a44] hover:text-[#b88a44]"
              >
                <Map size={16} />
                4박5일 일정
              </button>
            </div>
          )}
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
