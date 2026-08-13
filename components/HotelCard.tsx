"use client";

import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

type Hotel = {
  id: number;
  name: string;
  grade: string;
  image: string;
  roomImage?: string;
  desc: string;
};

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
              <div className="flex h-[300px] w-full overflow-hidden">
                <img
                  src={`${baseUrl}${hotel.image}`}
                  alt={`${hotel.name} 호텔`}
                  onClick={() => setSelectedImage(`${baseUrl}${hotel.image}`)}
                  className={
                    hotel.roomImage
                      ? "h-full w-1/2 object-cover"
                      : "h-full w-full object-cover"
                  }
                />

                {hotel.roomImage && (
                  <img
                    src={`${baseUrl}${hotel.roomImage}`}
                    alt={`${hotel.name} 객실`}
                    onClick={() =>
                      setSelectedImage(`${baseUrl}${hotel.roomImage}`)
                    }
                    className="h-full w-1/2 object-cover"
                  />
                )}
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
      {selectedImage && (
        <ImageLightbox
          open={!!selectedImage}
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </section>
  );
}
