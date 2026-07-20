"use client";

import { useEffect, useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export default function PreparationSection() {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("preparations")
      .select("*")
      .order("sort");

    setItems(data || []);
  }

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
            출발 전 반드시 확인해야 할 여행 준비사항입니다.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-[28px] border border-[#ECE7DF] bg-white p-7 shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F1E8] text-2xl">
                {item.icon}
              </div>

              <h3 className="mt-6 text-xl font-bold">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-[#E8DCC4] bg-white p-7">
          <p className="text-sm font-bold text-[#B88A44]">
            출발 전 확인
          </p>
          <p className="mt-3 leading-7 text-gray-600">
            항공편, 미팅 시간 및 최종 일정은 출발 전 전달되는 안내문을 기준으로 확인해 주세요.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-sm">
          <img
            src="/images/battery.jpg"
            alt="보조배터리 안내"
            onClick={() => setOpen(true)}
            className="w-full cursor-pointer rounded-2xl"
          />
        </div>

        <ImageLightbox
          open={open}
          image="/images/battery.jpg"
          title="보조배터리 기내 반입 안내"
          onClose={() => setOpen(false)}
        />
      </div>
    </section>
  );
}
