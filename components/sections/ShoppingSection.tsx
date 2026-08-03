"use client";
console.log("SHOPPING SECTION NEW");
type Shopping = {
  id: number;
  title: string;
  image: string;
  desc: string;
};

type Props = {
  shopping: Shopping[];
};

export default function ShoppingSection({ shopping }: Props) {
  return (
    <section className="mx-auto max-w-7xl py-24">
      <div className="text-center mb-14">
        <p className="text-sm tracking-[0.35em] text-[#B88A44]">
          SHOPPING INFORMATION
        </p>
        <h2 className="mt-3 text-4xl font-bold">쇼핑센터 안내</h2>
        <p className="mt-4 text-gray-500">
          본 상품에는 아래 쇼핑센터 방문 일정이 포함되어 있습니다.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {shopping.map((shop) => (
          <div
            key={shop.title}
            className="overflow-hidden rounded-3xl border border-[#ECE7DF] bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <img
              src={shop.image}
              alt={shop.title}
              className="h-60 w-full object-cover"
            />

            <div className="p-6">
              <h3 className="text-xl font-bold">{shop.title}</h3>

              <p className="mt-3 leading-7 text-gray-600">{shop.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-[#FCFAF7] p-6 text-sm leading-7 text-gray-600">
        ※ 쇼핑센터 방문은 여행 일정에 포함되어 있으며, 구매는 고객님의 자율적인
        선택입니다. 3박 4일은 2곳, 4박 5일은 3곳의 쇼핑센터를 방문합니다.
      </div>
    </section>
  );
}
