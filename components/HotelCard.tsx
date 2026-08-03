"use client";

import { Hotel } from "@/data/zhangjiajie";

type Props = {
  title?: string;
  description?: string;
  baseUrl: string;
  hotels: Hotel[];
};

export default function HotelCard({
  title = "5성급 프리미엄 호텔",
  description = "장거리 관광 후 충분히 휴식할 수 있도록 안정적인 숙박 컨디션을 고려합니다.",
  baseUrl,
  hotels,
}: Props) {
  console.log("hotels =", hotels);

  return (
    <section className="bg-[#1f1f1f] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="mb-3 text-sm tracking-[0.35em] text-[#c8a15a]">HOTEL</p>
          <h2 className="text-4xl font-bold md:text-5xl">{title}</h2>
          <p className="mt-5 max-w-2xl leading-7 text-white/60">
            {description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="group overflow-hidden rounded-[34px] border border-white/10 bg-white/5"
            >
              <div className="overflow-hidden">
                <img
                  src={`${baseUrl}${hotel.image}`}
                  alt={hotel.name}
                  onError={() => console.log("이미지 로드 실패")}
                  className="h-[340px] w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-8">
                <p className="mb-3 text-sm font-semibold text-[#c8a15a]">
                  {hotel.grade}
                </p>
                <h3 className="text-2xl font-bold">{hotel.name}</h3>
                <p className="mt-4 leading-7 text-white/60">{hotel.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-white/40">
          ※ 호텔은 현지 사정 및 출발일에 따라 동급 호텔로 변경될 수 있습니다.
        </p>
      </div>
    </section>
  );
}
