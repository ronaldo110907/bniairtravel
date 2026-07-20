"use client";

import { useEffect, useMemo, useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import { supabase } from "@/lib/supabase";

type GalleryItem = {
  id: string;
  title: string;
  desc: string;
  src: string;
};

export default function GallerySlider({ product }: { product: any }) {
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [active, setActive] = useState(0);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    loadGallery();
  }, [product?.id]);

  async function loadGallery() {
    if (!product?.id) return;

    const { data } = await supabase
      .from("gallery")
      .select("*")
      .eq("product_id", product.id)
      .order("sort");

    setGalleryImages(data || []);
  }

  const current = useMemo(
    () => galleryImages[active],
    [galleryImages, active]
  );

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
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <button
          type="button"
          onClick={() => setSelectedImage(current)}
          className="group relative overflow-hidden rounded-[36px] bg-black text-left shadow-xl"
        >
          <img
            src={current.src}
            alt={current.title}
            className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105 md:h-[560px]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-sm text-white/60">
              {product?.title}
            </p>
            <h3 className="text-3xl font-bold">
              {current.title}
            </h3>
            <p className="mt-3 text-white/75">
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
              className="overflow-hidden rounded-[28px] border p-3 text-left"
            >
              <div className="grid grid-cols-[110px_1fr] gap-4">
                <img
                  src={item.src}
                  alt={item.title}
                  className="h-24 w-full rounded-2xl object-cover"
                />

                <div>
                  <p className="text-xs text-[#b88a44]">
                    {index + 1}
                  </p>
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-sm text-gray-500">
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
