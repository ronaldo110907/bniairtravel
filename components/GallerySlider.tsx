"use client";

import { useMemo, useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";


export default function GallerySlider({ product }: { product:any }) {
  const [active, setActive] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const galleryImages = useMemo(() => product?.gallery ?? [], [product]);

  const current = galleryImages[active];

  if (!current) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14">
        <p className="mb-3 text-sm tracking-[0.35em] text-[#b88a44]">
          PHOTO GALLERY
        </p>

        <h2 className="text-4xl font-bold md:text-5xl">
          {product?.title ?? "여행지"} 갤러리
        </h2>

        <p className="mt-5 max-w-2xl leading-7 text-black/55">
          압도적인 자연 풍경과 여행의 감동을 미리 만나보세요.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <button
          type="button"
          onClick={() =>
            setSelectedImage({
              src: current.src,
              title: current.title,
            })
          }
          className="group relative overflow-hidden rounded-[36px] bg-black text-left shadow-xl"
          aria-label={`${current.title} 이미지 크게 보기`}
        >
          <img
            src={current.src}
            alt={current.title}
            className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105 md:h-[560px]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-8 md:left-8">
            <p className="mb-2 text-sm tracking-[0.25em] text-white/60">
              {product?.title?.toUpperCase?.() ?? "TRAVEL"}
            </p>

            <h3 className="text-3xl font-bold md:text-4xl">
              {current.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/75 md:text-base">
              {current.desc}
            </p>
          </div>
        </button>

        <div className="grid gap-4">
          {galleryImages.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              className={[
                "group overflow-hidden rounded-[28px] border p-3 text-left transition duration-300",
                active === index
                  ? "border-[#c8a15a] bg-[#fff8ee] shadow-lg"
                  : "border-[#ece7df] bg-white hover:border-[#c8a15a] hover:shadow-md",
              ].join(" ")}
            >
              <div className="grid grid-cols-[110px_1fr] gap-4 sm:grid-cols-[140px_1fr]">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="h-24 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-28"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <p className="text-xs font-bold text-[#b88a44]">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <h4 className="mt-1 text-lg font-bold sm:text-xl">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    {item.desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ImageLightbox
        open={selectedImage !== null}
        image={selectedImage?.src ?? ""}
        title={selectedImage?.title}
        onClose={() => setSelectedImage(null)}
      />
    </section>
  );
}
