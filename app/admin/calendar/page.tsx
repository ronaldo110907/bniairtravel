"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Calendar from "@/components/calendar/Calendar";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [departures, setDepartures] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    loadDepartures();
    loadReservations();
    loadPeople();
  }, []);

  async function loadDepartures() {
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
      .order("departure_date");

    if (error) {
      console.error(error);
      return;
    }

    setDepartures(data ?? []);
  }
  const selectedDepartures = departures.filter((departure) => {
    if (!selectedDate) return false;

    return (
      new Date(departure.departure_date).toDateString() ===
      selectedDate.toDateString()
    );
  });

  async function loadReservations() {
    const { data, error } = await supabase.from("reservations").select("*");

    if (error) {
      console.error(error);
      return;
    }

    setReservations(data ?? []);
  }

  async function loadPeople() {
    const { data, error } = await supabase
      .from("reservation_people")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    setPeople(data ?? []);
  }

  function getPeopleCount(reservationId: string) {
    return people.filter((person) => person.reservation_id === reservationId)
      .length;
  }

  function getReservedPeopleCount(departureId: string) {
    const result = people.filter((person) =>
      reservations.some(
        (reservation) =>
          reservation.id === person.reservation_id &&
          reservation.departure_id === departureId &&
          reservation.status === "확정",
      ),
    );

    console.log("departure", departureId);
    console.log("reserved people", result);

    return result.length;
  }

  console.log("선택 날짜:", selectedDate);
  console.log("선택된 출발건:", selectedDepartures);

  const groupedDepartures = selectedDepartures.reduce(
    (acc: any, departure: any) => {
      const product = departure.products?.title || "상품명 없음";

      if (!acc[product]) {
        acc[product] = [];
      }

      acc[product].push(departure);

      return acc;
    },
    {},
  );

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">📅 출발일 달력 (V2)</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* 왼쪽 : 달력 */}
        <div className="col-span-7 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">달력</h2>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            departures={departures}
          />
        </div>

        {/* 오른쪽 : 선택한 날짜 */}
        <div className="col-span-5 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">선택한 날짜</h2>

          <div className="h-[600px] rounded-lg border-2 border-dashed p-4">
            {selectedDate ? (
              <>
                <div className="mb-4 text-lg font-semibold">
                  {selectedDate.toLocaleDateString("ko-KR")}
                </div>

                <div className="space-y-4">
                  {selectedDepartures.map((departure: any) => {
                    const reserved = getReservedPeopleCount(departure.id);
                    const remain = departure.seat - reserved;

                    const departureReservations = reservations.filter(
                      (reservation) =>
                        reservation.departure_id === departure.id,
                    );

                    return (
                      <div
                        key={departure.id}
                        className="rounded-lg border bg-white p-3"
                      >
                        <div className="mb-2">
                          <span
                            className={`inline-block rounded-md px-2 py-1 text-xs font-bold text-white ${
                              departure.products?.title?.includes("백두산")
                                ? "bg-blue-500"
                                : departure.products?.title?.includes("장가계")
                                  ? "bg-orange-500"
                                  : departure.products?.title?.includes(
                                        "푸꾸옥",
                                      )
                                    ? "bg-emerald-500"
                                    : departure.products?.title?.includes(
                                          "상해",
                                        )
                                      ? "bg-violet-500"
                                      : departure.products?.title?.includes(
                                            "여강",
                                          )
                                        ? "bg-pink-500"
                                        : "bg-gray-500"
                            }`}
                          >
                            {departure.products?.title || "상품명 없음"}
                          </span>
                        </div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="font-bold text-gray-800">
                            💰 {Number(departure.price || 0).toLocaleString()}원
                          </div>

                          <div className="text-sm text-gray-500">
                            {departure.course}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {departureReservations.length > 0 ? (
                            departureReservations.map((reservation) => (
                              <div
                                key={reservation.id}
                                className="flex items-center justify-between rounded border bg-gray-50 px-3 py-2"
                              >
                                <div>
                                  👤 {reservation.name}
                                  {getPeopleCount(reservation.id) > 1 &&
                                    ` 외 ${getPeopleCount(reservation.id) - 1}명`}
                                </div>

                                <a
                                  href={`/admin/reservations?id=${reservation.id}`}
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  상세보기
                                </a>
                              </div>
                            ))
                          ) : (
                            <div className="rounded bg-gray-50 px-3 py-2 text-sm text-gray-400">
                              등록된 예약이 없습니다.
                            </div>
                          )}
                        </div>

                        <div className="mt-3 text-sm text-gray-500">
                          🪑 총 {departure.seat}석 | 예약 {reserved}석 |{" "}
                          {remain > 0 ? `잔여 ${remain}석` : "🔴 마감"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                날짜를 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
