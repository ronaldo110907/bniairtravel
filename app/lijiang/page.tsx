import ProductHero from "@/components/ProductHero";

export default function LijiangPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ec]">
      <ProductHero
        product={{
          title: "리장",
          hero_heading: "곧 찾아옵니다",
          hero_description:
            "현재 리장 여행 상품을 준비 중입니다.\n곧 더욱 멋진 일정으로 찾아뵙겠습니다.",
          hero_image:
            "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/lijiang.png",
        }}
      />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <img
          src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/lijiang.png"
          alt="리장 준비중"
          className="w-full rounded-3xl shadow-xl"
        />

        <div className="mt-10 text-center">
          <h2 className="text-4xl font-bold">현재 상품을 준비 중입니다.</h2>

          <p className="mt-6 text-lg text-gray-600">
            리장 여행은 곧 예약이 가능합니다.
            <br />
            조금만 기다려 주세요.
          </p>
        </div>
      </section>
    </main>
  );
}
