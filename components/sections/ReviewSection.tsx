"use client";

import { useEffect, useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import { reviews } from "@/data/zhangjiajie";

export default function ReviewSection() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((v) => (v + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setIndex((v) => (v - 1 + reviews.length) % reviews.length);
  const next = () => setIndex((v) => (v + 1) % reviews.length);

  return (
    <section className="mx-auto max-w-7xl py-24">
      <div className="text-center">
        <p className="tracking-[0.35em] text-[#B88A44] text-sm">CUSTOMER REVIEW</p>
        <h2 className="mt-3 text-4xl font-bold">고객 후기</h2>
        <div className="mt-6 flex justify-center gap-10">
          <div>
            <div className="text-4xl font-bold text-[#C8A15A]">9.8</div>
            <div className="text-gray-500">평균 만족도</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#C8A15A]">1,200+</div>
            <div className="text-gray-500">누적 고객</div>
          </div>
        </div>
      </div>

      <div className="relative mt-12">
        <button onClick={prev} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow">‹</button>
        <button onClick={next} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow">›</button>

        <div className="grid gap-6 md:grid-cols-3">
          {[0,1,2].map((offset)=>{
            const item=reviews[(index+offset)%reviews.length];
            return(
              <div key={item.name+item.date} className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  onClick={()=>setSelected(item.image)}
                  className="h-64 w-full cursor-pointer object-cover transition hover:scale-105"
                />
                <div className="p-6">
                  <div className="text-[#E7B416] text-lg">★★★★★</div>
                  <p className="mt-4 leading-7 text-gray-600">"{item.text}"</p>
                  <div className="mt-6 border-t pt-4">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.date}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ImageLightbox
        open={selected!==null}
        image={selected ?? ""}
        title="고객 후기"
        onClose={()=>setSelected(null)}
      />
    </section>
  );
}
