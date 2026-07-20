"use client";

export default function ReservationCTASection({
  product = "장가계",
}: {
  product?: string;
}) {
  return (
    <section
      className="relative overflow-hidden py-28"
      style={{
        backgroundImage: "url('/images/zhangjiajie/cta.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 text-center text-white">
        <p className="text-sm tracking-[0.4em] text-[#D7B06A]">
          BOOK NOW
        </p>

        <h2 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
          지금 {product} 여행을
          <br />
          예약해보세요.
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
          청주공항 직항 · 이스타항공 전세기
          <br />
          좌석 소진 시 조기 마감될 수 있습니다.
        </p>

        <div className="mt-10 rounded-3xl border border-[#D7B06A]/40 bg-white/10 px-10 py-6 backdrop-blur-md">
          <p className="text-sm tracking-[0.2em] text-[#D7B06A]">
            🔥 마감 임박
          </p>

          <p className="mt-3 text-5xl font-bold text-[#F5D48C]">
            8석
          </p>

          <p className="mt-2 text-white/70">
            현재 예약 가능 좌석
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 md:flex-row">
          <a
            href="/schedule"
            className="rounded-full bg-[#C8A15A] px-10 py-4 text-lg font-bold text-white transition hover:scale-105 hover:bg-[#B88A44]"
          >
            📅 출발일 보기
          </a>

          <a
            href={`/reservation?product=${product}`}
            className="rounded-full bg-[#C8A15A] px-10 py-4 text-lg font-bold text-white transition hover:scale-105 hover:bg-[#B88A44]"
          >
            ✈️ 예약 문의
          </a>

          <a
            href="https://pf.kakao.com/"
            target="_blank"
            className="rounded-full border-2 border-white px-10 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-black"
          >
            💬 카카오톡 상담
          </a>

          <a
            href="tel:043-000-0000"
            className="rounded-full border-2 border-[#D7B06A] px-10 py-4 text-lg font-bold text-[#F5D48C] transition hover:bg-[#D7B06A] hover:text-black"
          >
            📞 전화 상담
          </a>
        </div>

        <p className="mt-10 text-sm text-white/60">
          여행 일정 및 상품 문의는 언제든지 편하게 상담해드립니다.
        </p>
      </div>
    </section>
  );
}
