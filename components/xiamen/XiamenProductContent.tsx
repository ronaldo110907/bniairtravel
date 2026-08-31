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
  itineraryPremium4N6D,
  itineraryWuyishan4N6D,
  itineraryGolf3N5D,
  itineraryGolf4N6D,
  includesValue3,
  excludesValue3,
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
} from "@/data/xiamen";

const itineraryMap: Record<XiamenProductType, ItineraryItem[]> = {
  value3: itineraryValue3N5D,
  premium3: itineraryPremium3N5D,
  premium4: itineraryPremium4N6D,
  wuyishan4: itineraryWuyishan4N6D,
  golf3: itineraryGolf3N5D,
  golf4: itineraryGolf4N6D,
};

const includesMap: Record<XiamenProductType, { id: number; text: string }[]> = {
  value3: includesValue3,
  premium3: includesPremium3,
  premium4: includesPremium4,
  wuyishan4: includesWuyishan4,
  golf3: includesGolf3,
  golf4: includesGolf4,
};

const excludesMap: Record<XiamenProductType, { id: number; text: string }[]> = {
  value3: excludesValue3,
  premium3: excludesPremium3,
  premium4: excludesPremium4,
  wuyishan4: excludesWuyishan4,
  golf3: excludesGolf3,
  golf4: excludesGolf4,
};

export default function XiamenProductContent() {
  const [activeType, setActiveType] = useState<XiamenProductType>("value3");

  const itinerary = itineraryMap[activeType];

  const activeTab = productTabs.find((tab) => tab.id === activeType);

  const includes = includesMap[activeType];
  const excludes = excludesMap[activeType];

  // ==================== 쇼핑 ====================

  const isGolf = activeType === "golf3" || activeType === "golf4";

  const shoppingNotice =
    activeType === "premium3" ||
    activeType === "premium4" ||
    activeType === "wuyishan4"
      ? "※ 찻집 · 라텍스 · 침향 중 2곳을 방문합니다. 구매는 고객님의 자율적인 선택이며, 노쇼핑 진행 시 현지비가 추가될 수 있습니다."
      : "※ 찻집 · 라텍스 · 침향 중 2곳을 방문합니다. 구매는 고객님의 자율적인 선택입니다.";

  const hotels = activeType === "wuyishan4" ? wuyishanHotels : xiamenHotels;

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

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {productTabs.map((tab) => {
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

        {/* ==================== 선택된 상품 안내 ==================== */}

        <div className="mb-14 text-center">
          <span className="inline-flex rounded-full bg-[#F6F1E8] px-5 py-2 text-sm font-bold text-[#B88A44]">
            {activeTab?.label}
          </span>

          <p className="mt-3 text-sm text-gray-500">{activeTab?.description}</p>
        </div>
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
            {itinerary.map((item) => (
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
                          <MealItem label="조식" value={item.meals.breakfast} />

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
            ))}
          </div>
        </div>

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
