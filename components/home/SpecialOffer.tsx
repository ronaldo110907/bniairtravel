"use client";

const offers = [
  {
    title: "장가계 4박5일",
    price: "1,430,000원~",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "백두산 4박5일",
    price: "1,090,000원~",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "상해·항주·주가각",
    price: "699,000원~",
    image:
      "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function SpecialOffer() {
  return (
    <section className="bg-[#f8f9fb] py-28">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <p className="text-sm font-semibold tracking-[6px] text-yellow-500 uppercase">
            Special Offer
          </p>

          <h2 className="mt-4 text-5xl font-black text-[#081A33]">
            🔥 긴급특가
          </h2>

          <p className="mt-4 text-gray-500">
            이번 주 가장 인기 있는 상품
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {offers.map((offer) => (

            <div
              key={offer.title}
              className="group overflow-hidden rounded-[28px] bg-white shadow-xl transition duration-500 hover:-translate-y-3"
            >

              <div className="overflow-hidden">

                <img
                  src={offer.image}
                  alt={offer.title}
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
                />

              </div>

              <div className="p-8">

                <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
                  긴급특가
                </span>

                <h3 className="mt-6 text-3xl font-bold text-[#081A33]">
                  {offer.title}
                </h3>

                <p className="mt-5 text-4xl font-black text-yellow-600">
                  {offer.price}
                </p>

                <button className="mt-8 w-full rounded-xl bg-[#081A33] py-4 font-bold text-white transition hover:bg-[#0e2d57]">
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