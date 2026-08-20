"use client";

import Link from "next/link";

type Product = {
  title: string;
  subtitle?: string | null;
  hero_image?: string | null;
  departure_airport?: string | null;
  airline?: string | null;
  duration?: string | null;
  hero_badge?: string;
  hero_heading?: string | null;
  hero_description?: string | null;
  slug?: string;
};

export default function ProductHero({ product }: { product: Product }) {
  return (
    <section className="relative min-h-[680px] overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={product?.hero_image ?? undefined}
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      {product?.slug === "guilin" && product?.hero_image && (
        <img
          src={product.hero_image}
          alt="계림"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-6xl items-center px-6 py-24">
        <div className="max-w-3xl text-white">
          <p className="mb-5 text-sm font-medium tracking-[0.38em] text-white/70">
            {product?.hero_badge || "PREMIUM CHINA TRAVEL"}
          </p>

          <h1 className="whitespace-pre-line text-5xl font-bold leading-[1.08] md:text-7xl">
            {product?.title || "장가계"}
            <br />

            {product?.slug === "phuquoc" ? (
              <>
                청주에서 만나는
                <br />
                천국을 닮은 휴양지
              </>
            ) : product?.slug === "guilin" ? (
              <>
                산수화 속으로 떠나는
                <br />
                계림 · 천저우
              </>
            ) : (
              product?.hero_heading || "하늘과 맞닿은 비경"
            )}
          </h1>

          <p className="whitespace-pre-line mt-7 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
            {product?.hero_description ||
              product?.subtitle ||
              "청주공항에서 직항으로 떠나는 장가계 여행. 웅장한 자연과 핵심 관광지를 여유로운 일정으로 만나보세요."}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="#departure-calendar"
              className="inline-flex items-center justify-center rounded-full bg-[#b88a44] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#9f7435]"
            >
              출발일 확인
            </Link>

            <Link
              href={`/reservation?product=${encodeURIComponent(product?.title ?? "")}`}
              className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-black"
            >
              예약 문의
            </Link>
          </div>

          <div
            className={`mt-12 grid max-w-2xl gap-3 ${
              product?.title === "푸꾸옥" ? "sm:grid-cols-2" : "sm:grid-cols-3"
            }`}
          >
            <HeroInfo
              label="출발"
              value={product?.departure_airport || "청주공항 직항"}
            />

            <HeroInfo label="항공" value={product?.airline || "이스타항공"} />

            {product?.title !== "푸꾸옥" && (
              <HeroInfo
                label="일정"
                value={
                  product?.slug === "guilin"
                    ? "3박5일 / 4박6일"
                    : product?.duration || "3박4일 / 4박5일"
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-black/15 px-5 py-4 backdrop-blur-md">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
