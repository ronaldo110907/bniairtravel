"use client";

type Product = {
  price_4d5n?: number | null;
  price_3d4n?: number | null;
};

export default function PriceCard({ product }: { product: any }) {
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
          <div className="rounded-[36px] bg-white p-10 shadow-lg border border-[#ece7df]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#b88a44] font-semibold">
                  PREMIUM COURSE
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  4박 5일
                </h3>
              </div>

              <span className="rounded-full bg-[#f6f1e8] px-4 py-2 text-sm font-bold text-[#b88a44]">
                월 · 수 출발
              </span>
            </div>

            <p className="text-5xl font-bold text-[#b88a44]">
              {`₩${(product?.price_4d5n ?? 1430000).toLocaleString()}~`}
            </p>

            <div className="mt-8 space-y-3 text-gray-600">
              <p>✔ 청주공항 출발</p>
              <p>✔ 노팁+노옵션</p>
              <p>✔ 이스타항공 전세기</p>
              <p>✔ 프리미엄 핵심코스+칠성산 포함</p>
              <p>✔ 쇼핑3회(라텍스, 게르마늄, 침향, 죽탄, 한약, 진주 중 3회)</p>
            </div>
          </div>

          <div className="rounded-[36px] bg-[#1f1f1f] p-10 text-white shadow-lg">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#c8a15a] font-semibold">
                  PREMIUM COURSE
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  3박 4일
                </h3>
              </div>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                금 · 일 출발
              </span>
            </div>

            <p className="text-5xl font-bold text-[#c8a15a]">
              {`₩${(product?.price_3d4n ?? 1330000).toLocaleString()}~`}
            </p>

            <div className="mt-8 space-y-3 text-white/70">
              <p>✔ 청주공항 출발</p>
              <p>✔ 노팁+노옵션</p>
              <p>✔ 이스타항공 전세기</p>
              <p>✔ 핵심 관광 포함</p>
              <p>✔ 쇼핑2회(라텍스, 게르마늄, 침향, 죽탄, 한약, 진주 중 2회)</p>
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
