"use client";

import { useState } from "react";

import Timeline from "@/components/Timeline";
import HotelCard from "@/components/HotelCard";
import IncludedCard from "@/components/IncludedCard";
import ShoppingSection from "@/components/sections/ShoppingSection";

import {
  itineraryPremium,
  itineraryQuality,
  itineraryValue,
  itineraryGolf,
  hotelsPremium,
  hotelsQuality,
  hotelsValue,
  hotelsGolf,
  includesPremium,
  excludesPremium,
  includesQuality,
  excludesQuality,
  includesValue,
  excludesValue,
  includesGolf,
  excludesGolf,
  shoppingPremium,
  shoppingQuality,
  shoppingValue,
  shoppingGolf,
  flightInfo,
  mealBaseUrl,
  mealImages,
} from "@/data/phuquoc";

type ProductTab = "premium" | "quality" | "value" | "golf";

export default function PhuQuocProductContent() {
  const [activeTab, setActiveTab] = useState<ProductTab>("premium");
  const hotels =
    activeTab === "premium"
      ? hotelsPremium
      : activeTab === "quality"
        ? hotelsQuality
        : activeTab === "value"
          ? hotelsValue
          : hotelsGolf;

  const hotelTitle =
    activeTab === "premium"
      ? "5성급 프리미엄 호텔"
      : activeTab === "quality"
        ? "4성급 품격 호텔"
        : activeTab === "value"
          ? "4성급 실속 호텔"
          : "4성급 골프 호텔";

  const hotelDescription =
    activeTab === "premium"
      ? "최상의 휴식을 위한 5성급 프리미엄 호텔에서 편안하고 여유로운 숙박을 제공합니다."
      : activeTab === "quality"
        ? "관광과 휴양을 편리하게 즐길 수 있는 쾌적한 4성급 호텔을 이용합니다."
        : activeTab === "value"
          ? "합리적인 일정과 편안한 휴식을 고려한 4성급 호텔을 이용합니다."
          : "골프 라운딩 후 편안하게 휴식할 수 있는 쾌적한 4성급 호텔을 이용합니다.";

  const shopping =
    activeTab === "premium"
      ? shoppingPremium
      : activeTab === "quality"
        ? shoppingQuality
        : activeTab === "value"
          ? shoppingValue
          : shoppingGolf;

  const includes =
    activeTab === "premium"
      ? includesPremium
      : activeTab === "quality"
        ? includesQuality
        : activeTab === "value"
          ? includesValue
          : includesGolf;

  const excludes =
    activeTab === "premium"
      ? excludesPremium
      : activeTab === "quality"
        ? excludesQuality
        : activeTab === "value"
          ? excludesValue
          : excludesGolf;

  return (
    <div>
      {/* 다음 단계에서 일정 / 호텔 / 포함·불포함 / 쇼핑 연결 */}
      <Timeline
        customTabs={[
          {
            key: "premium",
            label: "고품격",
            itinerary: itineraryPremium,
          },
          {
            key: "quality",
            label: "품격",
            itinerary: itineraryQuality,
          },
          {
            key: "value",
            label: "실속",
            itinerary: itineraryValue,
          },
          {
            key: "golf",
            label: "골프",
            itinerary: itineraryGolf,
          },
        ]}
        activeCustomTab={activeTab}
        onCustomTabChange={(key) => setActiveTab(key as ProductTab)}
        description="푸꾸옥의 핵심 관광지를 여유롭게 즐기는 3박5일 일정"
        mealBaseUrl={mealBaseUrl}
        mealImages={mealImages}
        flightInfo={flightInfo}
      />

      <HotelCard
        title={hotelTitle}
        description={hotelDescription}
        baseUrl="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/hotel/phuquoc/"
        hotels={hotels}
      />
      <IncludedCard includes={includes} excludes={excludes} />
      <ShoppingSection shopping={shopping} showNotice={false} />
    </div>
  );
}
