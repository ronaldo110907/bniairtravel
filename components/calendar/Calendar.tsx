"use client";

import { useState } from "react";

type Props = {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  departures: any[];
};

export default function Calendar({
  selectedDate,
  onSelectDate,
  departures,
}: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay();

  const days = Array.from({ length: lastDate }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay });

  return (
    <div className="rounded-xl border bg-white p-6">
      {/* 상단 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => {
            setCurrentDate(new Date(year, month - 1, 1));
            setSelectedDay(null);
          }}
          className="rounded-lg border px-3 py-2"
        >
          ◀
        </button>

        <h2 className="text-2xl font-bold">
          {year}년 {month + 1}월
        </h2>

        <button
          onClick={() => {
            setCurrentDate(new Date(year, month + 1, 1));
            setSelectedDay(null);
          }}
          className="rounded-lg border px-3 py-2"
        >
          ▶
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 gap-2">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div
            key={day}
            className="rounded-lg bg-gray-100 py-3 text-center font-semibold"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="mt-2 grid grid-cols-7 gap-2">
        {blanks.map((_, index) => (
          <div key={index} className="h-24" />
        ))}

        {days.map((day) => {
          const dayDepartures = departures.filter((departure) => {
            const departureDate = new Date(departure.departure_date);

            return (
              departureDate.getFullYear() === year &&
              departureDate.getMonth() === month &&
              departureDate.getDate() === day
            );
          });

          return (
            <div
              key={day}
              onClick={() => {
                setSelectedDay(day);
                onSelectDate(new Date(year, month, day));
              }}
              className={`flex h-24 cursor-pointer flex-col rounded-lg border p-2 transition ${
                selectedDay === day
                  ? "border-blue-500 bg-blue-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="font-semibold">{day}</span>

              <div className="mt-1 space-y-1 overflow-hidden">
                {dayDepartures.map((departure) => (
                  <div
                    key={departure.id}
                    className="truncate rounded bg-blue-500 px-1 py-0.5 text-[10px] text-white"
                  >
                    {departure.products?.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
