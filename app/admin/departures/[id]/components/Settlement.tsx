"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { downloadSettlementExcel } from "./downloadSettlementExcel";

type Props = {
  reservations: any[];
  departure: any;
};

function getArrivalDate(departureDate: string, course: string) {
  if (!departureDate) return "";

  const [year, month, day] = departureDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (course === "4N5D" || course === "4박5일") {
    date.setDate(date.getDate() + 4);
  } else if (course === "3N4D" || course === "3박4일") {
    date.setDate(date.getDate() + 3);
  }

  const resultYear = date.getFullYear();
  const resultMonth = String(date.getMonth() + 1).padStart(2, "0");
  const resultDay = String(date.getDate()).padStart(2, "0");

  return `${resultYear}-${resultMonth}-${resultDay}`;
}

export default function Settlement({ reservations, departure }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [unitPrices, setUnitPrices] = useState<Record<string, number>>({});
  const [settlementIds, setSettlementIds] = useState<Record<string, number>>(
    {},
  );
  const [airfares, setAirfares] = useState<Record<string, number>>({});
  const [landCosts, setLandCosts] = useState<Record<string, number>>({});
  const [otherCosts, setOtherCosts] = useState<Record<string, number>>({});
  const [paymentOpenId, setPaymentOpenId] = useState<string | null>(null);

  const [paymentDates, setPaymentDates] = useState<Record<string, string>>({});
  const [paymentTypes, setPaymentTypes] = useState<Record<string, string>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>(
    {},
  );
  const [paymentMemos, setPaymentMemos] = useState<Record<string, string>>({});
  const [payments, setPayments] = useState<Record<string, any[]>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const [settlementFileTypes, setSettlementFileTypes] = useState<
    Record<string, string>
  >({});

  const [settlementFiles, setSettlementFiles] = useState<
    Record<string, File | null>
  >({});

  const [settlementFileMemos, setSettlementFileMemos] = useState<
    Record<string, string>
  >({});

  const [settlementUploadingId, setSettlementUploadingId] = useState<
    string | null
  >(null);

  const [settlementFileList, setSettlementFileList] = useState<
    Record<string, any[]>
  >({});

  useEffect(() => {
    loadSettlements();
    loadPayments();
    loadSettlementFiles();
  }, [reservations]);

  async function loadSettlementFiles() {
    const { data, error } = await supabase
      .from("settlement_files")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SETTLEMENT FILES ERROR", error);
      return;
    }

    const grouped: Record<string, any[]> = {};

    (data ?? []).forEach((file) => {
      const reservationId = String(file.reservation_id);

      if (!grouped[reservationId]) {
        grouped[reservationId] = [];
      }

      grouped[reservationId].push(file);
    });

    setSettlementFileList(grouped);
  }

  async function loadSettlements() {
    if (reservations.length === 0) return;

    const reservationIds = reservations.map((reservation) => reservation.id);

    const { data, error } = await supabase
      .from("reservation_settlements")
      .select("*")
      .in("reservation_id", reservationIds);

    if (error) {
      console.error("SETTLEMENT LOAD ERROR:", error);
      return;
    }

    const priceMap: Record<string, number> = {};
    const airfareMap: Record<string, number> = {};
    const landCostMap: Record<string, number> = {};
    const otherCostMap: Record<string, number> = {};
    const idMap: Record<string, number> = {};
    const completedStatusMap: Record<string, boolean> = {};

    (data || []).forEach((item) => {
      priceMap[item.reservation_id] = item.unit_price || 0;
      airfareMap[item.reservation_id] = item.airfare || 0;
      landCostMap[item.reservation_id] = item.land_cost || 0;
      otherCostMap[item.reservation_id] = item.other_cost || 0;
      completedStatusMap[item.reservation_id] = item.is_completed || false;
      idMap[item.reservation_id] = item.id;
    });

    setUnitPrices(priceMap);
    setAirfares(airfareMap);
    setLandCosts(landCostMap);
    setOtherCosts(otherCostMap);
    setCompletedMap(completedStatusMap);
    setSettlementIds(idMap);
  }

  async function viewSettlementFile(filePath: string) {
    const { data, error } = await supabase.storage
      .from("settlement-files")
      .createSignedUrl(filePath, 60 * 10);

    if (error) {
      console.error("SETTLEMENT FILE VIEW ERROR", error);
      alert("파일을 열 수 없습니다.");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function deleteSettlementFile(file: any) {
    const confirmed = window.confirm(
      `"${file.file_name}" 정산자료를 삭제하시겠습니까?`,
    );

    if (!confirmed) return;

    try {
      // 1. Private Storage 원본 파일 삭제
      const { error: storageError } = await supabase.storage
        .from("settlement-files")
        .remove([file.file_path]);

      if (storageError) {
        console.error("SETTLEMENT FILE DELETE ERROR", storageError);
        alert("파일 삭제에 실패했습니다.");
        return;
      }

      // 2. DB 기록 삭제
      const { error: dbError } = await supabase
        .from("settlement_files")
        .delete()
        .eq("id", file.id);

      if (dbError) {
        console.error("SETTLEMENT FILE DB DELETE ERROR", dbError);
        alert("정산자료 정보 삭제에 실패했습니다.");
        return;
      }

      // 3. 목록 새로고침
      await loadSettlementFiles();

      alert("정산자료가 삭제되었습니다.");
    } catch (error) {
      console.error("SETTLEMENT FILE DELETE ERROR", error);
      alert("정산자료 삭제 중 오류가 발생했습니다.");
    }
  }

  async function uploadSettlementFile(reservationId: string) {
    const file = settlementFiles[reservationId];

    if (!file) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }

    const fileType = settlementFileTypes[reservationId] || "기타";
    const memo = settlementFileMemos[reservationId] || "";

    setSettlementUploadingId(reservationId);

    try {
      // 파일명 충돌 방지
      const fileExt = file.name.split(".").pop();
      const filePath = `reservation-${reservationId}/${Date.now()}.${fileExt}`;

      // 1. Private Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from("settlement-files")
        .upload(filePath, file);

      if (uploadError) {
        console.error("SETTLEMENT FILE UPLOAD ERROR", uploadError);
        alert(uploadError.message);
        return;
      }

      // 2. DB에 파일 정보 저장
      const { error: dbError } = await supabase
        .from("settlement_files")
        .insert({
          reservation_id: reservationId,
          file_type: fileType,
          file_name: file.name,
          file_path: filePath,
          memo,
        });

      if (dbError) {
        // DB 저장 실패 시 방금 업로드한 Storage 파일도 제거
        await supabase.storage.from("settlement-files").remove([filePath]);

        console.error("SETTLEMENT FILE DB ERROR", dbError);
        alert(dbError.message);
        return;
      }

      // 3. 입력값 초기화
      setSettlementFiles((prev) => ({
        ...prev,
        [reservationId]: null,
      }));

      setSettlementFileMemos((prev) => ({
        ...prev,
        [reservationId]: "",
      }));

      setSettlementFileTypes((prev) => ({
        ...prev,
        [reservationId]: "항공료",
      }));

      // 4. 최신 목록 다시 불러오기
      await loadSettlementFiles();

      alert("정산자료가 업로드되었습니다.");
    } catch (error) {
      console.error("SETTLEMENT FILE ERROR", error);
      alert("정산자료 업로드 중 오류가 발생했습니다.");
    } finally {
      setSettlementUploadingId(null);
    }
  }

  async function loadPayments() {
    if (reservations.length === 0) return;

    const reservationIds = reservations.map((reservation) => reservation.id);

    const { data, error } = await supabase
      .from("reservation_payments")
      .select("*")
      .in("reservation_id", reservationIds)
      .order("payment_date", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("PAYMENT LOAD ERROR:", error);
      return;
    }

    const paymentMap: Record<string, any[]> = {};

    (data || []).forEach((payment) => {
      if (!paymentMap[payment.reservation_id]) {
        paymentMap[payment.reservation_id] = [];
      }

      paymentMap[payment.reservation_id].push(payment);
    });

    setPayments(paymentMap);
  }

  async function deletePayment(paymentId: number) {
    if (!confirm("이 입금내역을 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("reservation_payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      console.error("PAYMENT DELETE ERROR:", error);
      alert("입금내역 삭제 중 오류가 발생했습니다.");
      return;
    }

    await loadPayments();
  }

  async function saveSettlement(reservation: any) {
    const unitPrice = unitPrices[reservation.id] || 0;
    const peopleCount = reservation.people?.length || 0;
    const totalPrice = unitPrice * peopleCount;

    const airfare = airfares[reservation.id] || 0;
    const landCost = landCosts[reservation.id] || 0;
    const otherCost = otherCosts[reservation.id] || 0;

    const { data, error } = await supabase
      .from("reservation_settlements")
      .upsert(
        {
          reservation_id: reservation.id,
          unit_price: unitPrice,
          total_price: totalPrice,
          airfare: airfare,
          land_cost: landCost,
          other_cost: otherCost,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "reservation_id",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("SETTLEMENT SAVE ERROR:", error);
      alert("정산 저장 중 오류가 발생했습니다.");
      return;
    }

    setSettlementIds((prev) => ({
      ...prev,
      [reservation.id]: data.id,
    }));

    alert("저장되었습니다.");
  }

  async function savePayment(reservationId: string) {
    const paymentDate = paymentDates[reservationId];
    const paymentType = paymentTypes[reservationId] || "계약금";
    const amount = paymentAmounts[reservationId] || 0;
    const memo = paymentMemos[reservationId] || "";

    if (!paymentDate) {
      alert("입금일을 선택해주세요.");
      return;
    }

    if (amount <= 0) {
      alert("입금액을 입력해주세요.");
      return;
    }

    const { error } = await supabase.from("reservation_payments").insert({
      reservation_id: reservationId,
      payment_date: paymentDate,
      payment_type: paymentType,
      amount,
      memo,
    });

    if (error) {
      console.error("PAYMENT SAVE ERROR:", error);
      alert("입금내역 저장 중 오류가 발생했습니다.");
      return;
    }

    alert("입금내역이 저장되었습니다.");
    await loadPayments();

    setPaymentDates((prev) => ({
      ...prev,
      [reservationId]: "",
    }));

    setPaymentTypes((prev) => ({
      ...prev,
      [reservationId]: "계약금",
    }));

    setPaymentAmounts((prev) => ({
      ...prev,
      [reservationId]: 0,
    }));

    setPaymentMemos((prev) => ({
      ...prev,
      [reservationId]: "",
    }));

    setPaymentOpenId(null);
  }

  async function toggleCompleted(reservation: any) {
    const nextCompleted = !completedMap[reservation.id];

    const unitPrice = unitPrices[reservation.id] || 0;
    const peopleCount = reservation.people?.length || 0;

    const { error } = await supabase.from("reservation_settlements").upsert(
      {
        reservation_id: reservation.id,
        unit_price: unitPrice,
        total_price: unitPrice * peopleCount,
        airfare: airfares[reservation.id] || 0,
        land_cost: landCosts[reservation.id] || 0,
        other_cost: otherCosts[reservation.id] || 0,
        is_completed: nextCompleted,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "reservation_id",
      },
    );

    if (error) {
      console.error("SETTLEMENT COMPLETE ERROR:", error);
      alert("정산상태 변경 중 오류가 발생했습니다.");
      return;
    }

    setCompletedMap((prev) => ({
      ...prev,
      [reservation.id]: nextCompleted,
    }));
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">💰 정산</h2>

      <div className="space-y-3">
        {reservations.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
            등록된 예약이 없습니다.
          </div>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="rounded-xl border bg-white p-5"
            >
              <div
                className="flex cursor-pointer items-center justify-between"
                onClick={() =>
                  setOpenId(openId === reservation.id ? null : reservation.id)
                }
              >
                <div>
                  <div className="font-bold text-gray-900">
                    👤 {reservation.name}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    예약인원 {reservation.people?.length || 0}명
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${
                      completedMap[reservation.id]
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {completedMap[reservation.id] ? "정산완료" : "미정산"}
                  </span>

                  <span className="text-gray-400">
                    {openId === reservation.id ? "▼" : "▶"}
                  </span>
                </div>
              </div>
              {openId === reservation.id && (
                <div className="mt-5 border-t pt-5">
                  {/* 매출 */}
                  <div>
                    <h3 className="mb-3 font-bold text-gray-800">💵 매출</h3>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <div className="mb-1 text-xs text-gray-500">
                          1인 상품가
                        </div>
                        <input
                          type="number"
                          value={unitPrices[reservation.id] ?? ""}
                          onChange={(e) =>
                            setUnitPrices((prev) => ({
                              ...prev,
                              [reservation.id]: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="w-full rounded-lg border px-3 py-2 text-right"
                        />
                      </div>

                      <div>
                        <div className="mb-1 text-xs text-gray-500">인원</div>
                        <div className="rounded-lg bg-gray-100 px-3 py-2 text-right">
                          {reservation.people?.length || 0}명
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs text-gray-500">
                          총 여행경비
                        </div>
                        <div className="rounded-lg bg-blue-50 px-3 py-2 text-right font-bold text-blue-700">
                          {(
                            (unitPrices[reservation.id] || 0) *
                            (reservation.people?.length || 0)
                          ).toLocaleString()}
                          원
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 정산자료 */}
                  <div className="mt-6 rounded-xl border bg-gray-50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800">📎 정산자료</h3>

                      <span className="text-xs text-gray-500">
                        {
                          (settlementFileList[String(reservation.id)] || [])
                            .length
                        }
                        건
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {/* 자료 구분 */}
                      <div>
                        <div className="mb-1 text-xs text-gray-500">
                          자료 구분
                        </div>

                        <select
                          value={
                            settlementFileTypes[String(reservation.id)] ||
                            "항공료"
                          }
                          onChange={(e) =>
                            setSettlementFileTypes((prev) => ({
                              ...prev,
                              [String(reservation.id)]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border bg-white px-3 py-2"
                        >
                          <option value="항공료">항공료</option>
                          <option value="현지비">현지비</option>
                          <option value="기타">기타</option>
                        </select>
                      </div>

                      {/* 파일 선택 */}
                      <div>
                        <div className="mb-1 text-xs text-gray-500">파일</div>

                        <input
                          type="file"
                          onChange={(e) =>
                            setSettlementFiles((prev) => ({
                              ...prev,
                              [String(reservation.id)]:
                                e.target.files?.[0] || null,
                            }))
                          }
                          className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      {/* 메모 */}
                      <div>
                        <div className="mb-1 text-xs text-gray-500">메모</div>

                        <input
                          type="text"
                          value={
                            settlementFileMemos[String(reservation.id)] || ""
                          }
                          onChange={(e) =>
                            setSettlementFileMemos((prev) => ({
                              ...prev,
                              [String(reservation.id)]: e.target.value,
                            }))
                          }
                          placeholder="선택사항"
                          className="w-full rounded-lg border bg-white px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          uploadSettlementFile(String(reservation.id))
                        }
                        disabled={
                          settlementUploadingId === String(reservation.id)
                        }
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {settlementUploadingId === String(reservation.id)
                          ? "업로드 중..."
                          : "+ 자료 업로드"}
                      </button>
                    </div>
                    {/* 업로드된 정산자료 목록 */}
                    <div className="mt-4 space-y-2">
                      {(settlementFileList[String(reservation.id)] || []).map(
                        (file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between rounded-lg border bg-white px-3 py-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">
                                  {file.file_type === "항공료"
                                    ? "✈️"
                                    : file.file_type === "현지비"
                                      ? "🏨"
                                      : "📄"}
                                </span>

                                <span className="font-semibold text-gray-800">
                                  {file.file_type}
                                </span>

                                <span className="truncate text-sm text-gray-600">
                                  {file.file_name}
                                </span>
                              </div>

                              {file.memo && (
                                <div className="mt-1 text-xs text-gray-500">
                                  {file.memo}
                                </div>
                              )}
                            </div>

                            <div className="ml-4 flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  viewSettlementFile(file.file_path)
                                }
                                className="rounded-lg border px-3 py-1.5 text-sm font-semibold"
                              >
                                보기
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteSettlementFile(file)}
                                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* 입금내역 */}
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800">💰 입금내역</h3>

                      <button
                        type="button"
                        onClick={() =>
                          setPaymentOpenId(
                            paymentOpenId === reservation.id
                              ? null
                              : reservation.id,
                          )
                        }
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white"
                      >
                        + 입금 추가
                      </button>
                    </div>

                    {paymentOpenId === reservation.id && (
                      <div className="mb-3 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-4">
                        <div>
                          <div className="mb-1 text-xs text-gray-500">
                            입금일
                          </div>
                          <input
                            type="date"
                            className="w-full rounded-lg border px-3 py-2"
                            value={paymentDates[reservation.id] || ""}
                            min="1900-01-01"
                            max="9999-12-31"
                            onChange={(e) => {
                              const value = e.target.value;
                              const year = value.split("-")[0];

                              if (year.length > 4) return;

                              setPaymentDates((prev) => ({
                                ...prev,
                                [reservation.id]: value,
                              }));
                            }}
                          />
                        </div>

                        <div>
                          <div className="mb-1 text-xs text-gray-500">구분</div>
                          <select
                            className="w-full rounded-lg border px-3 py-2"
                            value={paymentTypes[reservation.id] || ""}
                            onChange={(e) =>
                              setPaymentTypes((prev) => ({
                                ...prev,
                                [reservation.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="계약금">계약금</option>
                            <option value="중도금">중도금</option>
                            <option value="잔금">잔금</option>
                            <option value="기타">기타</option>
                          </select>
                        </div>

                        <div>
                          <div className="mb-1 text-xs text-gray-500">
                            입금액
                          </div>
                          <input
                            type="number"
                            placeholder="0"
                            className="w-full rounded-lg border px-3 py-2 text-right"
                            value={paymentAmounts[reservation.id] || ""}
                            onChange={(e) =>
                              setPaymentAmounts((prev) => ({
                                ...prev,
                                [reservation.id]: Number(e.target.value),
                              }))
                            }
                          />
                        </div>

                        <div>
                          <div className="mb-1 text-xs text-gray-500">메모</div>
                          <input
                            type="text"
                            placeholder="메모"
                            className="w-full rounded-lg border px-3 py-2"
                            value={paymentMemos[reservation.id] || ""}
                            onChange={(e) =>
                              setPaymentMemos((prev) => ({
                                ...prev,
                                [reservation.id]: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="flex justify-end sm:col-span-4">
                          <button
                            type="button"
                            onClick={() => savePayment(reservation.id)}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
                          >
                            입금 저장
                          </button>
                        </div>
                      </div>
                    )}

                    {(payments[reservation.id]?.length || 0) === 0 ? (
                      <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-400">
                        등록된 입금내역이 없습니다.
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border">
                        {payments[reservation.id].map((payment) => (
                          <div
                            key={payment.id}
                            className="grid grid-cols-[120px_100px_1fr_1fr_60px] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0"
                          >
                            <div className="text-gray-500">
                              {payment.payment_date}
                            </div>

                            <div className="font-semibold">
                              {payment.payment_type}
                            </div>

                            <div className="text-right font-bold">
                              {Number(payment.amount).toLocaleString()}원
                            </div>

                            <div className="text-gray-500">
                              {payment.memo || "-"}
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => deletePayment(payment.id)}
                                className="rounded-lg bg-red-600 px-3 py-1 text-sm font-bold text-white hover:bg-red-700"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="flex justify-between rounded-lg bg-blue-50 px-4 py-3">
                            <span className="font-semibold text-gray-700">
                              총 입금액
                            </span>

                            <span className="font-bold text-blue-700">
                              {(
                                payments[reservation.id]?.reduce(
                                  (sum, payment) =>
                                    sum + Number(payment.amount || 0),
                                  0,
                                ) || 0
                              ).toLocaleString()}
                              원
                            </span>
                          </div>

                          <div className="flex justify-between rounded-lg bg-red-50 px-4 py-3">
                            <span className="font-semibold text-gray-700">
                              미수금
                            </span>

                            <span className="font-bold text-red-600">
                              {Math.max(
                                (unitPrices[reservation.id] || 0) *
                                  (reservation.people?.length || 0) -
                                  (payments[reservation.id]?.reduce(
                                    (sum, payment) =>
                                      sum + Number(payment.amount || 0),
                                    0,
                                  ) || 0),
                                0,
                              ).toLocaleString()}
                              원
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 원가 */}
                  <div className="mt-6">
                    <h3 className="mb-3 font-bold text-gray-800">📉 원가</h3>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <div className="mb-1 text-xs text-gray-500">
                          1인 항공료
                        </div>
                        <input
                          type="number"
                          value={airfares[reservation.id] ?? ""}
                          onChange={(e) =>
                            setAirfares((prev) => ({
                              ...prev,
                              [reservation.id]: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="w-full rounded-lg border px-3 py-2 text-right"
                        />
                      </div>

                      <div>
                        <div className="mb-1 text-xs text-gray-500">
                          1인 랜드비
                        </div>
                        <input
                          type="number"
                          value={landCosts[reservation.id] ?? ""}
                          onChange={(e) =>
                            setLandCosts((prev) => ({
                              ...prev,
                              [reservation.id]: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="w-full rounded-lg border px-3 py-2 text-right"
                        />
                      </div>

                      <div>
                        <div className="mb-1 text-xs text-gray-500">
                          기타비용
                        </div>
                        <input
                          type="number"
                          value={otherCosts[reservation.id] ?? ""}
                          onChange={(e) =>
                            setOtherCosts((prev) => ({
                              ...prev,
                              [reservation.id]: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="w-full rounded-lg border px-3 py-2 text-right"
                        />
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {/* 항공료 합계 */}
                        <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-3">
                          <span className="text-sm text-gray-500">
                            항공료 합계
                          </span>

                          <span className="font-semibold">
                            {(
                              (airfares[reservation.id] || 0) *
                              (reservation.people?.length || 0)
                            ).toLocaleString()}
                            원
                          </span>
                        </div>

                        {/* 랜드비 합계 */}
                        <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-3">
                          <span className="text-sm text-gray-500">
                            랜드비 합계
                          </span>

                          <span className="font-semibold">
                            {(
                              (landCosts[reservation.id] || 0) *
                              (reservation.people?.length || 0)
                            ).toLocaleString()}
                            원
                          </span>
                        </div>

                        {/* 총 원가 */}
                        <div className="flex justify-between rounded-lg bg-orange-50 px-4 py-3">
                          <span className="font-semibold text-gray-700">
                            총 원가
                          </span>

                          <span className="font-bold text-orange-700">
                            {(
                              (airfares[reservation.id] || 0) *
                                (reservation.people?.length || 0) +
                              (landCosts[reservation.id] || 0) *
                                (reservation.people?.length || 0) +
                              (otherCosts[reservation.id] || 0)
                            ).toLocaleString()}
                            원
                          </span>
                        </div>

                        {/* 수익금 */}
                        <div className="flex justify-between rounded-lg bg-green-50 px-4 py-3">
                          <span className="font-semibold text-gray-700">
                            수익금
                          </span>

                          <span className="font-bold text-green-700">
                            {(
                              (unitPrices[reservation.id] || 0) *
                                (reservation.people?.length || 0) -
                              ((airfares[reservation.id] || 0) *
                                (reservation.people?.length || 0) +
                                (landCosts[reservation.id] || 0) *
                                  (reservation.people?.length || 0) +
                                (otherCosts[reservation.id] || 0))
                            ).toLocaleString()}
                            원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        downloadSettlementExcel({
                          productName: departure?.products?.title || "",
                          departureDate: departure?.departure_date || "",
                          arrivalDate: getArrivalDate(
                            departure?.departure_date,
                            departure?.course,
                          ),

                          reservationName: reservation.name,
                          peopleCount: reservation.people?.length || 0,

                          unitPrice: unitPrices[reservation.id] || 0,
                          airfare: airfares[reservation.id] || 0,
                          landCost: landCosts[reservation.id] || 0,
                          otherCost: otherCosts[reservation.id] || 0,

                          payments: payments[reservation.id] || [],

                          isCompleted: completedMap[reservation.id] || false,
                        })
                      }
                      className="rounded-lg bg-violet-600 px-5 py-2.5 font-bold text-white hover:bg-violet-700"
                    >
                      📊 엑셀 다운로드
                    </button>

                    <button
                      type="button"
                      onClick={() => saveSettlement(reservation)}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700"
                    >
                      💾 정산 저장
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCompleted(reservation)}
                      className={`rounded-lg px-5 py-2.5 font-bold text-white ${
                        completedMap[reservation.id]
                          ? "bg-gray-500 hover:bg-gray-600"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {completedMap[reservation.id]
                        ? "정산완료 취소"
                        : "✅ 정산완료"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
