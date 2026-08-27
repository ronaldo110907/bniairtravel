export default function XiamenPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO */}
      <section
        className="relative flex min-h-[650px] items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/hero.png",
        }}
      >
        {/* 가독성용 오버레이 */}
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center text-white">
          <p className="mb-4 text-lg font-medium tracking-[0.2em] drop-shadow-md md:text-xl">
            한겨울에도 따뜻한 도시
          </p>

          <h1 className="text-5xl font-black tracking-tight drop-shadow-lg md:text-7xl">
            샤먼
          </h1>

          <p className="mt-5 text-xl font-semibold drop-shadow-md md:text-2xl">
            청주공항 출발 · 이스타항공 직항
          </p>

          <div className="mx-auto mt-7 inline-flex rounded-full border border-white/50 bg-white/20 px-6 py-3 text-sm font-semibold backdrop-blur-md md:text-base">
            2026.12.03 ~ 2027.03.25
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <p className="text-sm font-bold tracking-[0.25em] text-teal-600">
          DISCOVER XIAMEN
        </p>

        <h2 className="mt-4 text-3xl font-black text-gray-900 md:text-4xl">
          겨울에 떠나는 따뜻한 샤먼 여행
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
          아름다운 해변과 이국적인 도시 풍경,
          <br className="hidden md:block" />
          여유로운 관광과 골프까지 즐길 수 있는 샤먼을 만나보세요.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            "✈️ 청주 직항",
            "🌴 따뜻한 겨울",
            "🏌️ 골프 여행",
            "🌊 해변 휴양",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full bg-teal-50 px-5 py-2.5 text-sm font-bold text-teal-800"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* POSTER */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold tracking-[0.2em] text-teal-600">
              XIAMEN TRAVEL
            </p>

            <h2 className="mt-3 text-3xl font-black text-gray-900 md:text-4xl">
              샤먼 여행 안내
            </h2>

            <p className="mt-4 text-gray-500">
              청주공항에서 이스타항공 직항으로 떠나는 따뜻한 겨울 여행
            </p>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
            <img
              src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/xiamen.png"
              alt="청주공항 출발 샤먼 직항 여행 안내"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="bg-gradient-to-b from-sky-50 to-white py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-5xl">🌴</div>

          <p className="mt-6 text-sm font-bold tracking-[0.2em] text-teal-600">
            COMING SOON
          </p>

          <h2 className="mt-4 text-3xl font-black text-gray-900 md:text-4xl">
            샤먼의 특별한 여행 일정을
            <br />
            준비하고 있습니다.
          </h2>

          <p className="mt-6 text-base leading-8 text-gray-600 md:text-lg">
            관광부터 골프까지 더욱 알찬 일정으로
            <br />곧 찾아뵙겠습니다.
          </p>
        </div>
      </section>
    </main>
  );
}
