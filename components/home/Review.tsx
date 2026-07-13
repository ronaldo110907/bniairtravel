"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Review() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(3);

    setReviews(data || []);
  }

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-5xl font-black text-center">
          고객후기
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl border bg-white p-6 shadow-sm"
            >
              <div className="text-yellow-500 text-lg">
                {"★".repeat(review.rating || 5)}
              </div>

              <p className="mt-4 text-gray-600 leading-7">
                {review.content}
              </p>

              <div className="mt-6 font-bold">
                {review.name}
              </div>

              <div className="mt-1 text-sm text-gray-400">
                {review.product}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
