"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DeparturesPage() {
  const params = useParams<{ id: string }>();
  const productId = params?.id;

  const [departures, setDepartures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) loadDepartures();
  }, [productId]);

  async function loadDepartures() {
    const { data, error } = await supabase
      .from("departures")
      .select("*")
      .eq("product_id", productId)
      .order("departure_date");

    if (!error) {
      setDepartures(data || []);
    }

    setLoading(false);
  }

  async function deleteDeparture(id: string) {
    if (!confirm("출발일을 삭제하시겠습니까?")) return;

    await supabase.from("departures").delete().eq("id", id);
    loadDepartures();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">출발일 관리</h1>
            <p className="mt-2 text-gray-500">
              상품별 출발 일정과 가격을 관리합니다.
            </p>
          </div>

          <Link
            href={`/admin/products/${productId}/departures/new`}
            className="rounded-xl bg-black px-5 py-3 text-white"
          >
            출발일 추가
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">출발일</th>
                <th className="px-6 py-4 text-left">항공사</th>
                <th className="px-6 py-4 text-left">가격</th>
                <th className="px-6 py-4 text-left">좌석</th>
                <th className="px-6 py-4 text-left">상태</th>
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
                departures.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-6 py-4">{item.departure_date}</td>
                    <td className="px-6">{item.airline}</td>
                    <td className="px-6">
                      {item.price?.toLocaleString()}원
                    </td>
                    <td className="px-6">{item.seat}석</td>
                    <td className="px-6">{item.status}</td>
                    <td className="px-6 text-center">
                      <button
                        onClick={() => deleteDeparture(item.id)}
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
