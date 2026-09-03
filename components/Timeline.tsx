"use client";

import { useEffect, useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import Link from "next/link";

type CustomTab = {
  key: string;
  label: string;
  itinerary: any[];
};

type Props = {
  defaultCourse?: "4N5D" | "3N4D";
  course4Label?: string;
  course3Label?: string;

  itinerary4N5D?: any[];
  itinerary3N4D?: any[];

  customTabs?: CustomTab[];
  activeCustomTab?: string;
  onCustomTabChange?: (key: string) => void;

  description?: string;
  webtoonHref?: string;

  mealBaseUrl: string;
  mealImages: Record<string, string>;
  flightInfo: any;
};

export default function Timeline({
  defaultCourse = "4N5D",
  course4Label = "4박5일",
  course3Label = "3박4일",
  itinerary4N5D = [],
  itinerary3N4D = [],
  customTabs,
  activeCustomTab: controlledCustomTab,
  onCustomTabChange,
  description = "장가계 핵심 관광지를 여유롭게 둘러보는 프리미엄 일정",
  webtoonHref,
  mealBaseUrl,
  mealImages,
  flightInfo,
}: Props) {
  const [activeCourse, setActiveCourse] = useState<"4N5D" | "3N4D">(
    defaultCourse,
  );
  const [internalCustomTab, setInternalCustomTab] = useState(
    customTabs?.[0]?.key ?? "",
  );

  const activeCustomTab = controlledCustomTab ?? internalCustomTab;

  const changeCustomTab = (key: string) => {
    if (controlledCustomTab === undefined) {
      setInternalCustomTab(key);
    }

    onCustomTabChange?.(key);
  };
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

  const activeCustomItinerary = customTabs?.find(
    (tab) => tab.key === activeCustomTab,
  )?.itinerary;

  const itinerary =
    customTabs && customTabs.length > 0
      ? (activeCustomItinerary ?? customTabs[0].itinerary)
      : activeCourse === "4N5D"
        ? itinerary4N5D
        : itinerary3N4D;
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

        <p className="mt-5 text-gray-500">{description}</p>
      </div>
      {webtoonHref && (
        <div className="mx-auto mb-10 max-w-2xl px-4">
          <Link
            href={webtoonHref}
            className="group block rounded-2xl border border-[#E8DCC4] bg-[#FCFAF7] px-6 py-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm font-bold tracking-wider text-[#B88A44]">
              🎨 TRAVEL WEBTOON
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900 md:text-xl">
              웹툰으로 미리 떠나는 여행
            </p>

            <p className="mt-1 text-sm text-gray-500">
              재미있는 웹툰으로 여행 일정을 먼저 만나보세요.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#B88A44]">
              웹툰 여행 보기
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        </div>
      )}
      <div className="mb-14 flex justify-center">
        {customTabs && customTabs.length > 0 ? (
          // 푸꾸옥 등 상품별 커스텀 탭
          <div className="inline-flex flex-wrap justify-center rounded-full border border-[#E8DCC4] bg-white p-1.5 shadow-sm">
            {customTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => changeCustomTab(tab.key)}
                className={[
                  "rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 md:px-8",
                  activeCustomTab === tab.key
                    ? "bg-[#C8A15A] text-white shadow-md"
                    : "text-gray-500 hover:text-[#B88A44]",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          // 장가계 / 백두산 기존 일정 탭
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
              {course4Label} 일정
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
              {course3Label} 일정
            </button>
          </div>
        )}
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
              <div className="relative min-h-[280px] bg-[#F7F3EC]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-contain p-3 transition duration-700 hover:scale-[1.02]"
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
                    {activeCourse === "4N5D" ? course4Label : course3Label}
                  </span>
                </div>

                <h3 className="text-2xl font-bold md:text-3xl">{item.title}</h3>

                <p className="mt-4 leading-7 text-gray-500">
                  {item.description}
                </p>
                {item.schedule && (
                  <div className="mt-6 rounded-2xl border border-[#E8DCC4] bg-[#FCFAF7] p-5">
                    <p className="mb-3 text-sm font-bold text-[#B88A44]">
                      상세 일정
                    </p>

                    <div className="whitespace-pre-line text-[15px] leading-7 text-gray-700">
                      {item.schedule}
                    </div>
                  </div>
                )}
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

                {/* 관광지 세부 사진 */}
                {item.spotImages && item.spotImages.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {item.spotImages.map(
                      (
                        spot: { name: string; image: string },
                        index: number,
                      ) => (
                        <button
                          key={`${spot.name}-${index}`}
                          type="button"
                          onClick={() => setSelectedImage(spot.image)}
                          className="group overflow-hidden rounded-2xl border border-[#ECE7DF] bg-white text-left"
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-[#F7F3EC]">
                            <img
                              src={spot.image}
                              alt={spot.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          </div>

                          <p className="px-3 py-3 text-sm font-semibold text-gray-700">
                            {spot.name}
                          </p>
                        </button>
                      ),
                    )}
                  </div>
                )}
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#F0EAE1] bg-[#FCFAF7] p-5">
                    <p className="mb-3 text-sm font-bold text-[#B88A44]">
                      식사
                    </p>

                    <div className="space-y-3">
                      <MealRow
                        label="조식"
                        mealName={item.meals.breakfast}
                        mealBaseUrl={mealBaseUrl}
                        mealImages={mealImages}
                        onImageClick={setSelectedImage}
                      />

                      <MealRow
                        label="중식"
                        mealName={item.meals.lunch}
                        mealBaseUrl={mealBaseUrl}
                        mealImages={mealImages}
                        onImageClick={setSelectedImage}
                      />

                      <MealRow
                        label="석식"
                        mealName={item.meals.dinner}
                        mealBaseUrl={mealBaseUrl}
                        mealImages={mealImages}
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
  mealBaseUrl,
  mealImages,
  onImageClick,
}: {
  label: string;
  mealName: string;
  mealBaseUrl: string;
  mealImages: Record<string, string>;
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
