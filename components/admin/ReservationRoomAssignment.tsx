"use client";

import { useRef, useState } from "react";
import RoomAssignment from "@/app/admin/departures/[id]/components/RoomAssignment";

export default function ReservationRoomAssignment({ reservationId, departureId, name }: {
  reservationId: string;
  departureId?: string | null;
  name: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => { setOpen(true); dialog.current?.showModal(); }}
        className="rounded-lg bg-teal-600 px-4 py-2 font-bold text-white">
        🛏 객실배정
      </button>
      <dialog ref={dialog} onClose={() => setOpen(false)} aria-labelledby="reservation-rooms-title"
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-4xl overflow-y-auto rounded-xl bg-white p-4 text-gray-900 shadow-xl backdrop:bg-black/40">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 id="reservation-rooms-title" className="font-bold">{name} · 객실배정</h3>
          <button type="button" autoFocus onClick={() => dialog.current?.close()} className="shrink-0 rounded-lg border px-3 py-2">닫기</button>
        </div>
        <p className="mb-3 text-sm text-gray-500">현재 예약의 명단만 표시합니다. 배정 결과는 기존 정산과 수배의뢰서에도 반영됩니다.</p>
        {open && <RoomAssignment key={reservationId} reservationId={reservationId} departureId={departureId || undefined} />}
      </dialog>
    </>
  );
}
