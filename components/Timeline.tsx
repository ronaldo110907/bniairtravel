"use client";

import { useEffect, useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

const mealBaseUrl =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/meals/zhangjiajie/";

const mealImages: Record<string, string> = {
  호텔식: "breakfast.jpg",
  "김밥+생수": "gibbap.jpg",
  오리모듬: "duck.png",
  산채비빔밥: "bibimbap.png",
  "누룽지 닭백숙": "chikean.png",
  "버섯 샤브샤브": "mushroom.png",
  "삼겹살 무제한": "samgyeopsal.png",
  보쌈정식: "bossam.png",
  "소고기 특식": "beef.png",
};

type Props = {
  defaultCourse?: "4N5D" | "3N4D";
  itinerary4N5D: any[];
  itinerary3N4D: any[];
  mealBaseUrl?: string;
  mealImages?: Record<string, string>;
  flightInfo: any;
};

export default function Timeline({
  defaultCourse = "4N5D",
  itinerary4N5D,
  itinerary3N4D,
  mealBaseUrl,
  mealImages,
  flightInfo,
}: Props) {
  const [activeCourse, setActiveCourse] = useState<"4N5D" | "3N4D">(
    defaultCourse,
  );
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<"4N5D" | "3N4D">;
      setActiveCourse(customEvent.detail);
    };

    window.addEventListener("change-itinerary", handler);

    return () => {
      window.removeEventListener("change-itinerary", handler);
    };
  }, []);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const itinerary = activeCourse === "4N5D" ? itinerary4N5D : itinerary3N4D;
  const { outbound, inbound } = flightInfo;

  return (
    <section
      id="travel-itinerary"
      className="mx-auto max-w-6xl scroll-mt-28 py-24"
    >
      <div className="mb-10 text-center">
        <p className="text-sm tracking-[0.4em] text-[#B88A44]">
          TRAVEL ITINERARY
        </p>

        <h2 className="mt-4 text-4xl font-bold md:text-5xl">여행 일정</h2>

        <p className="mt-5 text-gray-500">
          장가계 핵심 관광지를 여유롭게 둘러보는 프리미엄 일정
        </p>
      </div>

      <div className="mb-14 flex justify-center">
        <div className="inline-flex rounded-full border border-[#E8DCC4] bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveCourse("4N5D")}
            className={[
              "rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 md:px-8",
              activeCourse === "4N5D"
                ? "bg-[#C8A15A] text-white shadow-md"
                : "text-gray-500 hover:text-[#B88A44]",
            ].join(" ")}
          >
            4박5일 일정
          </button>

          <button
            type="button"
            onClick={() => setActiveCourse("3N4D")}
            className={[
              "rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 md:px-8",
              activeCourse === "3N4D"
                ? "bg-[#C8A15A] text-white shadow-md"
                : "text-gray-500 hover:text-[#B88A44]",
            ].join(" ")}
          >
            3박4일 일정
          </button>
        </div>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-[#FCFAF7] p-5">
          <p className="mb-3 text-sm font-bold text-[#B88A44]">
            ✈️ 출국 항공편
          </p>

          <p className="font-semibold">
            {outbound.airline} {outbound.flight}
          </p>

          <p className="text-gray-600">
            {outbound.from} {outbound.departure}
            {" → "}
            {outbound.to} {outbound.arrival}
          </p>
        </div>

        <div className="rounded-2xl border bg-[#FCFAF7] p-5">
          <p className="mb-3 text-sm font-bold text-[#B88A44]">
            🛬 귀국 항공편
          </p>

          <p className="font-semibold">
            {inbound.airline} {inbound.flight}
          </p>

          <p className="text-gray-600">
            {inbound.from} {inbound.departure}
            {" → "}
            {inbound.to} {inbound.arrival}
          </p>
        </div>
      </div>
      <div className="space-y-8">
        {itinerary.map((item) => (
          <article
            key={`${activeCourse}-${item.day}`}
            className="overflow-hidden rounded-[30px] border border-[#ECE7DF] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="grid lg:grid-cols-[360px_1fr]">
              <div className="relative min-h-[280px] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 flex items-center gap-3 text-white">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C8A15A] text-2xl shadow-lg">
                    {item.icon}
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.25em] text-white/65">
                      {item.day}
                    </p>
                    <p className="mt-1 font-semibold">{item.duration}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#F6F1E8] px-4 py-2 text-sm font-bold text-[#B88A44]">
                    {item.day}
                  </span>

                  <span className="rounded-full border border-[#E8DCC4] px-4 py-2 text-xs font-semibold text-gray-500">
                    {activeCourse === "4N5D" ? "4박5일" : "3박4일"}
                  </span>
                </div>

                <h3 className="text-2xl font-bold md:text-3xl">{item.title}</h3>

                <p className="mt-4 leading-7 text-gray-500">
                  {item.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {item.places.map((place: string) => (
                    <span
                      key={place}
                      className="rounded-full bg-[#FAF7F1] px-3 py-2 text-xs font-medium text-[#765A2B]"
                    >
                      {place}
                    </span>
                  ))}
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#F0EAE1] bg-[#FCFAF7] p-5">
                    <p className="mb-3 text-sm font-bold text-[#B88A44]">
                      식사
                    </p>

                    <div className="space-y-3">
                      <MealRow
                        label="조식"
                        mealName={item.meals.breakfast}
                        onImageClick={setSelectedImage}
                      />

                      <MealRow
                        label="중식"
                        mealName={item.meals.lunch}
                        onImageClick={setSelectedImage}
                      />

                      <MealRow
                        label="석식"
                        mealName={item.meals.dinner}
                        onImageClick={setSelectedImage}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#F0EAE1] bg-[#FCFAF7] p-5">
                    <p className="mb-3 text-sm font-bold text-[#B88A44]">
                      숙박
                    </p>

                    <p className="text-sm leading-6 text-gray-600">
                      {item.hotel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-gray-400">
        ※ 현지 사정 및 항공 일정에 따라 관광 순서와 식사, 호텔은 변경될 수
        있습니다.
      </p>
      {selectedImage && (
        <ImageLightbox
          open={!!selectedImage}
          image={selectedImage ?? ""}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </section>
  );
}

function MealRow({
  label,
  mealName,
  onImageClick,
}: {
  label: string;
  mealName: string;
  onImageClick: (image: string) => void;
}) {
  const imageFile = mealImages[mealName];

  return (
    <div className="flex min-h-12 items-center gap-3">
      {mealName !== "-----" && imageFile ? (
        <img
          src={`${mealBaseUrl}${imageFile}`}
          alt={mealName}
          onClick={() => onImageClick(`${mealBaseUrl}${imageFile}`)}
          className="h-12 w-16 shrink-0 cursor-pointer rounded-lg object-cover transition hover:opacity-80"
        />
      ) : (
        <div className="h-12 w-16 shrink-0" />
      )}

      <p className="text-sm text-gray-600">
        {label} · {mealName}
      </p>
    </div>
  );
}
