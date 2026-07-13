"use client";

import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";

const preparationItems = [
  {
    icon: "🛂",
    title: "여권",
    description: "출발일 기준 유효기간이 6개월 이상 남아있는 여권을 준비해주세요.",
  },
  {
    icon: "💴",
    title: "환전",
    description: "개인 경비와 매너팁을 위해 위안화 또는 소액의 현금을 준비해주세요.",
  },
  {
    icon: "👟",
    title: "편한 신발",
    description: "산악 관광과 도보 이동이 많아 미끄럽지 않은 운동화를 권장합니다.",
  },
  {
    icon: "🧥",
    title: "계절 의류",
    description: "산 정상은 기온 차가 크므로 얇은 겉옷과 우산 또는 우비를 준비해주세요.",
  },
  {
    icon: "💊",
    title: "상비약",
    description: "평소 복용하는 약과 소화제, 진통제, 멀미약 등을 준비해주세요.",
  },
  {
    icon: "🔌",
    title: "충전용품",
    description: "휴대전화 충전기와 보조배터리를 준비하고 항공기 반입 규정을 확인해주세요.",
  },
  {
    icon: "🧴",
    title: "개인용품",
    description: "세면도구, 선크림, 모자, 선글라스 등 개인 위생용품을 챙겨주세요.",
  },
  {
    icon: "📄",
    title: "여행 안내문",
    description: "출발 전 전달되는 미팅 장소와 최종 일정표를 반드시 확인해주세요.",
  },
];

export default function PreparationSection() {
  const [open,setOpen]=useState(false);
  return (
    <section className="bg-[#FCFAF7] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-sm tracking-[0.35em] text-[#B88A44]">
            TRAVEL CHECKLIST
          </p>

          <h2 className="mt-3 text-4xl font-bold md:text-5xl">
            여행 전 꼭 확인하세요
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-500">
            여권, 보조배터리 기내반입 규정 등 출발 전 반드시 확인해 주세요.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {preparationItems.map((item) => (
            <article
              key={item.title}
              className="group rounded-[28px] border border-[#ECE7DF] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C8A15A]/50 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F1E8] text-2xl transition duration-300 group-hover:scale-110 group-hover:bg-[#C8A15A]">
                {item.icon}
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#222]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        
<div className="mt-10">
  <div className="rounded-[28px] border border-[#E8DCC4] bg-white p-7">
    <p className="text-sm font-bold text-[#B88A44]">출발 전 확인</p>
    <p className="mt-3 leading-7 text-gray-600">
      항공편, 미팅 시간 및 최종 일정은 출발 전 전달되는 안내문을 기준으로 확인해 주세요.
    </p>
  </div>

  <div className="mt-8 overflow-hidden rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-sm">
    <img
      src="/images/battery.jpg"
      alt="보조배터리 안내"
      onClick={() => setOpen(true)}
      className="w-full cursor-pointer rounded-2xl transition hover:scale-[1.01]"
    />
    <p className="mt-4 text-center text-sm text-gray-500">
      ※ 국토교통부 · 한국교통안전공단 기내 반입 안내 기준
    </p>
  </div>

  <ImageLightbox
    open={open}
    image="/images/battery.jpg"
    title="보조배터리 기내 반입 안내"
    onClose={() => setOpen(false)}
  />
</div>
      </div>
    </section>
  );
}
