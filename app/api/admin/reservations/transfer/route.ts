import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

async function checkAdmin(request: NextRequest) {
  const adminCookie = request.cookies.get("admin_user")?.value;

  if (adminCookie !== "true") return null;

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return null;

  return user;
}

function failure(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const user = await checkAdmin(request);

    if (!user) {
      return failure("관리자 인증이 필요합니다.", 401);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return failure("JSON 형식이 올바르지 않습니다.", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return failure("요청 형식이 올바르지 않습니다.", 400);
    }

    const input = body as Record<string, unknown>;
    const reservationId = input.reservationId;
    const targetDepartureId = input.targetDepartureId;
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (
      typeof reservationId !== "string" ||
      typeof targetDepartureId !== "string" ||
      !uuidPattern.test(reservationId) ||
      !uuidPattern.test(targetDepartureId)
    ) {
      return failure("예약 ID 또는 출발일 ID 형식이 올바르지 않습니다.", 400);
    }

    if (
      typeof reservationId !== "string" ||
      typeof targetDepartureId !== "string" ||
      !reservationId.trim() ||
      !targetDepartureId.trim() ||
      reservationId.length > 100 ||
      targetDepartureId.length > 100
    ) {
      return failure("예약 ID와 출발일 ID를 확인해주세요.", 400);
    }

    // 1. 현재 예약 조회
    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from("reservations")
      .select("id, product, departure_id, departure_date, status, people_count")
      .eq("id", reservationId)
      .maybeSingle();

    if (reservationError) {
      console.error("RESERVATION LOOKUP ERROR", reservationError);
      return failure("예약 조회에 실패했습니다.", 500);
    }

    if (!reservation) {
      return failure("예약을 찾을 수 없습니다.", 404);
    }

    // 2. 이동 대상 출발일 조회
    const { data: targetDeparture, error: targetError } = await supabaseAdmin
      .from("departures")
      .select("id, product_id, departure_date, course, variant, seat")
      .eq("id", targetDepartureId)
      .maybeSingle();

    if (targetError) {
      console.error("TARGET LOOKUP ERROR", targetError);
      return failure("출발일 조회에 실패했습니다.", 500);
    }

    if (!targetDeparture) {
      return failure("이동할 출발일이 없습니다.", 404);
    }

    if (reservation.departure_id === targetDeparture.id) {
      return failure("현재 예약과 동일한 출발일입니다.", 400);
    }

    // 3. 이동 대상 상품 조회
    const { data: targetProduct, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, title")
      .eq("id", targetDeparture.product_id)
      .maybeSingle();

    if (productError || !targetProduct) {
      return failure("이동할 상품 정보를 확인할 수 없습니다.", 400);
    }

    // 4. 현재 예약 인원 조회 (여권정보는 조회하지 않음)
    const { data: people, error: peopleError } = await supabaseAdmin
      .from("reservation_people")
      .select("id, is_guide")
      .eq("reservation_id", reservationId);

    if (peopleError) {
      return failure("예약자 인원 조회에 실패했습니다.", 500);
    }

    const passengerIds = (people ?? []).map((p) => p.id);

    // 일반 고객과 인솔자 구분
    const customerCount = (people ?? []).filter(
      (p) => p.is_guide !== true,
    ).length;

    const guideCount = (people ?? []).filter((p) => p.is_guide === true).length;

    // 기존 관리자 좌석 계산 방식과 동일하게 적용
    const registeredPeopleCount = customerCount + guideCount;

    const passengerCount = Math.max(
      Number(reservation.people_count) || 0,
      registeredPeopleCount,
      1,
    );

    // 5. 이동 대상 출발일의 기존 예약 조회

    // 5. 대상 출발일의 기존 모객 계산
    // 동일 상품 + 동일 날짜의 공유 출발일 포함
    const { data: sharedDepartures, error: sharedError } = await supabaseAdmin
      .from("departures")
      .select("id, seat")
      .eq("product_id", targetDeparture.product_id)
      .eq("departure_date", targetDeparture.departure_date);

    if (sharedError || !sharedDepartures?.length) {
      return failure("공유 출발일 조회에 실패했습니다.", 500);
    }

    const sharedDepartureIds = sharedDepartures.map(
      (departure) => departure.id,
    );

    const { data: targetReservations, error: reservationsError } =
      await supabaseAdmin
        .from("reservations")
        .select("id, people_count")
        .in("departure_id", sharedDepartureIds)
        .neq("status", "취소");

    if (reservationsError) {
      return failure("대상 출발일 예약 조회에 실패했습니다.", 500);
    }

    const targetReservationIds = (targetReservations ?? []).map(
      (reservation) => reservation.id,
    );

    const targetPeopleCountMap = new Map<string, number>();

    if (targetReservationIds.length > 0) {
      const { data: targetPeople, error: targetPeopleError } =
        await supabaseAdmin
          .from("reservation_people")
          .select("reservation_id")
          .in("reservation_id", targetReservationIds);

      if (targetPeopleError) {
        return failure("대상 출발일 인원 조회에 실패했습니다.", 500);
      }

      (targetPeople ?? []).forEach((person) => {
        const id = String(person.reservation_id);

        targetPeopleCountMap.set(id, (targetPeopleCountMap.get(id) ?? 0) + 1);
      });
    }

    let targetPeopleCount = 0;

    (targetReservations ?? []).forEach((targetReservation) => {
      const savedCount = Number(targetReservation.people_count) || 0;
      const registeredCount =
        targetPeopleCountMap.get(String(targetReservation.id)) ?? 0;

      targetPeopleCount += Math.max(savedCount, registeredCount, 1);
    });

    // 공유 출발일의 좌석 수 일치 여부
    const sharedSeatValues = sharedDepartures.map((departure) =>
      Number(departure.seat),
    );

    const sharedSeatMismatch = new Set(sharedSeatValues).size > 1;

    // 6. 현재 예약에 연결된 데이터 현황
    const [
      settlementResult,
      paymentResult,
      withdrawalResult,
      invoiceResult,
      fileResult,
      checklistResult,
      reservationRoomResult,
      directRoomResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("reservation_settlements")
        .select("id", { count: "exact", head: true })
        .eq("reservation_id", reservationId),

      supabaseAdmin
        .from("reservation_payments")
        .select("id", { count: "exact", head: true })
        .eq("reservation_id", reservationId),

      supabaseAdmin
        .from("reservation_withdrawals")
        .select("id", { count: "exact", head: true })
        .eq("reservation_id", reservationId),

      supabaseAdmin
        .from("reservation_invoices")
        .select("id", { count: "exact", head: true })
        .eq("reservation_id", reservationId),

      supabaseAdmin
        .from("settlement_files")
        .select("id", { count: "exact", head: true })
        .eq("reservation_id", reservationId),

      supabaseAdmin
        .from("reservation_checklists")
        .select("reservation_id", { count: "exact", head: true })
        .eq("reservation_id", reservationId),

      supabaseAdmin
        .from("rooms")
        .select("id", { count: "exact", head: true })
        .eq("reservation_id", reservationId),

      supabaseAdmin
        .from("reservation_people")
        .select("id", { count: "exact", head: true })
        .eq("reservation_id", reservationId)
        .not("room_id", "is", null),
    ]);

    const checks = [
      settlementResult,
      paymentResult,
      withdrawalResult,
      invoiceResult,
      fileResult,
      checklistResult,
      reservationRoomResult,
      directRoomResult,
    ];

    if (checks.some((result) => result.error)) {
      console.error(
        "TRANSFER LINKED DATA ERRORS",
        checks.filter((result) => result.error).map((result) => result.error),
      );
      return failure("연결 데이터 조회에 실패했습니다.", 500);
    }

    // 7. 객실배정(room_members) 조회
    let assignedRoomMembers = 0;
    let assignedRoomIds: string[] = [];

    if (passengerIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("room_members")
        .select("room_id")
        .in("reservation_person_id", passengerIds);

      if (error) {
        return failure("객실배정 조회에 실패했습니다.", 500);
      }

      assignedRoomMembers = data?.length ?? 0;
      assignedRoomIds = [
        ...new Set((data ?? []).map((item) => String(item.room_id))),
      ];
    }

    // 8. 기존 객실의 공유 여부 확인
    let sharedRooms = 0;

    if (assignedRoomIds.length > 0) {
      const { data: memberships, error } = await supabaseAdmin
        .from("room_members")
        .select("room_id, reservation_person_id")
        .in("room_id", assignedRoomIds);

      if (error) {
        return failure("공유 객실 조회에 실패했습니다.", 500);
      }

      const currentPersonSet = new Set(passengerIds);

      sharedRooms = assignedRoomIds.filter((roomId) =>
        (memberships ?? []).some(
          (member) =>
            String(member.room_id) === roomId &&
            !currentPersonSet.has(member.reservation_person_id),
        ),
      ).length;
    }

    // 8-1. 기존 출발일의 좌석 반환 예상값 계산
    // 실제 데이터 변경 없음

    let sourcePeopleCount: number | null = null;
    let sourceSeatCapacity: number | null = null;
    let sourceRemainingBefore: number | null = null;
    let sourceRemainingAfter: number | null = null;

    if (reservation.departure_id) {
      const { data: sourceDeparture, error: sourceError } = await supabaseAdmin
        .from("departures")
        .select("product_id, departure_date, seat")
        .eq("id", reservation.departure_id)
        .maybeSingle();

      if (sourceError || !sourceDeparture) {
        return failure("기존 출발일 정보를 확인할 수 없습니다.", 500);
      }

      const { data: sourceDepartures, error: groupError } = await supabaseAdmin
        .from("departures")
        .select("id")
        .eq("product_id", sourceDeparture.product_id)
        .eq("departure_date", sourceDeparture.departure_date);

      if (groupError || !sourceDepartures?.length) {
        return failure("기존 좌석 공유 그룹 조회에 실패했습니다.", 500);
      }

      const sourceIds = sourceDepartures.map((d) => d.id);

      const { data: sourceReservations, error: sourceReservationError } =
        await supabaseAdmin
          .from("reservations")
          .select("id, people_count")
          .in("departure_id", sourceIds)
          .neq("status", "취소");

      if (sourceReservationError) {
        return failure("기존 출발일 모객 조회에 실패했습니다.", 500);
      }

      const sourceReservationIds = (sourceReservations ?? []).map((r) => r.id);

      const sourcePeopleMap = new Map<string, number>();

      if (sourceReservationIds.length > 0) {
        const { data: sourcePeople, error: sourcePeopleError } =
          await supabaseAdmin
            .from("reservation_people")
            .select("reservation_id")
            .in("reservation_id", sourceReservationIds);

        if (sourcePeopleError) {
          return failure("기존 출발일 명단 조회에 실패했습니다.", 500);
        }

        (sourcePeople ?? []).forEach((person) => {
          const id = String(person.reservation_id);

          sourcePeopleMap.set(id, (sourcePeopleMap.get(id) ?? 0) + 1);
        });
      }

      sourcePeopleCount = (sourceReservations ?? []).reduce(
        (sum, item) =>
          sum +
          Math.max(
            Number(item.people_count) || 0,
            sourcePeopleMap.get(String(item.id)) ?? 0,
            1,
          ),
        0,
      );

      const sourceSeats = sourceDepartures.length;

      // 공유 그룹 내 좌석 수가 일치하는지는 다음 단계에서 검증
      if (sourceSeats > 0) {
        sourceSeatCapacity = Number(sourceDeparture.seat);

        sourceRemainingBefore = sourceSeatCapacity - sourcePeopleCount;

        // 취소 예약은 이미 모객에서 제외하므로 반환하지 않음
        sourceRemainingAfter =
          sourceRemainingBefore +
          (reservation.status === "취소" ? 0 : passengerCount);
      }
    }

    // 9. 사전 검증 결과만 반환
    // 실제 DB 변경 없음

    const seatCapacity = Number(targetDeparture.seat ?? 0);
    const seatCapacityKnown = seatCapacity > 0;

    // 현재 예약이 대상 좌석 공유 그룹에 이미 포함되어 있는지 확인
    const alreadyInTargetGroup =
      reservation.status !== "취소" &&
      targetReservationIds.includes(reservationId);

    // 대상 날짜 모객에 이미 포함된 예약이라면 중복 계산하지 않음
    const projectedPeopleCount =
      targetPeopleCount + (alreadyInTargetGroup ? 0 : passengerCount);

    // 대상 날짜 이동 전후 잔여 좌석 (참고용)
    const targetRemainingBefore = seatCapacityKnown
      ? seatCapacity - targetPeopleCount
      : null;

    const targetRemainingAfter = seatCapacityKnown
      ? seatCapacity - projectedPeopleCount
      : null;

    const sameProduct = reservation.product === targetProduct.title;

    // 실제 예약 이동 RPC 연결
    // 안전 검증 전까지 실행 잠금 유지
    const executionRequested = input.mode === "execute";

    if (executionRequested) {
      // 서버 환경변수로 실행 허용 여부 제어
      if (process.env.RESERVATION_TRANSFER_ENABLED !== "true") {
        return failure("예약 이동 기능은 현재 안전 점검 중입니다.", 403);
      }

      if (!sameProduct) {
        return failure("현재는 동일 상품의 출발일 변경만 가능합니다.", 400);
      }

      if (sharedSeatMismatch) {
        return failure("공유 출발일의 좌석 설정이 서로 다릅니다.", 400);
      }

      if (sharedRooms > 0) {
        return failure(
          "다른 예약과 공유 중인 객실이 있어 이동할 수 없습니다.",
          400,
        );
      }

      const { data: result, error: transferError } = await supabaseAdmin.rpc(
        "transfer_reservation_safe",
        {
          p_reservation_id: reservationId,
          p_target_departure_id: targetDepartureId,
        },
      );

      if (transferError) {
        console.error("RESERVATION TRANSFER ERROR", transferError);

        return failure("예약 이동 처리에 실패했습니다.", 400);
      }

      return NextResponse.json(result);
    }

    return NextResponse.json({
      success: true,
      mode: "validation_only",
      canTransfer: false,
      message: "조회 완료. 실제 예약 이동 기능은 비활성화 상태입니다.",

      current: {
        departureId: reservation.departure_id,
        departureDate: reservation.departure_date,
        product: reservation.product,

        status: reservation.status,
        passengerCount,
        customerCount,
        guideCount,
      },

      target: {
        departureId: targetDeparture.id,
        departureDate: targetDeparture.departure_date,
        product: targetProduct.title,
        course: targetDeparture.course,
        variant: targetDeparture.variant,
      },

      checks: {
        sameProduct,
        productChangeRequired: !sameProduct,
        sharedDepartureCount: sharedDepartures.length,
        sharedSeatMismatch,
        sharedSeatValues,

        sourcePeopleCount,
        sourceSeatCapacity,
        sourceRemainingBefore,
        sourceRemainingAfter,

        seatCapacity: seatCapacityKnown ? seatCapacity : null,
        existingPeople: targetPeopleCount,
        movingPeople: passengerCount,
        projectedPeopleCount,
        alreadyInTargetGroup,
        targetRemainingBefore,
        targetRemainingAfter,
        seatCapacityKnown,
        seatCheckPassed: null,
        seatCheckNote:
          "출발일 seat 값과 실제 좌석 운영 기준 확인 전이므로 이동 가능 여부는 미판정",

        sharedRooms,
        hasSharedRooms: sharedRooms > 0,
      },

      linkedData: {
        settlements: settlementResult.count ?? 0,
        payments: paymentResult.count ?? 0,
        withdrawals: withdrawalResult.count ?? 0,
        invoices: invoiceResult.count ?? 0,
        settlementFiles: fileResult.count ?? 0,
        checklists: checklistResult.count ?? 0,
        reservationRooms: reservationRoomResult.count ?? 0,
        directRoomLinks: directRoomResult.count ?? 0,
        roomMemberLinks: assignedRoomMembers,
        linkedRoomCount: assignedRoomIds.length,
      },
    });
  } catch (error) {
    console.error("TRANSFER VALIDATION ERROR", error);

    return failure("예약 이동 사전 검증 중 오류가 발생했습니다.", 500);
  }
}
