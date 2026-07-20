"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Gallery = {
  id: string;
  title: string;
  image: string;
  sort: number;
};

export default function GalleryAdminPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [items, setItems] = useState<Gallery[]>([]);

  useEffect(() => {
    if (productId) loadGallery();
  }, [productId]);

  async function loadGallery() {
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .eq("product_id", productId)
      .order("sort");

    setItems(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">
          갤러리 관리
        </h1>

        <div className="rounded-2xl bg-white p-8 shadow">
          {items.length === 0 ? (
            <p className="text-gray-500">
              등록된 갤러리가 없습니다.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
