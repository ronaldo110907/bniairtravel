"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Departure, Reservation } from "@/lib/confirmation/model";
import ConfirmationDownloadButton from "./ConfirmationDownloadButton";

type Props = { reservation: Reservation & { departure_id: string } };

export default function ReservationConfirmationDownload({ reservation }: Props) {
  const [departure, setDeparture] = useState<Departure | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setDeparture(null);
    setError("");
    void (async () => {
      try {
        if (!reservation.departure_id) throw new Error("missing departure");
        const { data, error: queryError } = await supabase.from("departures")
          .select("id, departure_date, course, variant, products(title, slug)")
          .eq("id", reservation.departure_id).single();
        if (queryError || !data) throw queryError ?? new Error("missing departure");
        const product = Array.isArray(data.products) ? data.products[0] : data.products;
        if (!cancelled) setDeparture({ ...data, products: product });
      } catch {
        if (!cancelled) setError("확정서에 필요한 출발 정보를 불러오지 못했습니다.");
      }
    })();
    return () => { cancelled = true; };
  }, [reservation.departure_id, attempt]);

  if (error) return <div className="text-sm text-red-700">{error} <button type="button" className="underline" onClick={() => setAttempt(n => n + 1)}>다시 시도</button></div>;
  if (!departure) return <button type="button" disabled className="rounded-lg bg-indigo-700 px-4 py-2 text-sm text-white opacity-50">확정서 준비 중…</button>;
  return <ConfirmationDownloadButton departure={departure} reservation={reservation} />;
}
