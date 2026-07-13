"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInquiries();
  }, []);

  async function loadInquiries() {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setInquiries(data || []);
    }

    setLoading(false);
  }

  async function deleteInquiry(id: string) {
    if (!confirm("문의를 삭제하시겠습니까?")) return;

    await supabase.from("inquiries").delete().eq("id", id);
    loadInquiries();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-8">
        <h1 className="mb-8 text-3xl font-bold">예약 문의 관리</h1>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">고객명</th>
                <th className="px-6 py-4 text-left">연락처</th>
                <th className="px-6 py-4 text-left">상품</th>
                <th className="px-6 py-4 text-left">내용</th>
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
                inquiries.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6">{item.phone}</td>
                    <td className="px-6">{item.product}</td>
                    <td className="max-w-xs truncate px-6">{item.message}</td>
                    <td className="px-6">{item.status || "접수"}</td>
                    <td className="px-6 text-center">
                      <button
                        onClick={() => deleteInquiry(item.id)}
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
