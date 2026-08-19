"use client";

import { useState } from "react";
import Timeline from "@/components/Timeline";

import {
  itineraryGuilin3N5D,
  itineraryGuilin4N6D,
  itineraryChenzhou3N5D,
  itineraryChenzhou4N6D,
  mealBaseUrl,
  mealImages,
  flightInfo,
} from "@/data/guilin";

type Region = "guilin" | "chenzhou";

export default function GuilinTimelineTabs() {
  const [region, setRegion] = useState<Region>("guilin");

  const itinerary3N5D =
    region === "guilin" ? itineraryGuilin3N5D : itineraryChenzhou3N5D;

  const itinerary4N6D =
    region === "guilin" ? itineraryGuilin4N6D : itineraryChenzhou4N6D;

  return (
    <div>
      {/* 지역 선택 */}
      <div className="mx-auto mb-8 flex max-w-5xl justify-center gap-3">
        <button
          type="button"
          onClick={() => setRegion("guilin")}
          className={`rounded-xl px-6 py-3 font-bold transition ${
            region === "guilin"
              ? "bg-blue-600 text-white shadow-lg"
              : "border bg-white text-gray-700"
          }`}
        >
          계림 · 양삭
        </button>

        <button
          type="button"
          onClick={() => setRegion("chenzhou")}
          className={`rounded-xl px-6 py-3 font-bold transition ${
            region === "chenzhou"
              ? "bg-blue-600 text-white shadow-lg"
              : "border bg-white text-gray-700"
          }`}
        >
          계림 · 천저우
        </button>
      </div>
      {/* 지역별 관광 지도 */}
      {region === "guilin" ? (
        <div className="mx-auto mb-16 max-w-4xl px-4">
          <img
            src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/guilin/guilinmap.png"
            alt="계림 관광 지도"
            className="w-full rounded-[36px] shadow-xl"
          />
        </div>
      ) : (
        <div className="mx-auto mb-16 max-w-4xl space-y-10 px-4">
          <img
            src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/guilin/mangsanmap.png"
            alt="망산 관광 지도"
            className="w-full rounded-[36px] shadow-xl"
          />

          <img
            src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/guilin/gaoyilingmap.png"
            alt="고의령 풍경구 안내도"
            className="w-full rounded-[36px] shadow-xl"
          />
        </div>
      )}

      {/* 기존 일정 컴포넌트 */}
      <Timeline
        itinerary4N5D={itinerary4N6D}
        itinerary3N4D={itinerary3N5D}
        course4Label="4박6일"
        course3Label="3박5일"
        mealBaseUrl={mealBaseUrl}
        mealImages={mealImages}
        flightInfo={flightInfo}
      />
    </div>
  );
}
