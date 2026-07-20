"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-gradient-to-r from-[#b88a44] to-[#8f6a2f] p-12 text-white shadow-2xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm tracking-[0.35em] text-white/70">
              READY TO TRAVEL
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              여행,
              <br />
              지금 예약해보세요.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              출발일, 잔여석, 상품가격을 확인하고
              <br />
              가장 알맞은 일정으로 안내해드립니다.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/reservation"
              className="rounded-2xl bg-white px-10 py-5 text-center text-lg font-bold text-[#8f6a2f] transition hover:scale-105"
            >
              예약 문의하기
            </Link>

            <Link
              href="/schedule"
              className="rounded-2xl border border-white/30 px-10 py-5 text-center text-lg font-semibold transition hover:bg-white/10"
            >
              출발일정 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
