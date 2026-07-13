"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setReviews(data || []);
    }

    setLoading(false);
  }

  async function deleteReview(id: string) {
    if (!confirm("후기를 삭제하시겠습니까?")) return;

    await supabase.from("reviews").delete().eq("id", id);
    loadReviews();
  }

  async function toggleVisible(id: string, value: boolean) {
    await supabase
      .from("reviews")
      .update({ is_visible: !value })
      .eq("id", id);

    loadReviews();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-8">
        <h1 className="mb-8 text-3xl font-bold">후기 관리</h1>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">작성자</th>
                <th className="px-6 py-4 text-left">상품명</th>
                <th className="px-6 py-4 text-left">후기내용</th>
                <th className="px-6 py-4 text-left">별점</th>
                <th className="px-6 py-4 text-left">노출</th>
                <th className="px-6 py-4">관리</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    불러오는 중...
                  </td>
                </tr>
              ) : (
                reviews.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6">{item.product}</td>
                    <td className="max-w-xs truncate px-6">
                      {item.content}
                    </td>
                    <td className="px-6">{item.rating}점</td>
                    <td className="px-6">
                      <button
                        onClick={() => toggleVisible(item.id, item.is_visible)}
                        className={`rounded-full px-3 py-1 text-sm ${
                          item.is_visible
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.is_visible ? "노출" : "숨김"}
                      </button>
                    </td>
                    <td className="px-6 text-center">
                      <button
                        onClick={() => deleteReview(item.id)}
                        className="text-red-600"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
