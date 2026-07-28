"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    departure_date: string;
    course: string;
    price: number;
    airline: string;
    seat: number;
    status: string;
  }) => void | Promise<void>;
  departure?: any;
  hasReservation?: boolean;
};

export default function AddDepartureModal({
  open,
  onClose,
  onSave,
  departure,
  hasReservation,
}: Props) {
  const [departureDate, setDepartureDate] = useState("");
  const [course, setCourse] = useState("");
  const [price, setPrice] = useState("");
  const [airline, setAirline] = useState("");
  const [seat, setSeat] = useState("");
  const [status, setStatus] = useState("예약가능");

  useEffect(() => {
    if (!departure) return;

    setDepartureDate(departure.departure_date ?? "");
    setCourse(departure.course ?? "");
    setPrice(String(departure.price ?? ""));
    setAirline(departure.airline ?? "");
    setSeat(String(departure.seat ?? ""));
    setStatus(departure.status ?? "예약가능");
  }, [departure]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-6 text-xl font-bold">출발일 추가</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">출발일</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full rounded-lg border p-2"
              disabled={hasReservation}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">일정</label>
            <input
              type="text"
              placeholder="예) 4박5일"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full rounded-lg border p-2"
              disabled={hasReservation}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">가격</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">항공사</label>
            <input
              type="text"
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">총좌석</label>
            <input
              type="number"
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border p-2"
            >
              <option>예약가능</option>
              <option>마감</option>
              <option>출발확정</option>
              <option>취소</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            취소
          </button>

          <button
            onClick={() =>
              onSave({
                departure_date: departureDate,
                course,
                price: Number(price),
                airline,
                seat: Number(seat),
                status,
              })
            }
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
