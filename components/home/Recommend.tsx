import Image from "next/image";

const tours = [
  {
    badge: "🔥 BEST",
    title: "장가계",
    airport: "청주공항 직항",
    airline: "이스타항공",
    logo: "/images/airlines/eastar.svg",
    image: "/images/zhangjiajie/cover.jpg",
    price: "799,000원~",
    duration: "4박 5일",
    departure: "매주 월 / 수",
  },
];

export default function Recommend() {
  return (
    <section className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <p className="tracking-[8px] uppercase text-yellow-600">
            RECOMMENDED TOUR
          </p>

          <h2 className="mt-5 text-5xl font-black">추천여행</h2>

          <p className="mt-6 text-lg text-gray-500">
            특별하게 엄선한 인기 여행상품을 만나보세요.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {tours.map((tour, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="overflow-hidden">
                <Image
                  src={tour.image}
                  alt={tour.title}
                  width={900}
                  height={600}
                  className="h-80 w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm tracking-[4px] uppercase text-yellow-600">
                      {tour.badge}
                    </p>

                    <h3 className="mt-3 text-4xl font-black">{tour.title}</h3>

                    <p className="mt-2 text-gray-500">{tour.airport}</p>

                    <div className="mt-3">
                      <Image
                        src={tour.logo}
                        alt={tour.airline}
                        width={120}
                        height={40}
                        className="h-auto w-28 object-contain"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400">최저가</p>

                    <p className="mt-2 text-4xl font-black text-yellow-600">
                      {tour.price}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between gap-6 border-t pt-6">
                  <div>
                    <p className="text-sm text-gray-400">일정</p>

                    <p className="font-bold">{tour.duration}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">출발</p>

                    <p className="font-bold">{tour.departure}</p>
                  </div>

                  <button className="rounded-full bg-black px-8 py-3 text-white transition hover:bg-yellow-600">
                    자세히 보기 →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
