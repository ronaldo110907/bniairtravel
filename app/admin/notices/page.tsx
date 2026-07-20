"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  product: string;
  departure_date: string;
  message: string;
  status: string;
  memo: string;
  created_at: string;
};

export default function ReservationsPage() {
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("RESERVATIONS ERROR", error);
      alert(error.message);
      setList([]);
    } else {
      console.log("RESERVATIONS DATA", data);
      setList((data as Reservation[]) || []);
    }

    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("reservations").update({ status }).eq("id", id);
    loadReservations();
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("reservations").delete().eq("id", id);
    loadReservations();
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const filtered = list.filter(item => [item.name,item.phone,item.product].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8 flex items-center justify-between"><h1 className="text-3xl font-bold">예약관리</h1><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="이름 / 연락처 / 상품 검색" className="w-80 rounded-lg border p-3"/></div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">이름</th>
                <th className="p-4 text-left">연락처</th>
                <th className="p-4 text-left">상품</th>
                <th className="p-4 text-left">출발일</th>
                <th className="p-4 text-left">상태</th>
                <th className="p-4 text-left">문의내용</th>
                <th className="p-4 text-center">상세</th>
                <th className="p-4 text-center">삭제</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.phone}</td>
                  <td className="p-4">{item.product}</td>
                  <td className="p-4">{item.departure_date}</td>
                  <td className="max-w-xs truncate p-4">
                    {item.message}
                  </td>
                  <td className="p-4">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className="rounded border p-2"
                    >
                      <option>대기</option>
                      <option>상담중</option>
                      <option>예약완료</option>
                      <option>취소</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={()=>alert(item.message)} className="rounded bg-blue-600 px-4 py-2 text-white">상세</button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => remove(item.id)}
                      className="rounded bg-red-500 px-4 py-2 text-white"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    예약 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
