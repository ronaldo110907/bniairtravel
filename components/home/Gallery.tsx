"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type GalleryImage = {
  name: string;
  url: string;
};

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    const { data } = await supabase.storage
      .from("gallery")
      .list("", {
        limit: 12,
      });

    if (!data) return;

    const result = data.map((item) => ({
      name: item.name,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${item.name}`,
    }));

    setImages(result);
  }

  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-5xl font-black">
          여행갤러리
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.name}
              className="overflow-hidden rounded-2xl bg-white shadow"
            >
              <Image
                src={image.url}
                alt="여행 이미지"
                width={500}
                height={350}
                className="h-64 w-full object-cover transition hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
