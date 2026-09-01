"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DepartureCard from "@/components/DepartureCard";
import DepartureTable from "./components/DepartureTable";
import AddDepartureModal from "./components/AddDepartureModal";
import { loadProducts as fetchProducts } from "./lib/loadProducts";
import * as XLSX from "xlsx-js-style";

type Departure = {
  id: string;
  product_id: string;
  departure_date: string;
  variant: string | null;
  course: string;
  airline: string;
  price: number;
  seat: number;
  status: string;
};

type Product = {
  id: string;
  title: string;
};

export default function DepartureAdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [departures, setDepartures] = useState<Departure[]>([]);
  const [selectedDepartureIds, setSelectedDepartureIds] = useState<string[]>(
    [],
  );
  const [passengerCounts, setPassengerCounts] = useState<
    Record<string, number>
  >({});
  const [settlementCompleted, setSettlementCompleted] = useState<
    Record<string, boolean>
  >({});

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkStartDate, setBulkStartDate] = useState("");
  const [bulkEndDate, setBulkEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [bulkCourse, setBulkCourse] = useState("");
  const [bulkVariant, setBulkVariant] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkAirline, setBulkAirline] = useState("");
  const [bulkSeat, setBulkSeat] = useState("180");
  const [bulkStatus, setBulkStatus] = useState("예약가능");
  const [courseFilter, setCourseFilter] = useState("전체");
  const [showPastDepartures, setShowPastDepartures] = useState(false);

  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

  const [bulkEditField, setBulkEditField] = useState<
    "price" | "airline" | "seat" | "status"
  >("price");

  const [bulkEditValue, setBulkEditValue] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredDepartures = departures.filter((departure) => {
    // 일정 필터
    if (courseFilter !== "전체" && departure.course !== courseFilter) {
      return false;
    }

    const departureDate = new Date(`${departure.departure_date}T00:00:00`);
    const isPast = departureDate < today;

    // 지난 출발일 전체보기 상태
    if (showPastDepartures) {
      return true;
    }

    // 지난 출발일이지만 정산이 끝나지 않았다면 계속 표시
    if (isPast && !settlementCompleted[departure.id]) {
      return true;
    }

    // 지난 출발일 + 정산완료 → 숨김
    if (isPast && settlementCompleted[departure.id]) {
      return false;
    }

    // 오늘 및 미래 출발일 → 표시
    return true;
  });

  function toggleDepartureSelection(id: string) {
    setSelectedDepartureIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleSelectAll() {
    const visibleIds = filteredDepartures.map((departure) => departure.id);

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedDepartureIds.includes(id));

    if (allSelected) {
      setSelectedDepartureIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
    } else {
      setSelectedDepartureIds((current) =>
        Array.from(new Set([...current, ...visibleIds])),
      );
    }
  }

  function clearSelection() {
    setSelectedDepartureIds([]);
  }

  console.log("selectedProductId =", selectedProductId);
  console.log("filtered =", filteredDepartures.length);

  function downloadExcel() {
    const rows = filteredDepartures.map((departure) => {
      const reserved = passengerCounts[departure.id] ?? 0;

      return {
        출발일: departure.departure_date,
        일정: departure.course,
        가격: departure.price,
        항공사: departure.airline,
        총좌석: departure.seat,
        모객: reserved,
        잔여: departure.seat - reserved,
        상태: departure.status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "출발일");

    XLSX.writeFile(workbook, "출발일관리.xlsx");
  }

  const weekDays = [
    { label: "월", value: 1 },
    { label: "화", value: 2 },
    { label: "수", value: 3 },
    { label: "목", value: 4 },
    { label: "금", value: 5 },
    { label: "토", value: 6 },
    { label: "일", value: 7 },
  ];

  async function loadProducts() {
    const data = await fetchProducts();

    setProducts(data ?? []);
    const savedProductId = localStorage.getItem("selectedProductId");
    if (data && data.length > 0) {
      const productExists = data.some(
        (product) => product.id === savedProductId,
      );

      setSelectedProductId(productExists ? savedProductId! : data[0].id);
    }
  }
  async function loadDepartures() {
    let query = supabase.from("departures").select("*").order("departure_date");

    if (selectedProductId) {
      query = query.eq("product_id", selectedProductId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return;
    }

    console.table(
      data?.map((item) => ({
        product_id: item.product_id,
        departure: item.departure_date,
      })),
    );
    setDepartures(data ?? []);
    /*기존예약건수계산
    const { data: reservations } = await supabase
      .from("reservations")
      .select("departure_id");
    console.log("reservations", reservations);

    const counts: Record<string, number> = {};

    reservations?.forEach((reservation) => {
      if (!reservation.departure_id) return;

      counts[reservation.departure_id] =
        (counts[reservation.departure_id] ?? 0) + 1;
    });

    setPassengerCounts(counts);
    */
    const { data: people } = await supabase
      .from("reservation_people")
      .select("reservation_id");

    const { data: reservations } = await supabase
      .from("reservations")
      .select("id, departure_id, status");

    const reservationMap = new Map<string, string>();

    reservations?.forEach((reservation) => {
      if (!reservation.departure_id) return;

      // 확정 예약만 좌석 차감
      if (reservation.status !== "확정") return;

      reservationMap.set(reservation.id, reservation.departure_id);
    });

    const counts: Record<string, number> = {};

    people?.forEach((person) => {
      const departureId = reservationMap.get(person.reservation_id);
      if (!departureId) return;

      counts[departureId] = (counts[departureId] ?? 0) + 1;
    });

    setPassengerCounts(counts);

    const { data: settlements } = await supabase
      .from("reservation_settlements")
      .select("reservation_id, is_completed");

    const settlementMap = new Map<string, boolean>();

    settlements?.forEach((settlement) => {
      settlementMap.set(settlement.reservation_id, settlement.is_completed);
    });

    const completedByDeparture: Record<string, boolean> = {};

    (data ?? []).forEach((departure) => {
      const departureReservationIds =
        reservations
          ?.filter((reservation) => reservation.departure_id === departure.id)
          .map((reservation) => reservation.id) ?? [];

      if (departureReservationIds.length === 0) {
        completedByDeparture[departure.id] = false;
        return;
      }

      completedByDeparture[departure.id] = departureReservationIds.every(
        (reservationId) => settlementMap.get(reservationId) === true,
      );
    });

    setSettlementCompleted(completedByDeparture);
  }
  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadDepartures();
  }, [selectedProductId]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeparture, setEditingDeparture] = useState<any>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<any>(null);
  const [departureReservations, setDepartureReservations] = useState<any[]>([]);
  const [totalPassengers, setTotalPassengers] = useState(0);
  const [hasReservation, setHasReservation] = useState(false);

  async function addDeparture(data: {
    departure_date: string;
    course: string;
    variant: string | null;
    price: number;
    price_note: string | null;
    airline: string;
    seat: number;
    status: string;
    is_special: boolean;
  }) {
    if (editingDeparture) {
      console.log("수정모드", editingDeparture);
      const { count } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("departure_id", editingDeparture.id);

      const hasReservation = (count ?? 0) > 0;
      if (hasReservation) {
        alert(
          "예약이 있는 출발일은 출발일, 일정, 코스구분은 변경되지 않습니다.",
        );
        data.departure_date = editingDeparture.departure_date;
        data.course = editingDeparture.course;
        data.variant = editingDeparture.variant ?? null;
      }
      console.log("예약존재:", hasReservation);
      console.log("저장할 status =", data.status);
      const { error } = await supabase
        .from("departures")
        .update({
          departure_date: data.departure_date,
          course: data.course,
          variant: data.variant,
          price: data.price,
          price_note: data.price_note,
          airline: data.airline,
          seat: data.seat,
          status: data.status,
          is_special: data.is_special,
        })
        .eq("id", editingDeparture.id);

      if (error) {
        console.log(error);
        alert("출발일 수정 실패");
        return;
      }

      await loadDepartures();
      setEditingDeparture(null);
      setShowAddModal(false);
      return;
    }
    const { error } = await supabase.from("departures").insert({
      product_id: selectedProductId,
      departure_date: data.departure_date,
      course: data.course,
      variant: data.variant,
      price: data.price,
      price_note: data.price_note,
      airline: data.airline,
      seat: data.seat,
      status: data.status,
      is_special: data.is_special,
    });
    if (error) {
      alert("출발일 저장 실패");
      return;
    }

    await loadDepartures();
    setShowAddModal(false);
  }
  async function deleteDeparture(departure: any) {
    if (!confirm("출발일을 삭제하시겠습니까?")) return;

    const { count } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("departure_id", departure.id);

    if ((count ?? 0) > 0) {
      alert("⚠️ 예약이 있는 출발일은 삭제할 수 없습니다.");
      return;
    }
    const { error } = await supabase
      .from("departures")
      .delete()
      .eq("id", departure.id);

    if (error) {
      alert("삭제 실패");
      console.log(error);
      return;
    }

    await loadDepartures();
  }

  async function deleteSelectedDepartures() {
    if (selectedDepartureIds.length === 0) return;

    const confirmed = confirm(
      `선택한 ${selectedDepartureIds.length}건을 일괄 삭제하시겠습니까?\n\n예약이 있는 출발일은 삭제에서 제외됩니다.`,
    );

    if (!confirmed) return;

    // 선택된 출발일 중 예약이 있는 출발일 확인
    const { data: reservations, error: reservationError } = await supabase
      .from("reservations")
      .select("departure_id")
      .in("departure_id", selectedDepartureIds);

    if (reservationError) {
      console.error(reservationError);
      alert("예약 확인 중 오류가 발생했습니다.");
      return;
    }

    const reservedDepartureIds = new Set(
      (reservations ?? [])
        .map((reservation) => reservation.departure_id)
        .filter(Boolean),
    );

    // 예약 없는 출발일만 삭제 대상
    const deletableIds = selectedDepartureIds.filter(
      (id) => !reservedDepartureIds.has(id),
    );

    const skippedCount = selectedDepartureIds.length - deletableIds.length;

    if (deletableIds.length === 0) {
      alert(
        `선택한 출발일은 모두 예약이 있어 삭제할 수 없습니다.\n\n제외 : ${skippedCount}건`,
      );
      return;
    }

    const { error } = await supabase
      .from("departures")
      .delete()
      .in("id", deletableIds);

    if (error) {
      console.error(error);
      alert("일괄 삭제에 실패했습니다.");
      return;
    }

    await loadDepartures();
    clearSelection();

    alert(
      `일괄 삭제 완료!\n\n삭제 : ${deletableIds.length}건\n예약 존재로 제외 : ${skippedCount}건`,
    );
  }

  async function updateSelectedDepartures() {
    if (selectedDepartureIds.length === 0) return;

    if (!bulkEditValue.trim()) {
      alert("수정할 값을 입력해주세요.");
      return;
    }

    const updateData: {
      price?: number;
      airline?: string;
      seat?: number;
      status?: string;
    } = {};

    let fieldLabel = "";

    if (bulkEditField === "price") {
      const price = Number(bulkEditValue.replaceAll(",", ""));

      if (!Number.isFinite(price) || price < 0) {
        alert("가격을 올바르게 입력해주세요.");
        return;
      }

      updateData.price = price;
      fieldLabel = "가격";
    }

    if (bulkEditField === "airline") {
      updateData.airline = bulkEditValue.trim();
      fieldLabel = "항공사";
    }

    if (bulkEditField === "seat") {
      const seat = Number(bulkEditValue);

      if (!Number.isInteger(seat) || seat <= 0) {
        alert("총좌석을 올바르게 입력해주세요.");
        return;
      }

      // 현재 예약인원보다 적게 좌석을 수정하는 것 방지
      const invalidDepartures = departures.filter(
        (departure) =>
          selectedDepartureIds.includes(departure.id) &&
          (passengerCounts[departure.id] ?? 0) > seat,
      );

      if (invalidDepartures.length > 0) {
        alert(
          `예약인원보다 총좌석을 적게 설정할 수 없습니다.\n\n확인 필요 : ${invalidDepartures.length}건`,
        );
        return;
      }

      updateData.seat = seat;
      fieldLabel = "총좌석";
    }

    if (bulkEditField === "status") {
      const allowedStatuses = ["예약가능", "마감임박", "마감"];

      if (!allowedStatuses.includes(bulkEditValue)) {
        alert("상태를 선택해주세요.");
        return;
      }

      updateData.status = bulkEditValue;
      fieldLabel = "상태";
    }

    const confirmed = confirm(
      `선택한 ${selectedDepartureIds.length}건의 ${fieldLabel}을(를) 일괄 수정하시겠습니까?`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("departures")
      .update(updateData)
      .in("id", selectedDepartureIds);

    if (error) {
      console.error(error);
      alert("일괄 수정에 실패했습니다.");
      return;
    }

    await loadDepartures();

    setIsBulkEditOpen(false);
    setBulkEditValue("");
    clearSelection();

    alert(`${selectedDepartureIds.length}건 일괄 수정 완료!`);
  }

  async function loadDepartureReservations(departureId: string) {
    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
        *,
        people:reservation_people(*)
        `,
      )
      .eq("departure_id", departureId);

    if (error) {
      console.error(error);
      return;
    }

    setDepartureReservations(data ?? []);
    const total = (data ?? []).reduce(
      (sum, reservation) => sum + (reservation.people?.length ?? 0),
      0,
    );

    setTotalPassengers(total);
  }

  async function generateBulkDepartures() {
    console.log("생성 클릭");
    if (!bulkStartDate || !bulkEndDate) {
      alert("시작일과 종료일을 선택해주세요.");
      return;
    }

    const current = new Date(bulkStartDate);
    const end = new Date(bulkEndDate);

    let createdCount = 0;
    let skippedCount = 0;

    while (current <= end) {
      const day = current.getDay();
      const weekDay = day === 0 ? 7 : day;

      if (selectedDays.includes(weekDay)) {
        const newDeparture = {
          product_id: selectedProductId,
          departure_date: current.toISOString().slice(0, 10),
          course: bulkCourse,
          variant: bulkVariant || null,
          price: Number(bulkPrice),
          airline: bulkAirline,
          seat: Number(bulkSeat),
          status: "예약가능",
        };

        console.log(newDeparture);

        // 먼저 중복 확인
        let duplicateQuery = supabase
          .from("departures")
          .select("id")
          .eq("product_id", selectedProductId)
          .eq("departure_date", newDeparture.departure_date);

        if (newDeparture.variant) {
          duplicateQuery = duplicateQuery.eq("variant", newDeparture.variant);
        } else {
          duplicateQuery = duplicateQuery.is("variant", null);
        }

        const { data: exists } = await duplicateQuery.maybeSingle();

        if (exists) {
          skippedCount++;
        } else {
          const { error } = await supabase
            .from("departures")
            .insert(newDeparture);

          if (error) {
            console.error(error);
          } else {
            createdCount++;
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }
    await loadDepartures();
    setIsBulkOpen(false);
    alert(
      `출발일 생성 완료!

생성 : ${createdCount}건
중복 제외 : ${skippedCount}건`,
    );
  }
  const courseOptions = [
    "전체",
    ...Array.from(
      new Set(departures.map((departure) => departure.course).filter(Boolean)),
    ),
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">출발일 관리</h1>
      <div className="mt-6 mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => {
            localStorage.removeItem("selectedProductId");
            setSelectedProductId("");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            selectedProductId === ""
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          전체
        </button>
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => {
              localStorage.setItem("selectedProductId", product.id);
              setSelectedProductId(product.id);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedProductId === product.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {product.title}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsBulkOpen(true)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          ⚡ 일괄 생성
        </button>

        <button
          onClick={() => {
            setEditingDeparture(null);
            setShowAddModal(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + 출발일 추가
        </button>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {courseOptions.map((course) => (
              <button
                key={course}
                onClick={() => setCourseFilter(course)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  courseFilter === course
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {course}
              </button>
            ))}
          </div>

          <button
            onClick={downloadExcel}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            📥 엑셀 다운
          </button>
          <button
            onClick={() => setShowPastDepartures((prev) => !prev)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              showPastDepartures
                ? "bg-gray-700 text-white hover:bg-gray-800"
                : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            {showPastDepartures ? "📁 지난 출발일 접기" : "📂 지난 출발일 보기"}
          </button>
        </div>
      </div>
      {/*}
      {departures.map((departure) => (
        <DepartureCard key={departure.id} departure={departure} />
      ))}
      */}

      {selectedDepartureIds.length > 0 && (
        <div className="my-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="font-semibold text-blue-800">
            선택 {selectedDepartureIds.length}건
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              선택 해제
            </button>

            <button
              type="button"
              onClick={() => {
                setBulkEditField("price");
                setBulkEditValue("");
                setIsBulkEditOpen(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              ✏️ 일괄 수정
            </button>

            <button
              type="button"
              onClick={deleteSelectedDepartures}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              🗑️ 일괄 삭제
            </button>
          </div>
        </div>
      )}

      <DepartureTable
        departures={filteredDepartures}
        passengerCounts={passengerCounts}
        settlementCompleted={settlementCompleted}
        selectedDepartureIds={selectedDepartureIds}
        onToggleSelection={toggleDepartureSelection}
        onToggleSelectAll={toggleSelectAll}
        onEdit={(departure) => {
          setEditingDeparture(departure);
          const hasReservation = (passengerCounts[departure.id] ?? 0) > 0;
          setHasReservation(hasReservation);
          setShowAddModal(true);
        }}
        onDelete={deleteDeparture}
        onView={async (departure) => {
          setSelectedDeparture(departure);
          setShowReservationModal(true);
          await loadDepartureReservations(departure.id);
        }}
        onManage={(departure) => {
          router.push(`/admin/departures/${departure.id}`);
        }}
      />
      <AddDepartureModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addDeparture}
        departure={editingDeparture}
        hasReservation={hasReservation}
      />
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">✏️ 출발일 일괄 수정</h2>

            <p className="mt-2 text-sm text-gray-500">
              선택한 {selectedDepartureIds.length}건을 한 번에 수정합니다.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  수정 항목
                </label>

                <select
                  value={bulkEditField}
                  onChange={(e) => {
                    setBulkEditField(
                      e.target.value as "price" | "airline" | "seat" | "status",
                    );
                    setBulkEditValue("");
                  }}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="price">가격</option>
                  <option value="airline">항공사</option>
                  <option value="seat">총좌석</option>
                  <option value="status">상태</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  변경 값
                </label>

                {bulkEditField === "status" ? (
                  <select
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">상태 선택</option>
                    <option value="예약가능">예약가능</option>
                    <option value="마감임박">마감임박</option>
                    <option value="마감">마감</option>
                  </select>
                ) : (
                  <input
                    type={bulkEditField === "seat" ? "number" : "text"}
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    placeholder={
                      bulkEditField === "price"
                        ? "예) 1290000"
                        : bulkEditField === "airline"
                          ? "예) 티웨이항공"
                          : "예) 180"
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                )}
              </div>

              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                출발일, 일정, 코스구분은 일괄 수정되지 않습니다.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsBulkEditOpen(false);
                  setBulkEditValue("");
                }}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
              >
                취소
              </button>

              <button
                type="button"
                onClick={updateSelectedDepartures}
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                일괄 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold">⚡ 출발일 일괄 생성</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  시작일
                </label>

                <input
                  type="date"
                  value={bulkStartDate}
                  min="1900-01-01"
                  max="9999-12-31"
                  onChange={(e) => {
                    const value = e.target.value;
                    const year = value.split("-")[0];

                    if (year.length > 4) return;

                    setBulkStartDate(value);
                  }}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  종료일
                </label>

                <input
                  type="date"
                  value={bulkEndDate}
                  min="1900-01-01"
                  max="9999-12-31"
                  onChange={(e) => {
                    const value = e.target.value;
                    const year = value.split("-")[0];

                    if (year.length > 4) return;

                    setBulkEndDate(value);
                  }}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold">
                생성 요일
              </label>

              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => {
                  const selected = selectedDays.includes(day.value);

                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        setSelectedDays((prev) =>
                          prev.includes(day.value)
                            ? prev.filter((d) => d !== day.value)
                            : [...prev, day.value],
                        );
                      }}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white hover:bg-gray-100"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">일정</label>

                <input
                  value={bulkCourse}
                  onChange={(e) => setBulkCourse(e.target.value)}
                  placeholder="예) 4박5일"
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  코스구분
                </label>

                <input
                  value={bulkVariant}
                  onChange={(e) => setBulkVariant(e.target.value)}
                  placeholder="예) 계림 · 양삭"
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">가격</label>

                <input
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="예) 1330000"
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">항공사</label>

                <input
                  value={bulkAirline}
                  onChange={(e) => setBulkAirline(e.target.value)}
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">총좌석</label>

                <input
                  value={bulkSeat}
                  onChange={(e) => setBulkSeat(e.target.value)}
                  className="w-full rounded border p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsBulkOpen(false)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={generateBulkDepartures}
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">👥 예약자 보기</h2>

              <button
                onClick={() => setShowReservationModal(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-500">
              출발일 : {selectedDeparture?.departure_date}
            </p>
            <p className="mt-1 text-gray-500">
              👥 예약팀 : {departureReservations.length}팀
            </p>
            <p className="mt-1 text-gray-500">
              🧍 예약인원 : {totalPassengers}명
            </p>
            <p className="mt-1 font-semibold text-blue-600">
              💺 잔여좌석 :{" "}
              {Number(selectedDeparture?.seat ?? 0) - totalPassengers}석
            </p>
            <div className="mt-6 max-h-[55vh] space-y-3 overflow-y-auto pr-2">
              {departureReservations.map((reservation) => (
                <div key={reservation.id} className="rounded-lg border p-4">
                  <div className="font-bold">{reservation.name}</div>
                  <div className="text-sm text-gray-500">
                    {reservation.phone}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    예약인원 : {reservation.people?.length ?? 0}명
                  </div>

                  <div className="mt-2 space-y-1">
                    {reservation.people?.map((person: any) => (
                      <div key={person.id}>• {person.name}</div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        router.push(`/admin/reservations?id=${reservation.id}`)
                      }
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      예약상세
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
