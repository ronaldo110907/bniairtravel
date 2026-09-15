"use client";

import { useState } from "react";
import IncludedCard from "@/components/IncludedCard";
import ShoppingSection from "@/components/sections/ShoppingSection";

import {
  type XiamenProductType,
  type ItineraryItem,
  productTabs,
  itineraryValue3N5D,
  itineraryPremium3N5D,
  itineraryValue4N6D,
  itineraryPremium4N6D,
  itineraryWuyishan4N6D,
  itineraryGolf3N5D,
  itineraryGolf4N6D,
  includesValue3,
  excludesValue3,
  includesValue4,
  excludesValue4,
  includesPremium3,
  excludesPremium3,
  includesPremium4,
  excludesPremium4,
  includesWuyishan4,
  excludesWuyishan4,
  includesGolf3,
  excludesGolf3,
  includesGolf4,
  excludesGolf4,
  shoppingXiamen,
  xiamenHotels,
  wuyishanHotels,
  golfImageMap,
} from "@/data/xiamen";

const itineraryMap: Record<XiamenProductType, ItineraryItem[]> = {
  value3: itineraryValue3N5D,
  premium3: itineraryPremium3N5D,
  value4: itineraryValue4N6D,
  premium4: itineraryPremium4N6D,
  wuyishan4: itineraryWuyishan4N6D,
  golf3: itineraryGolf3N5D,
  golf4: itineraryGolf4N6D,
};

const includesMap: Record<XiamenProductType, { id: number; text: string }[]> = {
  value3: includesValue3,
  premium3: includesPremium3,
  value4: includesValue4,
  premium4: includesPremium4,
  wuyishan4: includesWuyishan4,
  golf3: includesGolf3,
  golf4: includesGolf4,
};

const excludesMap: Record<XiamenProductType, { id: number; text: string }[]> = {
  value3: excludesValue3,
  premium3: excludesPremium3,
  value4: excludesValue4,
  premium4: excludesPremium4,
  wuyishan4: excludesWuyishan4,
  golf3: excludesGolf3,
  golf4: excludesGolf4,
};

