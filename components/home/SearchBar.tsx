"use client";

import { Search, MapPin, CalendarDays, Users } from "lucide-react";
export default function SearchBar() {
  return (
    <section className="relative z-30 -mt-20 px-6">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl p-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <MapPin size={18} />
              여행지
            </label>

            <select className="mt-3 w-full border-none bg-transparent text-lg font-bold outline-none">
              <option>장가계</option>
              <option>백두산</option>
              <option>상해·항주·주가각</option>
              <option>여강</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <CalendarDays size={18} />
              출발일
            </label>

            <input
              type="date"
              className="mt-3 w-full bg-transparent text-lg outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <Users size={18} />
              인원
            </label>

            <select className="mt-3 w-full bg-transparent text-lg outline-none">
              <option>1명</option>
              <option>2명</option>
              <option>3명</option>
              <option>4명 이상</option>
            </select>
          </div>

          <button className="flex items-center justify-center gap-3 rounded-2xl bg-blue-900 text-white text-xl font-bold transition hover:bg-blue-800">
            <Search size={24} />
            여행 검색
          </button>
        </div>
      </div>
    </section>
  );
}
