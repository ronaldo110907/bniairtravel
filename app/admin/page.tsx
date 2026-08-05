import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const today = new Date().toISOString().split("T")[0];

  const { data: todayDepartures } = await supabase
    .from("departures")
    .select(
      `
    *,
    products(title)
  `,
    )
    .eq("departure_date", today);

  const departureIds = todayDepartures?.map((d) => d.id) ?? [];

  const { data: todayReservations } = await supabase
    .from("reservations")
    .select(
      `
    *,
    reservation_people(id)
  `,
    )
    .in("departure_id", departureIds);

  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekStart = startOfWeek.toISOString().split("T")[0];
  const weekEnd = endOfWeek.toISOString().split("T")[0];

  const { data: weekDepartures } = await supabase
    .from("departures")
    .select(
      `
    *,
    products(title)
  `,
    )
    .gte("departure_date", weekStart)
    .lte("departure_date", weekEnd)
    .order("departure_date");

  const { data: products } = await supabase.from("products").select("*");

  const { data: departures } = await supabase.from("departures").select("*");

  const { data: reservations } = await supabase.from("reservations").select(`
    departure_id,
    reservation_people(id)
  `);

  const totalPassengerCount = (reservations ?? []).reduce(
    (sum, reservation) => sum + (reservation.reservation_people?.length ?? 1),
    0,
  );

  const seatSummary = (products ?? []).map((product) => {
    const productDepartures = (departures ?? []).filter(
      (d) => d.product_id === product.id,
    );

    const totalSeat = productDepartures.reduce(
      (sum, d) => sum + (d.seat ?? 0),
      0,
    );

    const reservationCount = (reservations ?? []).reduce((sum, reservation) => {
      const isTargetDeparture = productDepartures.some(
        (d) => d.id === reservation.departure_id,
      );

      if (!isTargetDeparture) return sum;

      return sum + (reservation.reservation_people?.length ?? 1);
    }, 0);

    return {
      title: product.title,
      reservationCount,
      totalSeat,
      remainSeat: totalSeat - reservationCount,
    };
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-6 text-3xl font-bold">📊 관리자 메인 대시보드</h1>

      <div className="grid gap-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">📌 오늘 출발</h2>
          <div className="mt-4">
            {todayDepartures && todayDepartures.length > 0 ? (
              todayDepartures.map((departure) => (
                <div key={departure.id} className="mb-3 rounded-lg border p-3">
                  <div className="font-semibold">
                    🧳 {departure.products?.title}
                  </div>

                  <div className="mt-2 space-y-1">
                    {todayReservations
                      ?.filter((r) => r.departure_id === departure.id)
                      .map((reservation) => (
                        <div key={reservation.id} className="text-sm">
                          👤 {reservation.name} 외{" "}
                          {Math.max(
                            (reservation.reservation_people?.length ?? 1) - 1,
                            0,
                          )}
                          명
                        </div>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400">
                ✈️ 오늘 출발 일정이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">📌 이번주 출발</h2>
          <div className="mt-4">
            {weekDepartures && weekDepartures.length > 0 ? (
              weekDepartures.map((departure) => (
                <div key={departure.id} className="mb-3 rounded-lg border p-3">
                  <div className="font-semibold">
                    🧳 {departure.products?.title}
                  </div>

                  <div className="text-sm text-gray-500">
                    {departure.departure_date}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400">
                ✈️ 이번주 출발 일정이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr_2fr]">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-gray-500">
              👥
              <span className="text-sm font-medium">예약건수</span>
            </div>

            <div className="text-3xl font-bold text-gray-900">
              {totalPassengerCount}
            </div>

            <div className="mt-2 text-xs text-gray-400">전체 예약 건수</div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-gray-700">
              📋
              <span className="font-semibold">좌석소진현황</span>
            </div>

            <div className="space-y-2 text-sm">
              {seatSummary.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span>🧳 {item.title}</span>

                  <span
                    className={`font-semibold ${
                      item.totalSeat === 0
                        ? "text-gray-400"
                        : item.remainSeat / item.totalSeat >= 0.5
                          ? "text-green-600"
                          : item.remainSeat / item.totalSeat >= 0.2
                            ? "text-yellow-500"
                            : "text-red-600"
                    }`}
                  >
                    {item.reservationCount} / {item.totalSeat} (
                    {item.remainSeat})
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl shadow-sm">
            <img
              src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/banners/banner-cheer.png"
              alt="오늘도 웃으며 시작하는 즐거운 하루!"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
        <Link href="/admin/departures">
          <div className="rounded-xl bg-white p-6 shadow transition hover:bg-blue-50 cursor-pointer">
            <h2 className="text-xl font-bold">🏨 출발 관리</h2>
            <h2 className="mt-2 text-sm text-gray-500">
              출발일별 객실 배정 및 정산이 가능합니다.
            </h2>
          </div>
        </Link>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">🚀 빠른 이동</h2>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/departures"
              className="rounded-lg bg-blue-600 p-4 text-center font-bold text-white"
            >
              📅 상품별 출발일 관리
            </Link>

            <Link
              href="/admin/products"
              className="rounded-lg bg-green-600 p-4 text-center font-bold text-white"
            >
              🧳 상품 등록 관리
            </Link>

            <Link
              href="/admin/reservations"
              className="rounded-lg bg-orange-500 p-4 text-center font-bold text-white"
            >
              👥 예약 관리
            </Link>

            <Link
              href="/admin/calendar"
              className="rounded-lg bg-purple-600 p-4 text-center font-bold text-white"
            >
              📆 출발 달력
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
