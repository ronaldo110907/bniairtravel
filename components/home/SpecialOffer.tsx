"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  slug: string;
  hero_image: string | null;
  price_from: number | null;
  special_visible: boolean;
  special_order: number;
};

export default function SpecialOffer() {
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, title, slug, hero_image, price_from, special_visible, special_order",
        )
        .eq("special_visible", true)
        .order("special_order");

      if (!error && data) {
        setOffers(data);
      }

      setLoading(false);
    }

    loadOffers();
  }, []);

  if (loading) {
    return null;
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f8f9fb] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold tracking-[6px] text-yellow-500 uppercase">
            Special Offer
          </p>

          <h2 className="mt-4 text-5xl font-black text-[#081A33]">
            🔥 긴급특가
          </h2>

          <p className="mt-4 text-gray-500">이번 주 가장 인기 있는 상품</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.title}
              className="group overflow-hidden rounded-[28px] bg-white shadow-xl transition duration-500 hover:-translate-y-3"
            >
              <div className="overflow-hidden">
                <img
                  src={offer.hero_image ?? "/images/comingsoon.jpg"}
                  alt={offer.title}
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
                />
              </div>

              <div className="p-8">
                <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
                  긴급특가
                </span>

                <h3 className="mt-6 text-3xl font-bold text-[#081A33]">
                  {offer.title}
                </h3>

                <p className="mt-5 text-4xl font-black text-yellow-600">
                  ₩{(offer.price_from ?? 0).toLocaleString()}~
                </p>

                <Link
                  href={`/${offer.slug}`}
                  className="mt-8 block w-full rounded-xl bg-[#081A33] py-4 text-center font-bold text-white transition hover:bg-[#0e2d57]"
                >
                  자세히 보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
