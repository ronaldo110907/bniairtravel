"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import SelectedInfo from "./SelectedInfo";
type Departure = {
  id: string;
  date: string;
  course: "3박4일" | "4박5일";
  airline: string;
  price: number;
  seats: number;
  status: "available" | "closed";
  is_special: boolean;
};

const YEAR = 2026;
// 상품별 시작월 자동 계산
const DEFAULT_MONTHS = [9, 10, 11];

type Props = {
  productId: string;
};

export default function DepartureCalendar({ productId }: Props) {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const months = useMemo(() => {
    const list = [
      ...new Set(departures.map((d) => Number(d.date.split("-")[1]))),
    ].sort((a, b) => a - b);
    return list.length ? list : DEFAULT_MONTHS;
  }, [departures]);

  const [monthIndex, setMonthIndex] = useState(0);

  useEffect(() => {
    async function loadDepartures() {
      // 출발일 조회
      const { data: departuresData, error: departuresError } = await supabase
        .from("departures")
        .select("*")
        .eq("product_id", productId);

      if (departuresError) {
        console.error(departuresError);
        return;
      }

      // 예약 조회
      const { data: reservationsData, error: reservationsError } =
        await supabase.from("reservations").select("*");

      if (reservationsError) {
        console.error(reservationsError);
        return;
      }

      // 예약 인원 조회
      const { data: peopleData, error: peopleError } = await supabase
        .from("reservation_people")
        .select("*");

      if (peopleError) {
        console.error(peopleError);
        return;
      }

      const converted: Departure[] = (departuresData ?? []).map((item: any) => {
        console.log(item.departure_date, item.status);
        const reserved = (peopleData ?? []).filter((person: any) =>
          (reservationsData ?? []).some(
            (reservation: any) =>
              reservation.id === person.reservation_id &&
              reservation.departure_id === item.id &&
              reservation.status === "확정",
          ),
        ).length;

        const remain = item.seat - reserved;

        return {
          id: item.id,
          date: item.departure_date,
          airline: item.airline,
          price: item.price,
          seats: remain,
          course: item.course,
          is_special: item.is_special,
          status:
            item.status === "마감" || item.status === "예약마감" || remain <= 0
              ? "closed"
              : "available",
        };
      });

      setDepartures(converted);
    }

    loadDepartures();
  }, [productId]);
  const currentMonth = months[monthIndex] ?? months[0];

  const monthDepartures = useMemo(
    () =>
      departures.filter(
        (item) => Number(item.date.split("-")[1]) === currentMonth,
      ),
    [departures, currentMonth],
  );

  const [selected, setSelected] = useState<Departure | null>(null);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(YEAR, currentMonth - 1, 1).getDay();
    const lastDate = new Date(YEAR, currentMonth, 0).getDate();

    const cells: Array<{
      day: number | null;
      departure?: Departure;
    }> = [];

    for (let index = 0; index < firstDay; index += 1) {
      cells.push({ day: null });
    }

    for (let day = 1; day <= lastDate; day += 1) {
      const departure = monthDepartures.find(
        (item) => Number(item.date.slice(-2)) === day,
      );

      cells.push({ day, departure });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ day: null });
    }

    return cells;
  }, [currentMonth, monthDepartures]);

  const moveMonth = (direction: -1 | 1) => {
    const nextIndex = monthIndex + direction;

    if (nextIndex < 0 || nextIndex >= months.length) return;

    const nextMonth = months[nextIndex];
    const firstDeparture =
      departures.find(
        (item) => Number(item.date.split("-")[1]) === nextMonth,
      ) ?? null;

    setMonthIndex(nextIndex);
    setSelected(firstDeparture);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1.55fr_0.85fr]">
      <section className="overflow-hidden rounded-[32px] border border-[#E8E0D4] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#EEE7DD] px-5 py-6 md:px-8">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            disabled={monthIndex === 0}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-xl transition hover:border-[#C8A15A] hover:bg-[#FFF8ED] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="이전 달"
          >
            ←
          </button>

          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.32em] text-[#B88A44] md:text-xs">
              DEPARTURE CALENDAR
            </p>
            <h3 className="mt-2 text-2xl font-bold md:text-3xl">
              {YEAR}년 {currentMonth}월
            </h3>
          </div>

          <button
            type="button"
            onClick={() => moveMonth(1)}
            disabled={monthIndex === months.length - 1}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-xl transition hover:border-[#C8A15A] hover:bg-[#FFF8ED] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="다음 달"
          >
            →
          </button>
        </div>

        <div className="px-2 py-5 sm:px-3 md:px-4 md:py-8">
          <div className="mb-3 grid grid-cols-7 text-center text-[11px] font-bold tracking-[0.08em] text-black/40 sm:text-xs">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
              (weekday, index) => (
                <div
                  key={weekday}
                  className={
                    index === 0
                      ? "text-red-400"
                      : index === 6
                        ? "text-blue-400"
                        : ""
                  }
                >
                  {weekday}
                </div>
              ),
            )}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-2">
            {calendarCells.map((cell, index) => {
              if (cell.day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[80px] rounded-2xl sm:min-h-[108px] md:min-h-[132px]"
                  />
                );
              }

              const departure = cell.departure;
              const isClosed = departure?.status === "closed";
              const isHot = departure?.is_special;
              const isSelected = departure && selected?.date === departure.date;

              if (!departure) {
                return (
                  <div
                    key={`day-${cell.day}`}
                    className="min-h-[80px] rounded-2xl border border-transparent bg-[#FAF8F4] p-2 text-black/25 sm:min-h-[108px] md:min-h-[132px] md:p-3"
                  >
                    <span className="text-sm font-semibold md:text-base">
                      {cell.day}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={departure.date}
                  type="button"
                  onClick={() => !isClosed && setSelected(departure)}
                  disabled={isClosed}
                  className={[
                    "relative min-h-[80px] overflow-hidden rounded-2xl border p-2 text-left transition-all duration-300 sm:min-h-[108px] md:min-h-[132px] md:p-3",
                    isSelected
                      ? "border-[#C8A15A] bg-[#FFF8ED] shadow-lg ring-2 ring-[#C8A15A]/20"
                      : "border-[#E9E1D6] bg-white hover:-translate-y-1 hover:border-[#C8A15A] hover:shadow-md",
                    isClosed ? "cursor-not-allowed opacity-55" : "",
                  ].join(" ")}
                >
                  {isHot && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-red-500 px-1.5 py-1 text-[9px] font-bold text-white md:right-2 md:top-2 md:px-2 md:text-[10px]">
                      🔥 특가
                    </span>
                  )}

                  {isClosed && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-black/45 px-1.5 py-1 text-[9px] font-bold text-white md:right-2 md:top-2 md:px-2 md:text-[10px]">
                      마감
                    </span>
                  )}

                  <div className="flex h-full flex-col">
                    <span className="text-lg font-extrabold leading-none text-[#222] md:text-2xl">
                      {cell.day}
                    </span>

                    <div className="mt-auto">
                      <p className="hidden text-[10px] font-bold text-[#B88A44] sm:block md:text-xs">
                        {departure.course}
                      </p>

                      <p className="mt-1 hidden text-[10px] font-semibold text-black/60 md:block">
                        {departure.price.toLocaleString()}원
                      </p>

                      <div className="mt-1.5 flex items-center justify-between gap-1">
                        <span
                          className={[
                            "rounded-full px-1.5 py-0.5 text-[9px] font-bold md:px-2 md:text-[10px]",
                            isClosed
                              ? "bg-black/10 text-black/45"
                              : "bg-emerald-50 text-emerald-700",
                          ].join(" ")}
                        >
                          {isClosed ? "예약마감" : "예약가능"}
                        </span>

                        {!isClosed && (
                          <span
                            className={[
                              "text-[11px] font-semibold text-right",
                              departure.seats <= 5
                                ? "text-red-500"
                                : "text-black/40",
                            ].join(" ")}
                          >
                            {departure.seats}석
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 rounded-2xl bg-[#FAF8F4] px-4 py-3 text-xs text-black/55">
            <span>● 예약가능</span>
            <span className="text-red-500">● 긴급특가</span>
            <span className="text-black/35">● 예약마감</span>
          </div>
        </div>
      </section>

      <SelectedInfo departure={selected} />
    </div>
  );
}
