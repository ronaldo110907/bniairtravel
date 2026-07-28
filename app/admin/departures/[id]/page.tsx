"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ReservationList from "./components/ReservationList";

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
      .select("*")
      .eq("departure_id", params.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setReservations(data || []);
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">출발일 관리</h1>

      <div className="rounded-xl border p-6">
        <div className="font-bold">출발 ID</div>

        <div className="mt-2 text-blue-600">{String(params.id)}</div>
      </div>

      {departure && (
        <div className="mt-4 space-y-2 text-sm">
          <div>상품 : {departure.products?.title}</div>
          <div>출발일 : {departure.departure_date}</div>
          <div>항공사 : {departure.airline}</div>
          <div>가격 : {departure.price?.toLocaleString()}원</div>
          <div>좌석 : {departure.seat}석</div>
          <div>상태 : {departure.status}</div>
        </div>
      )}
      <ReservationList reservations={reservations} />

      <div className="rounded-xl border p-6">룸배정</div>

      <div className="rounded-xl border p-6">항공</div>

      <div className="rounded-xl border p-6">여권</div>

      <div className="rounded-xl border p-6">비자</div>

      <div className="rounded-xl border p-6">정산</div>
    </div>
  );
}
