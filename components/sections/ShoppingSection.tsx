"use client";

import { useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import { shopping } from "@/data/zhangjiajie";

export default function ShoppingSection() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-7xl py-24">
      <div className="mb-14 text-center">
        <p className="text-sm tracking-[0.35em] text-[#B88A44]">
          SHOPPING INFORMATION
        </p>
        <h2 className="mt-3 text-4xl font-bold">쇼핑센터 안내</h2>
        <p className="mt-4 text-gray-500">
          본 상품에는 아래 쇼핑센터 방문 일정이 포함되어 있습니다.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-5 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {shopping.map((shop) => (
          <div
            key={shop.id}
            className="overflow-hidden rounded-3xl border border-[#ECE7DF] bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
          >
            <img
              src={shop.image}
              alt={shop.title}
              onClick={() => setSelected(shop.image)}
              className="h-60 w-full cursor-pointer object-cover transition duration-300 hover:scale-105"
            />

            <div className="p-6">
              <h3 className="text-2xl font-bold">{shop.title}</h3>
              <p className="mt-3 leading-8 text-gray-600">{shop.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-[#FCFAF7] p-6 text-sm leading-7 text-gray-600">
        ※ 쇼핑센터 방문은 여행 일정에 포함되어 있으며, 구매는 고객님의 자율적인 선택입니다.
      </div>

      <ImageLightbox
        open={selected !== null}
        image={selected ?? ""}
        title="쇼핑센터"
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
