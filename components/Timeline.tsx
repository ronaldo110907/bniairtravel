"use client";

import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

type ItineraryItem = {
  day: string;
  icon: string;
  title: string;
  description: string;
  image: string;
  places: string[];
  duration: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    breakfastImage: string;
    lunchImage: string;
    dinnerImage: string;
  };
  hotel: string;
};

const itinerary4N5D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 장가계 도착",
    description:
      "청주공항 출발 후 장가계에 도착하여 칠성산 관광과 호텔 체크인을 진행합니다.",
    image: "/images/zhangjiajie/7sungsan.jpg",
    places: ["청주공항", "장가계공항", "칠성산", "유리전망대", "잔도"],
    duration: "약 6~7시간",
    meals: {
      breakfast: "불포함",
      lunch: "김밥+생수",
      dinner: "오리모듬",
      breakfastImage: "/images/meals/breakfast.jpg",
      lunchImage: "/images/meals/gibbap.jpg",
      dinnerImage: "/images/meals/duck.png",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 2",
    icon: "🏔️",
    title: "황룡동굴 · 대협곡",
    description:
      "황룡동굴을 둘러보고 대협곡 유리다리, 트레킹, 유람선 코스를 체험합니다.",
    image: "/images/zhangjiajie/detail-3.jpg",
    places: ["황룡동굴", "대협곡 유리다리", "트레킹", "유람선"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "산채비빔밥",
      dinner: "누룽지 닭백숙",
      breakfastImage: "/images/meals/breakfast.jpg",
      lunchImage: "/images/meals/bibimbap.png",
      dinnerImage: "/images/meals/chikean.png",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 3",
    icon: "🌄",
    title: "천자산 · 원가계",
    description:
      "천자산 케이블카와 백룡엘리베이터를 이용해 원가계의 대표 절경을 감상합니다.",
    image: "/images/zhangjiajie/chunjasan.jpg",
    places: ["천자산", "원가계", "백룡엘리베이터", "천하제일교", "미혼대", "십리화랑"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "버석 샤브샤브",
      dinner: "삼겹살 무제한",
      breakfastImage: "/images/meals/breakfast.jpg",
      lunchImage: "/images/meals/mushroom.png",
      dinnerImage: "/images/meals/samgyeopsal.png",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 4",
    icon: "🌿",
    title: "보봉호수 · 천문산 · 천문호선쇼",
    description:
      "보봉호수와 천문산 핵심 코스를 둘러보고 저녁에는 천문호선쇼를 관람합니다.",
    image: "/images/zhangjiajie/detail-2.jpg",
    places: ["보봉호수", "천문산", "천문동", "귀곡잔도", "유리잔도", "천문호선쇼", "72기루"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "보쌈정식",
      dinner: "소고기 특식",
      breakfastImage: "/images/meals/breakfast.jpg",
      lunchImage: "/images/meals/bossam.png",
      dinnerImage: "/images/meals/beef.png",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 5",
    icon: "🛬",
    title: "군성사석화 · 청주공항 도착",
    description:
      "군성사석화 관람 후 장가계공항으로 이동하여 청주행 항공편에 탑승합니다.",
    image: "/images/zhangjiajie/gunsung.jpg",
    places: ["군성사석화", "장가계공항", "청주공항"],
    duration: "약 5~6시간",
    meals: {
      breakfast: "호텔식",
      lunch: "한식",
      dinner: "-----",
      breakfastImage: "/images/meals/breakfast.jpg",
      lunchImage: "/images/meals/gibbap.jpg",
      dinnerImage: "/images/meals/gibbap.jpg",
    },
    hotel: "해당 없음",
  },
];

const itinerary3N4D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 장가계 도착",
    description:
      "청주공항 출발 후 장가계에 도착하여 대협곡 유리다리 코스를 관광합니다.",
    image: "/images/zhangjiajie/detail-3.jpg",
    places: ["청주공항", "장가계공항", "대협곡", "유리다리"],
    duration: "약 6~7시간",
    meals: {
      breakfast: "불포함",
      lunch: "김밥+생수",
      dinner: "오리모듬",
      breakfastImage: "/images/meals/breakfast.jpg",
      lunchImage: "/images/meals/gibbap.jpg",
      dinnerImage: "/images/meals/duck.png",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 2",
    icon: "🏔️",
    title: "황룡동굴 · 천자산 · 원가계",
    description:
      "황룡동굴과 천자산, 원가계 핵심 절경을 하루 동안 집중적으로 둘러봅니다.",
    image: "/images/zhangjiajie/chunjasan.jpg",
    places: ["황룡동굴", "천자산", "원가계", "천하제일교", "미혼대", "백룡엘리베이터", "십리화랑", "72기루"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "산채비빔밥",
      dinner: "삼겹살 무제한",
      breakfastImage: "/images/meals/breakfast.jpg",
      lunchImage: "/images/meals/mushroom.png",
      dinnerImage: "/images/meals/samgyeopsal.png",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 3",
    icon: "🌄",
    title: "보봉호수 · 천문산 · 천문호선쇼",
    description:
      "보봉호수 VIP 코스와 천문산 핵심 코스를 관광하고 천문호선쇼를 관람합니다.",
    image: "/images/zhangjiajie/detail-2.jpg",
    places: ["보봉호수", "천문산", "귀곡잔도", "유리잔도", "천문동", "천문호선쇼"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "소고기 특식",
      dinner: "누룽지 닭백숙",
      breakfastImage: "/images/meals/breakfast.jpg",
      lunchImage: "/images/meals/bibimbap.png",
      dinnerImage: "/images/meals/chikean.png",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 4",
    icon: "🛬",
    title: "군성사석화 · 청주공항 도착",
    description:
      "군성사석화 관람 후 장가계공항으로 이동하여 청주행 항공편에 탑승합니다.",
    image: "/images/zhangjiajie/gunsung.jpg",
    places: ["군성사석화", "장가계공항", "청주공항"],
    duration: "약 5~6시간",
    meals: {
      breakfast: "호텔식",
      lunch: "버섯 샤브샤브",
      dinner: "-----",
      breakfastImage: "/images/meals/breakfast.jpg",
      lunchImage: "/images/meals/gibbap.jpg",
      dinnerImage: "/images/meals/gibbap.jpg",
    },
    hotel: "해당 없음",
  },
];

export default function Timeline() {
  const [activeCourse, setActiveCourse] = useState<"4N5D" | "3N4D">("4N5D");
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

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
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {label:"조식",name:item.meals.breakfast,img:item.meals.breakfastImage},
                        {label:"중식",name:item.meals.lunch,img:item.meals.lunchImage},
                        {label:"석식",name:item.meals.dinner,img:item.meals.dinnerImage},
                      ].map(meal=>(
                        <div key={meal.label} className="overflow-hidden rounded-xl border bg-white">
                          {(meal.name === "불포함" || meal.name === "-----") ? (
                            <div className="flex h-20 w-full flex-col items-center justify-center bg-gray-100 text-gray-500">
                              <div className="text-3xl">🍽️</div>
                              <div className="mt-1 text-xs font-semibold">식사 없음</div>
                            </div>
                          ) : (
                            <img
                              src={meal.img}
                              alt={meal.name}
                              onClick={() =>
                                setSelectedImage({
                                  src: meal.img,
                                  title: `${meal.label} · ${meal.name}`,
                                })
                              }
                              className="h-20 w-full cursor-pointer object-cover transition hover:scale-105"
                            />
                          )}
                          <div className="p-2">
                            <p className="text-[11px] font-bold text-[#B88A44]">{meal.label}</p>
                            <p className="mt-1 text-xs">{meal.name}</p>
                          </div>
                        </div>
                      ))}
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
      <ImageLightbox
        open={selectedImage !== null}
        image={selectedImage?.src ?? ""}
        title={selectedImage?.title}
        onClose={() => setSelectedImage(null)}
      />
    </section>
  );
}
