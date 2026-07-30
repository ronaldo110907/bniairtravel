"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ReservationList from "./components/ReservationList";
import RoomAssignment from "./components/RoomAssignment";

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
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">출발일 관리</h1>

      {departure && (
        <div className="mx-auto mt-6 max-w-2xl">
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
      <ReservationList reservations={reservations} />

      <RoomAssignment departureId={String(params.id)} />

      <div className="rounded-xl border p-6">정산</div>
    </div>
  );
}
