"use client";

import { useState } from "react";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay();

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <button className="rounded-lg border px-3 py-2">◀</button>

        <h2 className="text-2xl font-bold">2026년 9월</h2>

        <button className="rounded-lg border px-3 py-2">▶</button>
      </div>

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
    </div>
  );
}
