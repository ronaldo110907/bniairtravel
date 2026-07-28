"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  reservations: any[];
};

export default function ReservationList({ reservations }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    console.log("ReservationList Ready");
    loadPeople();
  }, []);

  async function loadPeople() {
    const { data, error } = await supabase
      .from("reservation_people")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    console.log("PEOPLE :", data);

    setPeople(data || []);
  }

  return (
    <div className="rounded-xl border p-6">
      <h2 className="mb-3 text-lg font-bold">예약현황</h2>

      <div>예약건수 : {reservations.length}건</div>

      <div className="mt-4 space-y-3">
        {reservations.map((reservation) => {
          const personCount = people.filter(
            (person) => person.reservation_id === reservation.id,
          ).length;

          return (
            <div key={reservation.id} className="rounded-lg border p-3">
              <div
                className="flex cursor-pointer items-center gap-3"
                onClick={() =>
                  setOpenId(openId === reservation.id ? null : reservation.id)
                }
              >
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{reservation.name}</div>

                  <div className="text-sm text-gray-500">
                    👥 {personCount}명
                  </div>

                  <div
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      reservation.status === "확정"
                        ? "bg-green-100 text-green-700"
                        : reservation.status === "취소"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {reservation.status}
                  </div>
                </div>

                <div>{openId === reservation.id ? "▼" : "▶"}</div>
              </div>
              {openId === reservation.id && (
                <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                  <div className="max-w-2xl">
                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">연락처</div>
                        <div className="font-semibold">{reservation.phone}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">상태</div>
                        <div className="font-semibold">
                          {reservation.status}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">상품</div>
                        <div className="font-semibold">
                          {reservation.product}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">출발일</div>
                        <div className="font-semibold">
                          {reservation.departure_date}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className="font-semibold mb-2">예약인원</div>

                    {people
                      .filter(
                        (person) => person.reservation_id === reservation.id,
                      )
                      .map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center gap-3 rounded-md border px-3 py-2"
                        >
                          <div>👤 {person.name}</div>
                          <div>
                            {person.passport_image ? (
                              <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                등록
                              </span>
                            ) : (
                              <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                미등록
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
