import { createServerSupabase } from "@/lib/auth/server";
import {
  buildDepartureTaskBriefing,
} from "@/lib/admin/departureTaskRules";

// 날짜만 사용하여 시간대 차이 방지
function addDays(dateText: string, days: number) {
  const [year, month, day] = dateText.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateText
  ) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

// 여행기간을 이용해 귀국 예정일 계산
function getArrivalDate(
  departureDate: string,
  course: string | null | undefined,
  productDays: number,
) {
  const match = course?.match(/(\d+)\s*박\s*(\d+)\s*일/);

  const days = match ? Number(match[2]) : productDays;

  if (!Number.isInteger(days) || days < 1 || days > 30) {
    return null;
  }

  return addDays(departureDate, days - 1);
}

export async function getDepartureTaskBriefing(today: string) {
  const supabase = await createServerSupabase();

  const endDate = addDays(today, 7);

  if (!endDate) {
    throw new Error("업무 브리핑 기준 날짜가 올바르지 않습니다.");
  }

  // 1. 출발 7일 이내 확정 예약
  const { data: reservations, error: reservationError } =
    await supabase
      .from("reservations")
      .select(`
        id,
        name,
        product,
        departure_id,
        departure_date,
        people_count,
        status
      `)
      .eq("status", "확정")
      .gte("departure_date", today)
      .lte("departure_date", endDate)
      .order("departure_date", { ascending: true });

  if (reservationError) {
    throw new Error(
      `예약 조회 실패: ${reservationError.message}`,
    );
  }

  if (!reservations?.length) {
    return [];
  }

  const reservationIds = reservations.map((r) => r.id);

  const departureIds = [
    ...new Set(
      reservations
        .map((r) => r.departure_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  // 2. 관련 데이터 일괄 조회
  const [
    peopleResult,
    checklistResult,
    settlementResult,
    departureResult,
    productResult,
  ] = await Promise.all([
    supabase
      .from("reservation_people")
      .select(`
        id,
        reservation_id,
        name,
        passport_name,
        passport_last_name,
        passport_first_name,
        passport_number,
        passport_expiry,
        is_guide,
        room_id
      `)
      .in("reservation_id", reservationIds),

    supabase
      .from("reservation_checklists")
      .select(`
        reservation_id,
        insurance_done,
        request_done
      `)
      .in("reservation_id", reservationIds),

    supabase
      .from("reservation_settlements")
      .select(`
        reservation_id,
        total_price,
        paid_amount,
        updated_at
      `)
      .in("reservation_id", reservationIds)
      .order("updated_at", { ascending: false }),

    departureIds.length > 0
      ? supabase
          .from("departures")
          .select(`
            id,
            product_id,
            departure_date,
            course,
            return_schedule
          `)
          .in("id", departureIds)
      : Promise.resolve(null),

    supabase
      .from("products")
      .select(`
        id,
        title,
        days,
        requires_entry_declaration,
        requires_qcode
      `),
  ]);

  // 조회 오류를 미완료 0건으로 오인하지 않도록 처리
  const errors = [
    peopleResult.error,
    checklistResult.error,
    settlementResult.error,
    departureResult?.error,
    productResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      `업무 브리핑 조회 실패: ${errors
        .map((error) => error?.message)
        .join(" / ")}`,
    );
  }

  const people = peopleResult.data ?? [];
  const checklists = checklistResult.data ?? [];
  const settlements = settlementResult.data ?? [];
  const departures = departureResult?.data ?? [];
  const products = productResult.data ?? [];

  // 3. 객실 배정 인원 조회
  const personIds = people.map((p) => p.id);

  const roomMemberResult =
    personIds.length > 0
      ? await supabase
          .from("room_members")
          .select("reservation_person_id")
          .in("reservation_person_id", personIds)
      : null;

  if (roomMemberResult?.error) {
    throw new Error(
      `객실배정 조회 실패: ${roomMemberResult.error.message}`,
    );
  }

  // 4. 조회 결과를 예약 ID 기준으로 정리
  const peopleMap = new Map<string, typeof people>();

  for (const person of people) {
    const key = String(person.reservation_id);
    const current = peopleMap.get(key) ?? [];

    current.push(person);
    peopleMap.set(key, current);
  }

  const checklistMap = new Map(
    checklists.map((item) => [
      String(item.reservation_id),
      item,
    ]),
  );

  // 최신 정산 기록 우선
  const settlementMap = new Map<
    string,
    (typeof settlements)[number]
  >();

  for (const settlement of settlements) {
    const key = String(settlement.reservation_id);

    if (!settlementMap.has(key)) {
      settlementMap.set(key, settlement);
    }
  }

  const departureMap = new Map(
    departures.map((item) => [String(item.id), item]),
  );

  const productMap = new Map(
    products.map((item) => [String(item.id), item]),
  );

  const productTitleMap = new Map(
    products.map((item) => [item.title, item]),
  );

  const assignedPersonIds = new Set(
    (roomMemberResult?.data ?? []).map((item) =>
      String(item.reservation_person_id),
    ),
  );

  // 5. 기존 판단 규칙에 전달할 데이터 생성
  const sources = reservations.map((reservation) => {
    const id = String(reservation.id);

    const reservationPeople = (peopleMap.get(id) ?? []).filter(
      (person) => !person.is_guide,
    );

    const expectedCount = Math.max(
      1,
      Number(reservation.people_count) || 0,
      reservationPeople.length,
    );

    // 기본 여권정보 등록 여부
    const passportCompletedCount = reservationPeople.filter(
      (person) => {
        const hasEnglishName =
          Boolean(person.passport_name?.trim()) ||
          (
            Boolean(person.passport_last_name?.trim()) &&
            Boolean(person.passport_first_name?.trim())
          );

        return (
          hasEnglishName &&
          Boolean(person.passport_number?.trim()) &&
          Boolean(person.passport_expiry?.trim())
        );
      },
    ).length;

    const passportMissingCount = Math.max(
      0,
      expectedCount - passportCompletedCount,
    );

    // 객실배정 여부
    const roomingDone =
      reservationPeople.length >= expectedCount &&
      reservationPeople.every(
        (person) =>
          Boolean(person.room_id) ||
          assignedPersonIds.has(String(person.id)),
      );

    const checklist = checklistMap.get(id);
    const settlement = settlementMap.get(id);

    // 정산 데이터가 없으면 임의로 0원 처리하지 않음
    let balanceDue: number | null = null;

    if (
      settlement &&
      settlement.total_price !== null &&
      settlement.paid_amount !== null
    ) {
      const total = Number(settlement.total_price);
      const paid = Number(settlement.paid_amount);

      if (
        Number.isFinite(total) &&
        Number.isFinite(paid) &&
        total > 0
      ) {
        balanceDue = Math.max(0, total - paid);
      }
    }

    const departure = reservation.departure_id
      ? departureMap.get(String(reservation.departure_id))
      : undefined;

    const product =
      (
        departure?.product_id
          ? productMap.get(String(departure.product_id))
          : undefined
      ) ?? productTitleMap.get(reservation.product);

    // 실제 출발 상품의 여행기간 우선
    const arrivalDate = getArrivalDate(
      reservation.departure_date,
      departure?.course,
      Number(product?.days) || 0,
    );

    return {
      reservationId: id,
      productName: reservation.product,
      representativeName: reservation.name,
      departureDate: reservation.departure_date,
      arrivalDate,
      peopleCount: expectedCount,
      status: reservation.status,

      passportMissingCount,

      // 수배의뢰서 표시 오류를 고려하여
      // false는 미생성 확정이 아닌 확인 필요로 처리
      dispatchDone:
        checklist?.request_done === true ? true : null,

      roomingDone,

      balanceDue,

      // 여행자보험은 기존 완료 체크 그대로 활용
      insuranceDone: checklist?.insurance_done === true,

      // 확정서는 완료 체크 없이 안내만 표시
      requiresEntryDeclaration:
        product?.requires_entry_declaration === true,

      requiresQcode:
        product?.requires_qcode === true,
    };
  });

  // 6. 기존 업무 판단 규칙 실행
  return buildDepartureTaskBriefing(sources, today);
}