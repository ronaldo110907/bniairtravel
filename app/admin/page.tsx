import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ExchangeRateCard from "@/components/admin/ExchangeRateCard";
import { cookies } from "next/headers";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminEmail = decodeURIComponent(
    cookieStore.get("admin_email")?.value ?? "",
  );

  const isOfficeAccount = adminEmail === "cjjbni@cjjbni.com";
  const now = new Date();

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

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

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatKoreanDate = (date: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);

  const weekStart = formatKoreanDate(startOfWeek);
  const weekEnd = formatKoreanDate(endOfWeek);

  const { data: weekDepartures } = await supabase
    .from("departures")
    .select(
      `
    *,
    products(title)
  `,
    )
    .gte("departure_date", today)
    .lte("departure_date", weekEnd)
    .order("departure_date");

  const { data: products } = await supabase.from("products").select("*");

  const { data: departures } = await supabase
    .from("departures")
    .select("*")
    .gte("departure_date", today);

  const { data: reservations } = await supabase.from("reservations").select(`
  id,
  departure_id,
  status,
  people_count,
  reservation_people(id)
`);

  const { data: settlementDepartures } = await supabase
    .from("departures")
    .select("id, product_id")
    .lte("departure_date", today);

  const { data: settlementStatus } = await supabase
    .from("reservation_settlements")
    .select("reservation_id, is_completed");

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

      // 취소 예약은 좌석 점유에서 제외
      if (reservation.status === "취소") {
        return sum;
      }

      const savedPeopleCount = Number(reservation.people_count) || 0;
      const registeredPeopleCount = reservation.reservation_people?.length || 0;

      // 신규 예약은 people_count,
      // 기존 예약은 실제 등록인원도 함께 보정
      const count = Math.max(savedPeopleCount, registeredPeopleCount, 1);

      return sum + count;
    }, 0);

    return {
      title: product.title,
      reservationCount,
      totalSeat,
      remainSeat: totalSeat - reservationCount,
    };
  });

  const completedReservationIds = new Set(
    (settlementStatus ?? [])
      .filter((item) => item.is_completed)
      .map((item) => String(item.reservation_id)),
  );

  const unsettledSummary = (products ?? [])
    .map((product) => {
      const productDepartureIds = new Set(
        (settlementDepartures ?? [])
          .filter((departure) => departure.product_id === product.id)
          .map((departure) => String(departure.id)),
      );

      const unsettledCount = (reservations ?? []).filter((reservation) => {
        const belongsToProduct = productDepartureIds.has(
          String(reservation.departure_id),
        );

        const isCompleted = completedReservationIds.has(String(reservation.id));

        return belongsToProduct && !isCompleted;
      }).length;

      return {
        title: product.title,
        unsettledCount,
      };
    })
    .filter((item) => item.unsettledCount > 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 관리자 메인 대시보드</h1>

          <div className="mt-1 text-xs text-gray-400">
            👤 로그인 ID :{" "}
            <span className="font-medium text-gray-500">{adminEmail}</span>
          </div>
        </div>

        <ExchangeRateCard today={today} />
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">📌 오늘 출발</h2>
          <div className="mt-4">
            {todayDepartures && todayDepartures.length > 0 ? (
              todayDepartures.map((departure) => (
                <div key={departure.id} className="mb-3 rounded-lg border p-3">
                  <Link
                    href={`/admin/departures/${departure.id}`}
                    className="block rounded-lg transition hover:bg-blue-50"
                  >
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
                            )}{" "}
                            명
                          </div>
                        ))}
                    </div>
                  </Link>
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
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">📌 이번주 출발</h2>

            <p className="text-sm text-gray-500">
              ※ 출발 항목 클릭 시 정산 페이지로 이동합니다. 예약 상세는{" "}
              <strong className="text-gray-700">예약관리</strong>에서
              확인해주세요.
            </p>
          </div>
          <div className="mt-4">
            {weekDepartures && weekDepartures.length > 0 ? (
              weekDepartures.map((departure) => (
                <div key={departure.id} className="mb-3 rounded-lg border p-3">
                  <Link
                    href={`/admin/departures/${departure.id}`}
                    className="block rounded-lg transition hover:bg-blue-50"
                  >
                    <div className="font-semibold">
                      🧳 {departure.products?.title}
                    </div>

                    <div className="text-sm text-gray-500">
                      {departure.departure_date}
                    </div>
                  </Link>
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
            <div className="grid gap-5 md:grid-cols-2">
              {/* 예약인원 */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-gray-500">
                  👥
                  <span className="text-sm font-medium">예약인원</span>
                </div>

                <div className="text-3xl font-bold text-gray-900">
                  {totalPassengerCount}
                </div>

                <div className="mt-2 text-xs text-gray-400">전체 예약 인원</div>
              </div>

              {/* 미정산 현황 */}
              <div className="border-t pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <div className="mb-3 flex items-center gap-2 text-gray-700">
                  🧾
                  <span className="text-sm font-semibold">미정산 현황</span>
                </div>

                {unsettledSummary.length > 0 ? (
                  <div className="space-y-2">
                    {unsettledSummary.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">🧳 {item.title}</span>

                        <span className="font-bold text-orange-600">
                          {item.unsettledCount}건
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    ✅ 미정산 건이 없습니다.
                  </div>
                )}
              </div>
            </div>
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
          <div className="self-center overflow-hidden rounded-xl bg-white shadow-sm">
            <img
              src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/banners/banner-cheer.png"
              alt="오늘도 웃으며 시작하는 즐거운 하루!"
              className="h-auto w-full object-contain"
            />

            <div className="px-6 py-4 text-center">
              <div className="text-lg font-bold text-gray-800">
                ✈️ 오늘도 좋은 여행을 만들어 갑니다.
              </div>

              <div className="mt-2 text-sm text-gray-500">
                정확한 확인 · 빠른 대응 · 즐거운 여행
              </div>
            </div>
          </div>
        </div>
        <Link href="/admin/departures" className="hidden">
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
              className="rounded-lg bg-blue-600 p-4 text-center text-white"
            >
              <div className="font-bold">📅 상품별 출발일 관리</div>
              <div className="mt-1 text-xs leading-5 text-white/80">
                출발일 · 좌석 · 상품별 모집현황 관리
              </div>
            </Link>

            <Link
              href="/admin/products"
              className="rounded-lg bg-green-600 p-4 text-center text-white"
            >
              <div className="font-bold">🧳 상품 등록 관리</div>
              <div className="mt-1 text-xs leading-5 text-white/80">
                홈페이지 상품정보 및 판매설정 관리
              </div>
            </Link>

            <Link
              href="/admin/reservations"
              className="rounded-lg bg-orange-500 p-4 text-center text-white"
            >
              <div className="font-bold">👥 예약 관리</div>
              <div className="mt-1 text-xs leading-5 text-white/80">
                예약 접수 · 예약자 정보 · 진행상태 관리
              </div>
            </Link>

            <Link
              href="/admin/calendar"
              className="rounded-lg bg-purple-600 p-4 text-center text-white"
            >
              <div className="font-bold">📆 출발 달력</div>
              <div className="mt-1 text-xs leading-5 text-white/80">
                날짜별 출발 및 예약현황 확인
              </div>
            </Link>

            <Link
              href="/admin/estimate"
              className="col-span-2 rounded-lg bg-slate-700 p-4 text-center text-white hover:bg-slate-800"
            >
              <div className="font-bold">📄 견적서 만들기</div>
              <div className="mt-1 text-xs leading-5 text-white/80">
                단독 · 인센티브 등 고객용 견적서 작성 및 출력
              </div>
            </Link>

            <Link
              href="/admin/special"
              className="col-span-2 rounded-lg bg-red-600 p-4 text-center text-white"
            >
              <div className="font-bold">🔥 긴급특가 관리</div>
              <div className="mt-1 text-xs leading-5 text-white/80">
                긴급특가 출발일 및 홈페이지 노출 관리
              </div>
            </Link>
          </div>
        </div>
        {/* 개발 웹툰 비하인드 */}
        <div className="rounded-xl bg-white px-6 py-6 text-center shadow-sm">
          <Link
            href="/admin/webtoon"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-7 py-4 font-bold text-white shadow transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg"
          >
            📚 홈페이지 개발 웹툰 비하인드 보기
          </Link>

          <p className="mt-2 text-xs text-gray-400">
            BNI 개발팀의 실제 작전 기록 ㅋㅋㅋ
          </p>
          <p className="mt-3 text-sm font-semibold text-gray-600">
            "일이 생겨서 웹툰을 만드는 건지, 웹툰 만들려고 일이 생기는 건지"
            <br />
            이제 그 경계가 애매합니다. 🤣
          </p>
          {/* 웹툰 미리보기 */}
          <div className="mx-auto mt-5 grid max-w-4xl grid-cols-5 gap-3">
            {[
              "webtoon.png",
              "webtoon5.png",
              "webtoon10.png",
              "webtoon15.png",
              "webtoon20.png",
            ].map((file) => (
              <Link
                key={file}
                href="/admin/webtoon"
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-xl border bg-gray-100 shadow-sm"
              >
                <img
                  src={`https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/webtoon/${file}`}
                  alt="BNI 개발 웹툰"
                  className="aspect-[4/3] w-full object-cover object-top transition duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>

          <Link
            href="/admin/webtoon"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold text-gray-500 transition hover:text-gray-900"
          >
            전체 개발작전일지 보기 →
          </Link>
        </div>
        {!isOfficeAccount && (
          <div className="overflow-hidden rounded-xl border bg-white shadow">
            <img
              src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/products/ai5.png"
              alt="민우 & 지원 & 수정 개발팀"
              className="h-auto w-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
