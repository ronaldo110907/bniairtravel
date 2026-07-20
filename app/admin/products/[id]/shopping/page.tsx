"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Shopping = {
  id: string;
  title: string;
  desc: string;
  image?: string;
};

export default function ShoppingAdminPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [items, setItems] = useState<Shopping[]>([]);

  useEffect(() => {
    if (productId) loadShopping();
  }, [productId]);

  async function loadShopping() {
   const query = supabase
    .from("shopping")
    .select("*");

   console.log("QUERY:", query);

   const { data, error } = await query
    .eq("product_id", productId)
    .order("sort");

   console.log("ERROR:", error);

  setItems(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">
          쇼핑센터 관리
        </h1>

        <div className="rounded-2xl bg-white p-8 shadow">
          {items.length === 0 ? (
            <p className="text-gray-500">
              등록된 쇼핑 정보가 없습니다.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-40 w-full object-cover"
                    />
                  )}

                  <div className="p-5">
                    <h3 className="font-bold">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {item.desc}
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
