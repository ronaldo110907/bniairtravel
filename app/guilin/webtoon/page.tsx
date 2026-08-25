"use client";

import { useState } from "react";
import Link from "next/link";

type Course = "3n5d" | "4n6d";

const WEBTOON_BASE_URL =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/guilin/webtoon/";

const webtoons: Record<Course, string[]> = {
  "3n5d": [
    "guilin3n5d1.png",
    "guilin3n5d2.png",
    "guilin3n5d3.png",
    "guilin3n5d4.png",
    "guilin3n5d5.png",
  ],
  "4n6d": [
    "guilin4n6d1.png",
    "guilin4n6d2.png",
    "guilin4n6d3.png",
    "guilin4n6d4.png",
    "guilin4n6d5.png",
    "guilin4n6d6.png",
  ],
};

export default function GuilinWebtoonPage() {
  const [course, setCourse] = useState<Course>("3n5d");
  const [day, setDay] = useState(0);

  const images = webtoons[course];

  const changeCourse = (nextCourse: Course) => {
    setCourse(nextCourse);
    setDay(0);
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* 상품으로 돌아가기 */}
        <Link
          href="/guilin"
          className="mb-8 inline-flex text-sm font-semibold text-gray-500 transition hover:text-gray-900"
        >
          ← 계림 상품으로 돌아가기
        </Link>

        {/* 제목 */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-amber-600">
            TRAVEL WEBTOON
          </p>

          <h1 className="text-3xl font-black text-gray-900 md:text-5xl">
            웹툰으로 떠나는 계림 · 양삭
          </h1>

          <p className="mt-4 text-sm text-gray-500 md:text-base">
            계림 · 양삭 여행의 하루하루를 재미있는 웹툰으로 만나보세요.
          </p>
        </div>

        {/* 코스 선택 */}
        <div className="mb-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => changeCourse("3n5d")}
            className={`rounded-full px-6 py-3 text-sm font-bold transition ${
              course === "3n5d"
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-white text-gray-600 shadow"
            }`}
          >
            3박 5일
          </button>

          <button
            type="button"
            onClick={() => changeCourse("4n6d")}
            className={`rounded-full px-6 py-3 text-sm font-bold transition ${
              course === "4n6d"
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-white text-gray-600 shadow"
            }`}
          >
            4박 6일
          </button>
        </div>

        {/* DAY 선택 */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setDay(index)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                day === index
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-600 shadow-sm"
              }`}
            >
              DAY {index + 1}
            </button>
          ))}
        </div>

        {/* 웹툰 */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <img
            src={`${WEBTOON_BASE_URL}${images[day]}`}
            alt={`계림 · 양삭 ${
              course === "3n5d" ? "3박 5일" : "4박 6일"
            } DAY ${day + 1} 웹툰`}
            className="h-auto w-full"
          />
        </div>

        {/* 이전 / 다음 */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            disabled={day === 0}
            onClick={() => setDay((current) => current - 1)}
            className="rounded-xl bg-white px-5 py-3 font-bold text-gray-700 shadow disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← 이전 DAY
          </button>

          <span className="text-sm font-bold text-gray-400">
            {day + 1} / {images.length}
          </span>

          <button
            type="button"
            disabled={day === images.length - 1}
            onClick={() => setDay((current) => current + 1)}
            className="rounded-xl bg-white px-5 py-3 font-bold text-gray-700 shadow disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음 DAY →
          </button>
        </div>
      </div>
    </main>
  );
}