export default function XiamenProductContent() {
  const [activeType, setActiveType] = useState<XiamenProductType>("value3");

  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const itinerary = itineraryMap[activeType];

  const activeTab = productTabs.find((tab) => tab.id === activeType);

  const includes = includesMap[activeType];
  const excludes = excludesMap[activeType];

  // ==================== 쇼핑 ====================

  const isGolf = activeType === "golf3" || activeType === "golf4";

  const golfCourseNames = Array.from(
    new Set(
      itinerary.flatMap((item) =>
        (item.places ?? []).flatMap((place) => {
          const courses: string[] = [];

          if (place.includes("남태무")) courses.push("남태무 CC");
          if (place.includes("천주")) courses.push("천주 CC");
          if (place.includes("동방")) courses.push("동방 CC");
          if (place.includes("해서")) courses.push("해서 CC");

          return courses;
        }),
      ),
    ),
  );

  const golfCourseGuideMap: Record<string, string | undefined> = {
    "남태무 CC": golfImageMap["남태무 CC"]?.courseGuide,
    "천주 CC": golfImageMap["천주 골프장"]?.courseGuide,
    "동방 CC": golfImageMap["동방 골프장"]?.courseGuide,
    "해서 CC": golfImageMap["해서 골프장"]?.courseGuide,
  };

  const golfCourseGuideNames = isGolf
    ? Array.from(new Set([...golfCourseNames, "해서 CC"]))
    : golfCourseNames;

  const golfCourseCards = [
    {
      name: "남태무 CC",
      image: golfImageMap["남태무 CC"]?.photos?.[0],
      description: `1996년에 개장한 바다와 산을 끼고 있는 18홀 규모의 골프장
7,324야드의 동쪽은 바다, 남쪽으로는 남태무산을 끼고 있습니다.`,
    },
    {
      name: "천주 CC",
      image: golfImageMap["천주 골프장"]?.photos?.[0],
      description: `천주 4대 명산 중 자모산 자락에 위치한 18홀 규모의 골프장
산과 계곡을 따라 설계되어 있으며 도전적인 레이아웃으로 난이도 상급입니다.`,
    },
    {
      name: "동방 CC",
      image: golfImageMap["동방 골프장"]?.photos?.[0],
      description: `1995년에 오픈한 로널드 프림이 설계한 27홀 규모의 명문 골프장
10,665야드, 27홀, 파 108 규모의 골프장입니다.
세계 100대 골프장에 선정된 바 있는 명문 골프장입니다.`,
    },
    {
      name: "해서 CC",
      image: golfImageMap["해서 골프장"]?.photos?.[0],
      description: `골프의 전설 잭 니클라우스가 설계한 18홀 규모의 명문 골프장
      7,206야드, 18홀, 파 72 규모의 골프장입니다.
      중국 10대 골프장으로 선정되었으며 코스 완성도와 잔디관리가 최상의 골프장입니다.`,
    },
  ];

  const shoppingNotice =
    activeType === "premium3" ||
    activeType === "premium4" ||
    activeType === "wuyishan4"
      ? "※ 찻집 · 라텍스 · 침향 중 2곳을 방문합니다. 구매는 고객님의 자율적인 선택이며, 노쇼핑 진행 시 현지비가 추가될 수 있습니다."
      : "※ 찻집 · 라텍스 · 침향 중 2곳을 방문합니다. 구매는 고객님의 자율적인 선택입니다.";

  const hotels = activeType === "wuyishan4" ? wuyishanHotels : xiamenHotels;

  const tabs3N5D = productTabs.filter((tab) =>
    ["value3", "premium3", "golf3"].includes(tab.id),
  );

  const tabs4N6D = productTabs.filter((tab) =>
    ["value4", "wuyishan4", "golf4"].includes(tab.id),
  );

  return (
    <section className="bg-[#faf8f4] px-4 py-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* ==================== 제목 ==================== */}

        <div className="mb-10 text-center">
          <p className="text-sm tracking-[0.4em] text-[#B88A44]">
            TRAVEL ITINERARY
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            샤먼 여행 일정
          </h2>

          <p className="mt-5 text-gray-500">
            실속 관광부터 고품격, 무이산, 골프까지 원하는 여행 코스를
            선택해보세요.
          </p>
        </div>

        {/* ==================== 상품 탭 ==================== */}

        <div className="mb-6 space-y-3">
          {/* 3박5일 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {tabs3N5D.map((tab) => {
              const active = activeType === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveType(tab.id)}
                  className={[
                    "rounded-2xl border px-4 py-4 text-center transition-all duration-300",
                    active
                      ? "border-[#C8A15A] bg-[#C8A15A] text-white shadow-lg"
                      : "border-[#E8DCC4] bg-white text-gray-600 hover:-translate-y-1 hover:border-[#C8A15A] hover:shadow-md",
                  ].join(" ")}
                >
                  <div className="text-sm font-bold md:text-base">
                    {tab.label}
                  </div>

                  <div
                    className={[
                      "mt-1 text-[11px] leading-4 md:text-xs",
                      active ? "text-white/80" : "text-gray-400",
                    ].join(" ")}
                  >
                    {tab.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 4박6일 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tabs4N6D.map((tab) => {
              const active = activeType === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveType(tab.id)}
                  className={[
                    "rounded-2xl border px-4 py-4 text-center transition-all duration-300",
                    active
                      ? "border-[#C8A15A] bg-[#C8A15A] text-white shadow-lg"
                      : "border-[#E8DCC4] bg-white text-gray-600 hover:-translate-y-1 hover:border-[#C8A15A] hover:shadow-md",
                  ].join(" ")}
                >
                  <div className="text-sm font-bold md:text-base">
                    {tab.label}
                  </div>

                  <div
                    className={[
                      "mt-1 text-[11px] leading-4 md:text-xs",
                      active ? "text-white/80" : "text-gray-400",
                    ].join(" ")}
                  >
                    {tab.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================== 선택된 상품 안내 ==================== */}

        <div className="mb-14 text-center">
          <span className="inline-flex rounded-full bg-[#F6F1E8] px-5 py-2 text-sm font-bold text-[#B88A44]">
            {activeTab?.label}
          </span>

          <p className="mt-3 text-sm text-gray-500">{activeTab?.description}</p>
        </div>
        {/* ==================== 골프장 종합 안내 ==================== */}

        {isGolf && (
          <div className="mb-16 rounded-[30px] border border-[#E8DCC4] bg-white px-6 py-8 text-center shadow-sm md:px-10">
            <p className="text-sm font-bold tracking-[0.25em] text-[#B88A44]">
              GOLF COURSE
            </p>

            <h3 className="mt-3 text-2xl font-bold text-[#1f1f1f] md:text-3xl">
              ⛳ {activeType === "golf3" ? "골프 3박5일" : "골프 4박6일"}
            </h3>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {golfCourseCards.map((course) => (
                <div
                  key={course.name}
                  className="overflow-hidden rounded-2xl border border-[#E8DCC4] bg-white shadow-sm"
                >
                  {course.image && (
                    <img
                      src={course.image}
                      alt={course.name}
                      className="h-36 w-full object-cover md:h-40"
                    />
                  )}

                  <div className="p-4">
                    <p className="text-base font-bold text-[#1f1f1f]">
                      ⛳ {course.name}
                    </p>

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-500">
                      {course.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm leading-6 text-gray-500">
              일정에 따라 상기 골프장 중 지정 골프장에서 18홀 라운딩으로
              진행됩니다.
            </p>
          </div>
        )}

        {/* ==================== 관광 지도 ==================== */}

        {!isGolf && (
          <div className="mb-16">
            <div
              className={[
                "grid gap-6",
                activeType === "wuyishan4"
                  ? "md:grid-cols-2"
                  : "mx-auto max-w-4xl",
              ].join(" ")}
            >
              <div className="overflow-hidden rounded-[30px] border border-[#ECE7DF] bg-white p-4 shadow-sm">
                <img
                  src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/xiamenmap.png"
                  alt="하문 관광지 경로 안내"
                  className="w-full rounded-2xl"
                />
              </div>

              {activeType === "wuyishan4" && (
                <div className="overflow-hidden rounded-[30px] border border-[#ECE7DF] bg-white p-4 shadow-sm">
                  <img
                    src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/wuyishanmap.png"
                    alt="무이산 관광 안내도"
                    className="w-full rounded-2xl"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {/* ==================== 일정 ==================== */}

        <div className="relative">
          {/* PC 세로라인 */}

          <div className="absolute left-10 top-0 hidden h-full w-[2px] bg-[#E8DCC4] md:block" />

          <div className="space-y-8 md:space-y-12">
            {itinerary.map((item) => {
              const golfKey = item.places?.find((place) => {
                return (
                  place.includes("남태무") ||
                  place.includes("동방") ||
                  place.includes("해서") ||
                  place.includes("천주")
                );
              });

              const golfImages = golfKey?.includes("남태무")
                ? golfImageMap["남태무 CC"]
                : golfKey?.includes("동방")
                  ? golfImageMap["동방 골프장"]
                  : golfKey?.includes("해서")
                    ? golfImageMap["해서 골프장"]
                    : golfKey?.includes("천주")
                      ? golfImageMap["천주 골프장"]
                      : undefined;

              const golfPlace = golfKey;

              return (
                <article
                  key={`${activeType}-${item.day}`}
                  className="group relative flex gap-5 md:gap-8"
                >
                  {/* DAY 아이콘 */}

                  <div className="relative z-10 hidden h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-[#F6F1E8] bg-[#C8A15A] text-3xl shadow-lg transition duration-300 group-hover:scale-110 md:flex">
                    {item.icon}
                  </div>

                  {/* 일정 카드 */}

                  <div className="min-w-0 flex-1 overflow-hidden rounded-[30px] border border-[#ECE7DF] bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    {/* 이미지가 생기면 자동 노출 */}

                    {item.image && (
                      <div className="relative h-[240px] overflow-hidden md:h-[320px]">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          style={{
                            objectPosition: item.imagePosition || "center",
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        <div className="absolute bottom-5 left-5 text-4xl">
                          {item.icon}
                        </div>
                      </div>
                    )}

                    <div className="p-6 md:p-8">
                      {/* DAY */}

                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#F6F1E8] px-4 py-2 text-sm font-bold text-[#B88A44]">
                          {item.day}
                        </span>

                        {item.duration && (
                          <span className="text-sm font-medium text-gray-400">
                            {item.duration}
                          </span>
                        )}
                      </div>

                      {/* 제목 */}

                      <div className="flex items-center gap-3">
                        {!item.image && (
                          <span className="text-3xl">{item.icon}</span>
                        )}

                        <h3 className="text-xl font-bold leading-snug text-[#1f1f1f] md:text-2xl">
                          {item.title}
                        </h3>
                      </div>

                      {/* 설명 */}

                      <p className="mt-5 whitespace-pre-line leading-8 text-gray-500">
                        {item.description}
                      </p>

                      {/* 상세 일정 */}

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

                      {/* 관광지 */}

                      {item.places && item.places.length > 0 && (
                        <div className="mt-7">
                          <p className="mb-3 text-sm font-bold text-[#B88A44]">
                            주요 일정
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {item.places.map((place) => (
                              <span
                                key={place}
                                className="rounded-full border border-[#E8DCC4] bg-[#FAF8F4] px-4 py-2 text-sm font-medium text-gray-600"
                              >
                                {place}
                              </span>
                            ))}
                          </div>
                          {golfImages?.photos &&
                            golfImages.photos.length > 0 && (
                              <div
                                className={[
                                  "mt-5 grid gap-4",
                                  golfImages.photos.length === 1
                                    ? "grid-cols-1"
                                    : "sm:grid-cols-2",
                                ].join(" ")}
                              >
                                {golfImages.photos.map((image, index) => (
                                  <div
                                    key={image}
                                    className="overflow-hidden rounded-2xl bg-[#FAF8F4]"
                                  >
                                    <img
                                      src={image}
                                      alt={`${golfPlace} ${index + 1}`}
                                      className="h-56 w-full object-cover md:h-64"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      )}

                      {/* 세부 관광 사진 */}

                      {item.spotImages && item.spotImages.length > 0 && (
                        <div className="mt-7 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                          {item.spotImages.map((spot) => (
                            <div
                              key={spot.name}
                              className="overflow-hidden rounded-2xl bg-[#FAF8F4]"
                            >
                              <img
                                src={spot.image}
                                alt={spot.name}
                                className="h-40 w-full object-cover"
                              />

                              <p className="p-3 text-center text-sm font-bold">
                                {spot.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 식사 */}

                      {item.meals && (
                        <div className="mt-8 rounded-2xl bg-[#FAF8F4] p-5">
                          <p className="mb-4 text-sm font-bold text-[#B88A44]">
                            🍽️ MEAL
                          </p>

                          <div className="grid gap-3 text-sm md:grid-cols-3">
                            <MealItem
                              label="조식"
                              value={item.meals.breakfast}
                            />

                            <MealItem label="중식" value={item.meals.lunch} />

                            <MealItem label="석식" value={item.meals.dinner} />
                          </div>
                        </div>
                      )}

                      {/* 호텔 */}

                      {item.hotel && (
                        <div className="mt-4 rounded-2xl border border-[#E8DCC4] bg-white p-5">
                          <p className="text-sm font-bold text-[#B88A44]">
                            🏨 HOTEL
                          </p>

                          <p className="mt-2 text-sm font-semibold leading-6 text-gray-700">
                            {item.hotel}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* ==================== 골프장 변경 안내 ==================== */}

        {(activeType === "golf3" || activeType === "golf4") && (
          <div className="mt-12 rounded-2xl border border-[#d9c5a5] bg-[#fffaf2] p-6">
            <p className="text-lg font-bold text-[#8a642f]">
              ⛳ 하문 명문 골프장 해서CC 변경 안내
            </p>

            <p className="mt-3 leading-7 text-gray-700">
              보다 수준 높은 라운딩을 원하실 경우,
              <strong className="font-bold text-gray-900">
                {" "}
                하문 명문 골프장 해서CC로 변경 가능합니다.
              </strong>
            </p>

            <p className="mt-2 leading-7 text-gray-700">
              CC 변경 시
              <strong className="font-bold text-[#b88a44]">
                {" "}
                {activeType === "golf3"
                  ? "1인 주중 USD 50 / 주말 USD 70 추가"
                  : "1인 주중 USD 50 추가"}
              </strong>
              되며,
              <strong className="font-semibold text-gray-900">
                {" "}
                그린피 · 카트비 · 캐디피가 포함
              </strong>
              됩니다.
            </p>

            <p className="mt-4 text-sm text-gray-500">
              ※ 골프장 사정에 따라 변경 가능 여부 및 추가요금은 달라질 수
              있습니다.
            </p>
          </div>
        )}
        {/* ==================== 골프 코스 안내도 ==================== */}

        {isGolf && (
          <div className="mt-16">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold tracking-[0.3em] text-[#B88A44]">
                GOLF COURSE GUIDE
              </p>

              <h3 className="mt-3 text-3xl font-bold text-[#1f1f1f]">
                ⛳ 골프 코스 안내도
              </h3>

              <p className="mt-3 text-sm text-gray-500">
                이용 예정 골프장의 코스 안내도를 확인해보세요.
              </p>
            </div>

            <div className="space-y-8">
              {golfCourseGuideNames.map((course) => {
                const courseGuide = golfCourseGuideMap[course];

                if (!courseGuide) return null;

                return (
                  <div
                    key={course}
                    className="overflow-hidden rounded-[30px] border border-[#ECE7DF] bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-xl font-bold text-[#1f1f1f]">
                        ⛳ {course}
                      </h4>

                      <span className="text-sm font-semibold text-[#B88A44]">
                        COURSE MAP
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setZoomImage(courseGuide)}
                      className="block w-full overflow-hidden rounded-2xl border border-[#E8DCC4] bg-white"
                    >
                      <img
                        src={courseGuide}
                        alt={`${course} 코스 안내도`}
                        className="w-full transition duration-300 hover:scale-[1.01]"
                      />
                    </button>

                    <p className="mt-3 text-center text-xs text-gray-400">
                      이미지를 클릭하면 크게 볼 수 있습니다.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ==================== 안내 ==================== */}

        <p className="mt-12 text-center text-xs leading-6 text-gray-400 md:text-sm">
          ※ 상기 일정은 항공 및 현지 사정에 따라 변경될 수 있습니다.
        </p>

        {/* ==================== 호텔 ==================== */}

        <div className="mt-20 overflow-hidden rounded-[36px] bg-[#1f1f1f] px-6 py-14 text-white md:px-10">
          <div className="mb-10">
            <p className="mb-3 text-sm tracking-[0.35em] text-[#C8A15A]">
              HOTEL
            </p>

            <h2 className="text-3xl font-bold md:text-4xl">
              5성급 프리미엄 호텔
            </h2>

            <p className="mt-4 leading-7 text-white/60">
              편안한 여행을 위해 엄선된 호텔을 이용합니다.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5"
              >
                {/* 호텔 외관 + 객실 */}
                <div className="grid grid-cols-2 gap-[2px] bg-black">
                  <div className="overflow-hidden">
                    <img
                      src={hotel.image}
                      alt={`${hotel.name} 외관`}
                      className="h-[220px] w-full object-cover transition duration-700 hover:scale-105"
                    />
                  </div>

                  <div className="overflow-hidden">
                    <img
                      src={hotel.roomImage}
                      alt={`${hotel.name} 객실`}
                      className="h-[220px] w-full object-cover transition duration-700 hover:scale-105"
                    />
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm font-semibold text-[#C8A15A]">
                    {hotel.grade}
                  </p>

                  <h3 className="mt-2 text-xl font-bold md:text-2xl">
                    {hotel.name}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {hotel.desc}
                  </p>

                  <div className="mt-4 flex gap-5 text-xs text-white/40">
                    <span>호텔 외관</span>
                    <span>객실 이미지</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-7 text-xs leading-6 text-white/40">
            ※ 호텔은 현지 사정 및 출발일에 따라 동급 호텔로 변경될 수 있습니다.
          </p>
        </div>

        {/* ==================== 포함 / 불포함 ==================== */}

        <IncludedCard includes={includes} excludes={excludes} />

        {/* ==================== 쇼핑 ==================== */}

        <ShoppingSection
          shopping={isGolf ? [] : shoppingXiamen}
          noShopping={isGolf}
          noticeText={shoppingNotice}
        />
      </div>
      {zoomImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            type="button"
            onClick={() => setZoomImage(null)}
            className="absolute right-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-black shadow-lg"
          >
            ✕ 닫기
          </button>

          <img
            src={zoomImage}
            alt="골프 코스 안내도 확대"
            className="max-h-[90vh] max-w-[95vw] rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

function MealItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-gray-400">{label}</span>
      <span className="font-semibold text-gray-700">{value || "-----"}</span>
    </div>
  );
}
