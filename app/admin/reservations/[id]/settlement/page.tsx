"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Settlement from "@/app/admin/departures/[id]/components/Settlement";

export default function ReservationSettlementPage() {
  const params = useParams();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservation();
  }, []);

  async function loadReservation() {
    setLoading(true);

    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
        *,
        people:reservation_people(*)
      `,
      )
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("RESERVATION ERROR", error);
      setLoading(false);
      return;
    }

    setReservation(data);
    setLoading(false);
  }

  if (loading) {
    return <div className="p-6">불러오는 중...</div>;
  }

  if (!reservation) {
    return <div className="p-6">예약 정보를 찾을 수 없습니다.</div>;
  }

  async function downloadDispatch() {
    if (!reservation) return;

    try {
      const query = new URLSearchParams({
        reservationIds: String(reservation.id),
      });

      const res = await fetch(`/api/dispatch?${query.toString()}`);

      if (!res.ok) {
        const result = await res.json().catch(() => null);

        console.error("DISPATCH ERROR:", result);

        alert("수배의뢰서 생성 실패");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = `수배의뢰서_${reservation.product}_${reservation.departure_date}.xlsx`;

      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DISPATCH DOWNLOAD ERROR:", error);

      alert("수배의뢰서 다운로드 실패");
    }
  }

  const customDeparture = reservation
    ? {
        products: {
          title: reservation.product || "기타",
        },
        departure_date: reservation.departure_date || "",
        course: "",
        price: 0,
      }
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-center text-3xl font-bold">기타 예약 정산</h1>

      <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <span className="font-semibold text-gray-500">상품 : </span>
            {reservation.product}
          </div>

          <div>
            <span className="font-semibold text-gray-500">출발일 : </span>
            {reservation.departure_date || "-"}
          </div>

          <div>
            <span className="font-semibold text-gray-500">대표자 : </span>
            {reservation.name}
          </div>

          <div>
            <span className="font-semibold text-gray-500">예약인원 : </span>
            {reservation.people?.length || 0}명
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => void downloadDispatch()}
          className="
      rounded-xl
      bg-emerald-600
      px-6
      py-3
      font-bold
      text-white
      hover:bg-emerald-700
    "
        >
          📥 수배의뢰서 다운로드
        </button>
      </div>
      <Settlement reservations={[reservation]} departure={customDeparture} />
    </div>
  );
}
