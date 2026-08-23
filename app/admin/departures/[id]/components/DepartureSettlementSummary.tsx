"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { downloadDepartureSettlementExcel } from "./downloadDepartureSettlementExcel";

type Props = {
  reservations: any[];
  departure: any;
};

export default function DepartureSettlementSummary({
  reservations,
  departure,
}: Props) {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [insuranceCost, setInsuranceCost] = useState(
    Number(departure?.insurance_cost || 0),
  );

  useEffect(() => {
    if (reservations.length > 0) {
      loadSettlements();
    }
  }, [reservations]);

  useEffect(() => {
    setInsuranceCost(Number(departure?.insurance_cost || 0));
  }, [departure]);

  async function loadSettlements() {
    const reservationIds = reservations.map((reservation) => reservation.id);

    if (reservationIds.length === 0) {
      setSettlements([]);
      return;
    }

    const { data, error } = await supabase
      .from("reservation_settlements")
      .select("*")
      .in("reservation_id", reservationIds);

    if (error) {
      console.error("TOTAL SETTLEMENT ERROR:", error);
      return;
    }

    setSettlements(data || []);
  }

  async function saveInsuranceCost() {
    if (!departure?.id) return;

    const { error } = await supabase
      .from("departures")
      .update({
        insurance_cost: insuranceCost,
      })
      .eq("id", departure.id);

    if (error) {
      console.error("INSURANCE SAVE ERROR:", error);
      alert("보험료 저장에 실패했습니다.");
      return;
    }

    alert("보험료가 저장되었습니다.");
  }

  const settlementRows = reservations.map((reservation) => {
    const settlement = settlements.find(
      (item) => item.reservation_id === reservation.id,
    );

    const peopleCount = reservation.people?.length || 0;

    const guideCount =
      reservation.people?.filter((person: any) => person.is_guide).length || 0;

    const paidPeople = peopleCount - guideCount;

    const unitPrice = Number(settlement?.unit_price || 0);
    const airfare = Number(settlement?.airfare || 0);
    const landCost = Number(settlement?.land_cost || 0);
    const otherCost = Number(settlement?.other_cost || 0);

    const sales = unitPrice * paidPeople;

    const expense = airfare * peopleCount + landCost * paidPeople + otherCost;

    const profit = sales - expense;

    return {
      id: reservation.id,
      name: reservation.name,
      sales,
      expense,
      profit,
    };
  });

  const totalSales = settlementRows.reduce((sum, item) => sum + item.sales, 0);

  const totalReservationExpense = settlementRows.reduce(
    (sum, item) => sum + item.expense,
    0,
  );

  const totalReservationProfit = settlementRows.reduce(
    (sum, item) => sum + item.profit,
    0,
  );

  const totalExpense = totalReservationExpense + insuranceCost;

  const finalProfit = totalSales - totalExpense;

  function handleDownloadExcel() {
    const peopleCount = reservations.reduce(
      (sum, reservation) => sum + (reservation.people?.length || 0),
      0,
    );

    downloadDepartureSettlementExcel({
      productName: departure?.products?.title || "",
      departureDate: departure?.departure_date || "",
      peopleCount,

      rows: settlementRows,

      insuranceCost,

      totalSales,
      totalReservationExpense,
      totalExpense,
      finalProfit,
    });
  }

  return (
    <div className="mt-8 rounded-xl border bg-white p-6">
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">📊 일자별 총 정산</h2>

          <button
            type="button"
            onClick={handleDownloadExcel}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
          >
            📊 총 정산 엑셀 다운로드
          </button>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          {departure?.products?.title || "-"} ·{" "}
          {departure?.departure_date || "-"}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">예약자</th>

              <th className="px-4 py-3 text-right">판매금액</th>

              <th className="px-4 py-3 text-right">지출금액</th>

              <th className="px-4 py-3 text-right">예약수익</th>
            </tr>
          </thead>

          <tbody>
            {settlementRows.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{item.name}</td>

                <td className="px-4 py-3 text-right">
                  {item.sales.toLocaleString()}원
                </td>

                <td className="px-4 py-3 text-right">
                  {item.expense.toLocaleString()}원
                </td>

                <td className="px-4 py-3 text-right font-semibold text-green-700">
                  {item.profit.toLocaleString()}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border bg-gray-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="font-bold text-gray-900">🛡 여행자보험료</div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={insuranceCost}
              onChange={(e) => setInsuranceCost(Number(e.target.value))}
              className="w-40 rounded-lg border bg-white px-3 py-2 text-right"
            />

            <span className="text-sm">원</span>

            <button
              type="button"
              onClick={saveInsuranceCost}
              className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white"
            >
              저장
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-blue-50 p-5">
          <div className="text-sm text-gray-500">총 판매금액</div>

          <div className="mt-1 text-xl font-bold">
            {totalSales.toLocaleString()}원
          </div>
        </div>

        <div className="rounded-xl bg-orange-50 p-5">
          <div className="text-sm text-gray-500">총 지출금액</div>

          <div className="mt-1 text-xl font-bold">
            {totalExpense.toLocaleString()}원
          </div>
        </div>

        <div className="rounded-xl bg-green-50 p-5">
          <div className="text-sm text-gray-500">최종 수익</div>

          <div className="mt-1 text-xl font-bold">
            {finalProfit.toLocaleString()}원
          </div>
        </div>
      </div>
    </div>
  );
}
