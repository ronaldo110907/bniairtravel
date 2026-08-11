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
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkAirline, setBulkAirline] = useState("");
  const [bulkSeat, setBulkSeat] = useState("180");
  const [bulkStatus, setBulkStatus] = useState("예약가능");
  const [courseFilter, setCourseFilter] = useState("전체");
  const filteredDepartures =
    courseFilter === "전체"
      ? departures
      : departures.filter((departure) => departure.course === courseFilter);

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
      .select("id, departure_id");

    const reservationMap = new Map<string, string>();

    reservations?.forEach((reservation) => {
      if (!reservation.departure_id) return;

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

    departures.forEach((departure) => {
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
        alert("예약이 있는 출발일은 출발일과 일정은 변경되지 않습니다.");
        data.departure_date = editingDeparture.departure_date;
        data.course = editingDeparture.course;
      }
      console.log("예약존재:", hasReservation);
      console.log("저장할 status =", data.status);
      const { error } = await supabase
        .from("departures")
        .update({
          departure_date: data.departure_date,
          course: data.course,
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
          price: Number(bulkPrice),
          airline: bulkAirline,
          seat: Number(bulkSeat),
          status: "예약가능",
        };

        console.log(newDeparture);

        // 먼저 중복 확인
        const { data: exists } = await supabase
          .from("departures")
          .select("id")
          .eq("product_id", selectedProductId)
          .eq("departure_date", newDeparture.departure_date)
          .maybeSingle();

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
            {["전체", "3박4일", "4박5일"].map((course) => (
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
        </div>
      </div>
      {/*}
      {departures.map((departure) => (
        <DepartureCard key={departure.id} departure={departure} />
      ))}
      */}

      <DepartureTable
        departures={filteredDepartures}
        passengerCounts={passengerCounts}
        settlementCompleted={settlementCompleted}
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
