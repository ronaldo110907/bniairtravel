"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Info = {
  id: string;
  title: string;
  content: string;
  sort: number;
};

export default function ProductInfoAdminPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [items, setItems] = useState<Info[]>([]);

  useEffect(() => {
    if (productId) loadInfo();
  }, [productId]);

  async function loadInfo() {
    const { data } = await supabase
      .from("product_info")
      .select("*")
      .eq("product_id", productId)
      .order("sort");

    setItems(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">
          상세정보 관리
        </h1>

        <div className="rounded-2xl bg-white p-8 shadow">
          {items.length === 0 ? (
            <p className="text-gray-500">
              등록된 상세정보가 없습니다.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border p-5"
                >
                  <h3 className="font-bold">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
