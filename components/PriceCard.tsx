"use client";

type Product = {
  price_from?: number | null;
  feature1?: string | null;
  feature2?: string | null;
  feature3?: string | null;
  feature4?: string | null;
};

export default function PriceCard({ product }: { product: Product }) {
  return (
    <section className="bg-[#faf8f4] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="mb-3 text-sm tracking-[0.35em] text-[#b88a44]">
            PRICE GUIDE
          </p>
          <h2 className="text-4xl font-bold md:text-5xl">상품 요금 안내</h2>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="rounded-[36px] border border-[#ece7df] bg-white p-10 shadow-lg">
            <p className="text-sm font-semibold text-[#b88a44]">1인 상품가</p>

            <h3>최저가</h3>

            <p className="mt-8 text-5xl font-bold text-[#b88a44]">
              {product?.price_from
                ? `₩${product.price_from.toLocaleString()}~`
                : "가격 문의"}
            </p>

            <div className="mt-8 space-y-3 text-gray-600">
              <div className="mt-8 space-y-3 text-gray-600">
                {product?.feature1 && <p>✔ {product.feature1}</p>}
                {product?.feature2 && <p>✔ {product.feature2}</p>}
                {product?.feature3 && <p>✔ {product.feature3}</p>}
                {product?.feature4 && <p>✔ {product.feature4}</p>}
              </div>
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
