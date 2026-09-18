"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Course = "premium3" | "wuyishan4";

const WEBTOON_BASE_URL =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/webtoon/";

const webtoonData: Record<
  Course,
  {
    label: string;
    subtitle: string;
    images: string[];
  }
> = {
  premium3: {
    label: "고품격 3박5일",
    subtitle: "하문의 매력을 여유롭게 즐기는 프리미엄 여행",
    images: [
      `${WEBTOON_BASE_URL}xiamen3n5d1.png`,
      `${WEBTOON_BASE_URL}xiamen3n5d2.png`,
      `${WEBTOON_BASE_URL}xiamen3n5d3.png`,
      `${WEBTOON_BASE_URL}xiamen3n5d4.png`,
      `${WEBTOON_BASE_URL}xiamen3n5d5.png`,
    ],
  },

  wuyishan4: {
    label: "무이산 4박6일",
    subtitle: "하문에서 무이산까지 이어지는 특별한 원정",
    images: [
      `${WEBTOON_BASE_URL}xiamen4n6d1.png`,
      `${WEBTOON_BASE_URL}xiamen4n6d2.png`,
      `${WEBTOON_BASE_URL}xiamen4n6d3.png`,
      `${WEBTOON_BASE_URL}xiamen4n6d4.png`,
      `${WEBTOON_BASE_URL}xiamen4n6d5.png`,
      `${WEBTOON_BASE_URL}xiamen4n6d6.png`,
    ],
  },
};

export default function XiamenWebtoonPage() {
  const [course, setCourse] = useState<Course>("premium3");
  const [day, setDay] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCourse = params.get("course");

    if (requestedCourse === "wuyishan4") {
      setCourse("wuyishan4");
    } else {
      setCourse("premium3");
    }

    setDay(0);
  }, []);

  const changeCourse = (nextCourse: Course) => {
    setCourse(nextCourse);
    setDay(0);

    const url = new URL(window.location.href);
    url.searchParams.set("course", nextCourse);
    window.history.replaceState({}, "", url.toString());
  };

  const current = webtoonData[course];
  const images = current.images;

  return (
    <main className="min-h-screen bg-[#F7F3EC] px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto max-w-5xl">
        {/* 뒤로가기 */}
        <div className="mb-8">
          <Link
            href="/xiamen"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-[#B88A44]"
          >
            ← 하문 상품으로 돌아가기
          </Link>
        </div>

        {/* 제목 */}
        <div className="mb-10 text-center">
          <p className="text-sm font-bold tracking-[0.35em] text-[#B88A44]">
            TRAVEL WEBTOON
          </p>

          <h1 className="mt-4 text-4xl font-bold text-[#1f1f1f] md:text-5xl">
            하문원정대
          </h1>

          <p className="mt-4 text-gray-500">웹툰으로 미리 떠나는 하문 여행</p>
        </div>

        {/* 코스 선택 */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full border border-[#E8DCC4] bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => changeCourse("premium3")}
              className={`rounded-full px-5 py-3 text-sm font-bold transition md:px-8 ${
                course === "premium3"
                  ? "bg-[#C8A15A] text-white shadow-md"
                  : "text-gray-500 hover:text-[#B88A44]"
              }`}
            >
              고품격 3박5일
            </button>

            <button
              type="button"
              onClick={() => changeCourse("wuyishan4")}
              className={`rounded-full px-5 py-3 text-sm font-bold transition md:px-8 ${
                course === "wuyishan4"
                  ? "bg-[#C8A15A] text-white shadow-md"
                  : "text-gray-500 hover:text-[#B88A44]"
              }`}
            >
              무이산 4박6일
            </button>
          </div>
        </div>

        {/* 현재 코스 안내 */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#1f1f1f]">{current.label}</h2>

          <p className="mt-2 text-sm text-gray-500">{current.subtitle}</p>
        </div>

        {/* DAY 선택 */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setDay(index)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                day === index
                  ? "bg-[#C8A15A] text-white shadow-md"
                  : "border border-[#E8DCC4] bg-white text-gray-600 shadow-sm hover:border-[#C8A15A]"
              }`}
            >
              DAY {index + 1}
            </button>
          ))}
        </div>

        {/* 웹툰 이미지 */}
        <div className="overflow-hidden rounded-[30px] border border-[#E8DCC4] bg-white p-2 shadow-xl md:p-4">
          <img
            src={images[day]}
            alt={`${current.label} DAY ${day + 1} 웹툰`}
            className="h-auto w-full rounded-[22px]"
          />
        </div>

        {/* 이전 / 다음 */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={day === 0}
            onClick={() => setDay((currentDay) => currentDay - 1)}
            className="rounded-xl border border-[#E8DCC4] bg-white px-5 py-3 text-sm font-bold text-gray-600 shadow-sm transition hover:border-[#C8A15A] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← 이전 DAY
          </button>

          <span className="text-sm font-bold text-[#B88A44]">
            DAY {day + 1} / {images.length}
          </span>

          <button
            type="button"
            disabled={day === images.length - 1}
            onClick={() => setDay((currentDay) => currentDay + 1)}
            className="rounded-xl border border-[#E8DCC4] bg-white px-5 py-3 text-sm font-bold text-gray-600 shadow-sm transition hover:border-[#C8A15A] disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음 DAY →
          </button>
        </div>

        {/* 하단 */}
        <div className="mt-12 text-center">
          <Link
            href="/xiamen"
            className="inline-flex rounded-full bg-[#1f1f1f] px-7 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            하문 상품 일정으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
