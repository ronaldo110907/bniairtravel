"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DepartureCard from "@/components/DepartureCard";
import DepartureTable from "./components/DepartureTable";
import AddDepartureModal from "./components/AddDepartureModal";

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

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id, title")
      .order("title");

    if (error) {
      console.log(error);
      return;
    }

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
    airline: string;
    seat: number;
    status: string;
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
      const { error } = await supabase
        .from("departures")
        .update({
          departure_date: data.departure_date,
          course: data.course,
          price: data.price,
          airline: data.airline,
          seat: data.seat,
          status: data.status,
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
      airline: data.airline,
      seat: data.seat,
      status: data.status,
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
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">출발일 관리</h1>
      <div className="mt-6 mb-6 flex flex-wrap gap-2">
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
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-500">총 {departures.length}건</p>

        <button
          onClick={() => {
            setEditingDeparture(null);
            setShowAddModal(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + 출발일 추가
        </button>
      </div>
      {/*}
      {departures.map((departure) => (
        <DepartureCard key={departure.id} departure={departure} />
      ))}
      */}
      <DepartureTable
        departures={departures}
        passengerCounts={passengerCounts}
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
            <div className="mt-6 space-y-3">
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
