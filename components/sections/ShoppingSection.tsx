"use client";
console.log("SHOPPING SECTION NEW");
const shops = [
  {
    title: "라텍스",
    image: "/images/shopping/latex.jpg",
    desc: "천연 라텍스 침구 및 생활용품을 둘러보는 매장입니다.",
  },
  {
    title: "차(Tea)",
    image: "/images/shopping/tea.jpg",
    desc: "중국 전통차와 다양한 차 문화를 체험할 수 있습니다.",
  },
  {
    title: "보석",
    image: "/images/shopping/jewelry.jpg",
    desc: "옥, 비취 등 중국 전통 보석 제품을 소개합니다.",
  },
  {
    title: "침향",
    image: "/images/shopping/qimhyang.jpg",
    desc: "침향나무가 스스로를 보호하기 위해 분비하는 수지가 수백년간 굳어져 만들어진 약재.",
  },
  {
    title: "게르마늄",
    image: "/images/shopping/germanium.jpg",
    desc: "혈액순환, 통증완화, 피로해소등의 효과가 있는 제품.",
  },
];

export default function ShoppingSection() {
  return (
    <section className="mx-auto max-w-7xl py-24">
      <div className="text-center mb-14">
        <p className="text-sm tracking-[0.35em] text-[#B88A44]">SHOPPING INFORMATION</p>
        <h2 className="mt-3 text-4xl font-bold">쇼핑센터 안내</h2>
        <p className="mt-4 text-gray-500">
          본 상품에는 아래 쇼핑센터 방문 일정이 포함되어 있습니다.
                  </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {shops.map((shop) => (
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

              <p className="mt-3 leading-7 text-gray-600">
                {shop.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-[#FCFAF7] p-6 text-sm leading-7 text-gray-600">
        ※ 쇼핑센터 방문은 여행 일정에 포함되어 있으며, 구매는 고객님의 자율적인 선택입니다. 3박 4일은 2곳, 4박 5일은 3곳의 쇼핑센터를 방문합니다.
      </div>
    </section>
  );
}
