"use client";

type Product = {
  price_4d5n?: number | null;
  price_3d4n?: number | null;
};

export default function PriceCard({ product }: { product: Product }) {
  return (
    <section className="bg-[#faf8f4] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="mb-3 text-sm tracking-[0.35em] text-[#b88a44]">
            PRICE GUIDE
          </p>
          <h2 className="text-4xl font-bold md:text-5xl">
            상품 요금 안내
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[36px] border border-[#ece7df] bg-white p-10 shadow-lg">
            <p className="text-sm font-semibold text-[#b88a44]">
              PREMIUM COURSE
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              4박 5일
            </h3>

            <p className="mt-8 text-5xl font-bold text-[#b88a44]">
              ₩{(product?.price_4d5n ?? 1430000).toLocaleString()}~
            </p>

            <div className="mt-8 space-y-3 text-gray-600">
              <p>✔ 청주공항 출발</p>
              <p>✔ 노팁+노옵션</p>
              <p>✔ 이스타항공 전세기</p>
              <p>✔ 프리미엄 핵심코스</p>
            </div>
          </div>

          <div className="rounded-[36px] bg-[#1f1f1f] p-10 text-white shadow-lg">
            <p className="text-sm font-semibold text-[#c8a15a]">
              PREMIUM COURSE
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              3박 4일
            </h3>

            <p className="mt-8 text-5xl font-bold text-[#c8a15a]">
              ₩{(product?.price_3d4n ?? 1330000).toLocaleString()}~
            </p>

            <div className="mt-8 space-y-3 text-white/70">
              <p>✔ 청주공항 출발</p>
              <p>✔ 노팁+노옵션</p>
              <p>✔ 이스타항공 전세기</p>
              <p>✔ 핵심 관광 포함</p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          ※ 출발일 및 환율에 따라 상품가는 변동될 수 있습니다.
        </p>
      </div>
    </section>
  );
}
