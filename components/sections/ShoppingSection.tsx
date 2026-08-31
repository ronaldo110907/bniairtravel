"use client";

type Shopping = {
  id: number;
  title: string;
  image?: string;
  desc: string;
};

type Props = {
  shopping: Shopping[];
  showNotice?: boolean;
  noticeText?: string;
  noShopping?: boolean;
};

export default function ShoppingSection({
  shopping,
  showNotice = true,
  noticeText = "※ 쇼핑센터 방문은 여행 일정에 포함되어 있으며, 구매는 고객님의 자율적인 선택입니다.",
  noShopping = false,
}: Props) {
  return (
    <section className="mx-auto max-w-7xl py-24">
      <div className="mb-14 text-center">
        <p className="text-sm tracking-[0.35em] text-[#B88A44]">
          SHOPPING INFORMATION
        </p>

        <h2 className="mt-3 text-4xl font-bold">쇼핑센터 안내</h2>

        <p className="mt-4 text-gray-500">
          {noShopping
            ? "본 상품은 쇼핑센터 방문이 없는 노쇼핑 상품입니다."
            : "본 상품에는 아래 쇼핑센터 방문 일정이 포함되어 있습니다."}
        </p>
      </div>

      {noShopping ? (
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#ECE7DF] bg-white p-10 text-center shadow-sm">
          <p className="text-2xl font-bold">🛍️ 노쇼핑 상품</p>

          <p className="mt-4 leading-7 text-gray-600">
            여행 일정 중 별도의 쇼핑센터 방문이 없습니다.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-8">
            {shopping.map((shop) => (
              <div
                key={shop.id}
                className="w-full max-w-[300px] overflow-hidden rounded-3xl border border-[#ECE7DF] bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {shop.image && (
                  <img
                    src={shop.image}
                    alt={shop.title}
                    className="h-60 w-full object-cover"
                  />
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold">{shop.title}</h3>

                  <p className="mt-3 leading-7 text-gray-600">{shop.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {showNotice && (
            <div className="mt-10 rounded-3xl bg-[#FCFAF7] p-6 text-sm leading-7 text-gray-600">
              {noticeText}
            </div>
          )}
        </>
      )}
    </section>
  );
}
