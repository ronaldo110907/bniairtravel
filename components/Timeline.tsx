"use client";

import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

import {
  itinerary4N5D,
  itinerary3N4D,
} from "@/data/zhangjiajie";

export default function Timeline() {
  const [activeCourse, setActiveCourse] = useState<"4N5D" | "3N4D">("4N5D");

  const itinerary =
    activeCourse === "4N5D" ? itinerary4N5D : itinerary3N4D;

  return (
    <section className="mx-auto max-w-6xl py-24">
      <div className="mb-10 text-center">
        <p className="text-sm tracking-[0.4em] text-[#B88A44]">
          TRAVEL ITINERARY
        </p>

        <h2 className="mt-4 text-4xl font-bold md:text-5xl">
          여행 일정
        </h2>

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

                <h3 className="text-2xl font-bold md:text-3xl">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-500">
                  {item.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {item.places.map((place) => (
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
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>조식 · {item.meals.breakfast}</p>
                      <p>중식 · {item.meals.lunch}</p>
                      <p>석식 · {item.meals.dinner}</p>
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
        ※ 현지 사정 및 항공 일정에 따라 관광 순서와 식사, 호텔은 변경될 수 있습니다.
      </p>
    </section>
  );
}
