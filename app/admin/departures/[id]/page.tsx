"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ReservationList from "./components/ReservationList";
import RoomAssignment from "./components/RoomAssignment";
import Settlement from "./components/Settlement";
import { Download } from "lucide-react";
import DepartureSettlementSummary from "./components/DepartureSettlementSummary";

export default function DepartureDetailPage() {
  const params = useParams();
  const [departure, setDeparture] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  useEffect(() => {
    loadDeparture();
    loadReservations();
  }, []);
  async function loadDeparture() {
    const { data, error } = await supabase
      .from("departures")
      .select(
        `
      *,
      products (
        title
      )
    `,
      )
      .eq("id", params.id)
      .single();

    if (error) {
      console.log("ERROR :", error);
      return;
    }

    console.log("DATA :", data);

    setDeparture(data);
  }
  async function loadReservations() {
    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
      *,
      people:reservation_people(*)
    `,
      )
      .eq("departure_id", params.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setReservations(data || []);
  }
  const reservedCount = reservations.reduce(
    (sum, reservation) => sum + (reservation.people?.length || 0),
    0,
  );

  const remainSeat = (departure?.seat || 0) - reservedCount;
  async function downloadDispatch() {
    try {
      const res = await fetch(`/api/dispatch?id=${params.id}`);

      if (!res.ok) {
        alert("수배의뢰서 생성 실패");
        return;
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `수배의뢰서_${departure.products?.title}_${departure.departure_date}.xlsx`;

      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("다운로드 실패");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-center font-bold">출발일 관리</h1>

      {departure && (
        <div className="mx-auto mt-6 max-w-3xl">
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={downloadDispatch}
              className="
          flex items-center gap-2
          rounded-xl
          bg-emerald-600
          px-6
          py-3
          font-bold
          text-white
          hover:bg-emerald-700
        "
            >
              <Download size={18} />
              수배의뢰서 다운로드
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm">
            <div>
              <span className="font-semibold text-gray-500">상품 : </span>
              {departure.products?.title}
            </div>

            <div>
              <span className="font-semibold text-gray-500">출발일 : </span>
              {departure.departure_date}
            </div>

            <div>
              <span className="font-semibold text-gray-500">항공 : </span>
              {departure.airline}
            </div>

            <div>
              <span className="font-semibold text-gray-500">총좌석 : </span>
              {departure.seat}석
            </div>

            <div>
              <span className="font-semibold text-gray-500">가격 : </span>
              {departure.price?.toLocaleString()}원
            </div>

            <div>
              <span className="font-semibold text-gray-500">예약 / 잔여 :</span>
              예약 {reservedCount}명 / 잔여 {remainSeat}석
            </div>
          </div>
        </div>
      )}
      <RoomAssignment departureId={String(params.id)} />

      <div id="settlement">
        <Settlement reservations={reservations} departure={departure} />
      </div>

      <DepartureSettlementSummary
        reservations={reservations}
        departure={departure}
      />
    </div>
  );
}
