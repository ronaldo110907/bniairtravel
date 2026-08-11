"use client";

import Link from "next/link";

const posterUrl =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/malaysia.jpg";

export default function MalaysiaPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f1]">
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        {/* 제목 */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-bold tracking-[0.2em] text-[#B88A44]">
            MALAYSIA GOLF
          </p>

          <h1 className="text-2xl font-black text-gray-900 md:text-4xl">
            말레이시아 직영 VVIP 골프
          </h1>

          <p className="mt-3 text-sm text-gray-500 md:text-base">
            자세한 상품 내용은 아래 안내 포스터를 확인해주세요.
          </p>
        </div>

        {/* 포스터 */}
        <div className="mx-auto overflow-hidden rounded-2xl bg-white shadow-lg">
          <img
            src={posterUrl}
            alt="말레이시아 직영 VVIP 골프 상품 안내"
            className="h-auto w-full"
          />
        </div>

        {/* 예약 문의 */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/reservation?product=말레이시아 직영 VVIP 골프"
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-blue-600
              px-8
              py-4
              text-center
              text-lg
              font-black
              text-white
              shadow-lg
              transition
              hover:bg-blue-700
            "
          >
            ✈️ 예약 문의하기
          </Link>
        </div>
      </section>
    </main>
  );
}
