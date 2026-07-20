"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Hotel = {
  id: string;
  name: string;
  location?: string;
  image?: string;
};

export default function HotelsAdminPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    if (productId) loadHotels();
  }, [productId]);

  async function loadHotels() {
    const { data } = await supabase
      .from("hotels")
      .select("*")
      .eq("product_id", productId)
      .order("sort");

    setHotels(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">
          호텔 관리
        </h1>

        <div className="rounded-2xl bg-white p-8 shadow">
          {hotels.length === 0 ? (
            <p className="text-gray-500">
              등록된 호텔이 없습니다.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="rounded-xl border p-5"
                >
                  {hotel.image && (
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="mb-4 h-40 w-full rounded-lg object-cover"
                    />
                  )}

                  <h3 className="font-bold">
                    {hotel.name}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    {hotel.location}
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
