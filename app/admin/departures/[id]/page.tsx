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
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedDispatchIds, setSelectedDispatchIds] = useState<string[]>([]);

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

  // 좌석 점유 계산
  // 대기(홀딩) + 확정 = 좌석 점유
  // 취소 = 좌석 점유 제외
  const reservedCount = reservations.reduce((sum, reservation) => {
    if (reservation.status === "취소") {
      return sum;
    }

    const savedPeopleCount = Number(reservation.people_count) || 0;
    const registeredPeopleCount = reservation.people?.length || 0;

    // 신규 예약의 people_count와
    // 기존 예약의 실제 등록인원을 모두 안전하게 반영
    const count = Math.max(savedPeopleCount, registeredPeopleCount, 1);

    return sum + count;
  }, 0);

  const remainSeat = (departure?.seat || 0) - reservedCount;

  function openDispatchModal() {
    if (!departure) return;

    const defaultIds = reservations
      .filter(
        (reservation) =>
          reservation.status !== "취소" &&
          reservation.product === departure.products?.title,
      )
      .map((reservation) => String(reservation.id));

    setSelectedDispatchIds(defaultIds);
    setShowDispatchModal(true);
  }

  async function markDispatchDone(reservationIds: string[]) {
    if (reservationIds.length === 0) return;

    const now = new Date().toISOString();

    // 이미 체크리스트가 만들어져 있는 예약 확인
    const { data: existingRows, error: existingError } = await supabase
      .from("reservation_checklists")
      .select("reservation_id")
      .in("reservation_id", reservationIds);

    if (existingError) {
      console.error("DISPATCH CHECKLIST LOAD ERROR", existingError);
      return;
    }

    const existingIds = new Set(
      (existingRows ?? []).map((row) => String(row.reservation_id)),
    );

    const existingTargetIds = reservationIds.filter((id) =>
      existingIds.has(id),
    );

    const missingIds = reservationIds.filter((id) => !existingIds.has(id));

    // 기존 체크리스트는 request_done만 수정
    if (existingTargetIds.length > 0) {
      const { error: updateError } = await supabase
        .from("reservation_checklists")
        .update({
          request_done: true,
          updated_at: now,
        })
        .in("reservation_id", existingTargetIds);

      if (updateError) {
        console.error("DISPATCH CHECKLIST UPDATE ERROR", updateError);
      }
    }

    // 체크리스트가 아직 없는 예약은 새로 생성
    if (missingIds.length > 0) {
      const { error: insertError } = await supabase
        .from("reservation_checklists")
        .insert(
          missingIds.map((reservationId) => ({
            reservation_id: reservationId,
            request_done: true,
            updated_at: now,
          })),
        );

      if (insertError) {
        console.error("DISPATCH CHECKLIST INSERT ERROR", insertError);
      }
    }
  }

  async function downloadDispatch() {
    if (selectedDispatchIds.length === 0) {
      alert("수배의뢰서에 포함할 예약을 선택해주세요.");
      return;
    }

    try {
      const query = new URLSearchParams({
        id: String(params.id),
        reservationIds: selectedDispatchIds.join(","),
      });

      const res = await fetch(`/api/dispatch?${query.toString()}`);

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

      await markDispatchDone(selectedDispatchIds);

      setShowDispatchModal(false);
    } catch (err) {
      console.error(err);
      alert("다운로드 실패");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-center text-3xl font-bold">출발일 관리</h1>

      {departure && (
        <div className="mx-auto mt-6 max-w-3xl">
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={openDispatchModal}
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
              <span className="font-semibold text-gray-500">
                예약 / 잔여 :{" "}
              </span>
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
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">📋 수배의뢰서 대상 선택</h2>
                <p className="mt-1 text-sm text-gray-500">
                  수배의뢰서에 포함할 예약만 선택해주세요.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDispatchModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mt-5 max-h-[420px] space-y-2 overflow-y-auto">
              {reservations
                .filter((reservation) => reservation.status !== "취소")
                .map((reservation) => {
                  const reservationId = String(reservation.id);
                  const checked = selectedDispatchIds.includes(reservationId);

                  const savedPeopleCount =
                    Number(reservation.people_count) || 0;
                  const registeredPeopleCount = reservation.people?.length || 0;

                  const peopleCount = Math.max(
                    savedPeopleCount,
                    registeredPeopleCount,
                    1,
                  );

                  const isCustomProduct =
                    reservation.product !== departure?.products?.title;

                  return (
                    <label
                      key={reservation.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                        checked
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDispatchIds((prev) => [
                              ...prev,
                              reservationId,
                            ]);
                          } else {
                            setSelectedDispatchIds((prev) =>
                              prev.filter((id) => id !== reservationId),
                            );
                          }
                        }}
                        className="h-5 w-5"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">{reservation.name}</span>

                          {isCustomProduct && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                              단독 / 직접입력
                            </span>
                          )}
                        </div>

                        <div className="mt-1 text-sm text-gray-500">
                          {reservation.product} · {peopleCount}명
                        </div>
                      </div>
                    </label>
                  );
                })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm font-semibold text-gray-600">
                선택 {selectedDispatchIds.length}건
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="rounded-xl border px-5 py-3 font-bold text-gray-600"
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={() => void downloadDispatch()}
                  className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
                >
                  📥 선택 예약 수배의뢰서 생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
