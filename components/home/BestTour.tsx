"use client";

const tours = [
  {
    title: "장가계",
    subtitle: "천문산 · 원가계 · 대협곡",
    image: "/images/zhangjiajie.jpg",
  },
  {
    title: "백두산",
    subtitle: "천지 · 북파 · 서파",
    image: "/images/baekdu.jpg",
  },
  {
    title: "상해",
    subtitle: "와이탄 · 디즈니 · 예원",
    image: "/images/shanghai.jpg",
  },
  {
    title: "여강",
    subtitle: "고성 · 차마고도",
    image: "/images/lijiang.jpg",
  },
];

export default function BestTour() {
  return (
    <section className="bg-white py-28">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">

          <p className="uppercase tracking-[8px] text-yellow-500 font-semibold">
            Premium Tour
          </p>

          <h2 className="mt-4 text-5xl font-black text-[#081A33]">
            추천 여행상품
          </h2>

          <p className="mt-4 text-gray-500">
            BNI AIR TRAVEL이 자신 있게 추천하는 프리미엄 여행
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2">

          {tours.map((tour) => (

            <div
              key={tour.title}
              className="group relative h-[480px] overflow-hidden rounded-[32px]"
            >

              <img
                src={tour.image}
                alt={tour.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              <div className="absolute bottom-0 p-10 text-white">

                <p className="text-yellow-400 uppercase tracking-[5px]">
                  PREMIUM
                </p>

                <h3 className="mt-3 text-5xl font-black">
                  {tour.title}
                </h3>

                <p className="mt-4 text-lg text-gray-200">
                  {tour.subtitle}
                </p>

                <button className="mt-8 rounded-xl bg-yellow-500 px-7 py-4 font-bold text-white hover:bg-yellow-600">
                  자세히 보기
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}