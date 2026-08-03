"use client";

import Link from "next/link";

type Props = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
};

export default function CTASection({
  title = "여행,\n지금 예약해보세요.",
  description = "출발일, 잔여석, 상품가격을 확인하고\n가장 알맞은 일정으로 안내해드립니다.",
  buttonText = "예약 문의하기",
  buttonHref = "/reservation",
}: Props) {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-gradient-to-r from-[#b88a44] to-[#8f6a2f] p-12 text-white shadow-2xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm tracking-[0.35em] text-white/70">
              READY TO TRAVEL
            </p>

            <h2 className="mt-4 whitespace-pre-line text-4xl font-bold md:text-5xl">
              {title}
            </h2>

            <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-8 text-white/80">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href={buttonHref}
              className="rounded-2xl bg-white px-10 py-5 text-center text-lg font-bold text-[#8f6a2f] transition hover:scale-105"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
