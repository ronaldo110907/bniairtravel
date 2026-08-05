"use client";

import Link from "next/link";

{
  /*}
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
*/
}

type Props = {
  product?: string;
  departure?: string;
  price?: string;
  pdfFile?: string;
  hwpFile?: string;
};

export default function StickyBookingBar({
  product = "상품",
  departure = "출발지",
  price = "출발일 확인",
  pdfFile,
  hwpFile,
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
          {/*}
          {showItineraryButtons && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => moveToItinerary("3N4D")}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-[#b88a44] hover:text-[#b88a44]"
              >
                <Map size={16} />
                {course1}
              </button>

              <button
                type="button"
                onClick={() => moveToItinerary("4N5D")}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-[#b88a44] hover:text-[#b88a44]"
              >
                <Map size={16} />
                {course2}
              </button>
            </div>
          )}
            */}
          {pdfFile && (
            <a
              href={pdfFile}
              download
              className="inline-flex rounded-full border border-[#b88a44] px-5 py-3 text-sm font-bold text-[#b88a44] transition hover:bg-[#b88a44] hover:text-white"
            >
              📄 PDF일정표
            </a>
          )}

          {hwpFile && (
            <a
              href={hwpFile}
              download
              className="inline-flex rounded-full border border-[#b88a44] px-5 py-3 text-sm font-bold text-[#b88a44] transition hover:bg-[#b88a44] hover:text-white"
            >
              📝 HWP일정표
            </a>
          )}
          <Link
            href={`/reservation?product=${encodeURIComponent(product)}`}
            className="inline-flex rounded-full bg-[#b88a44] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#9f7435]"
          >
            예약 문의
          </Link>
        </div>
      </div>
    </div>
  );
}
