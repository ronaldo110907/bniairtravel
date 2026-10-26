
import { getAdminUser } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function failure(error: string, status: number) {
  return NextResponse.json(
    { success: false, error },
    { status },
  );
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminUser(request);

    if (!user) {
      return failure("관리자 인증이 필요합니다.", 401);
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return failure("요청 형식이 올바르지 않습니다.", 400);
    }

    const { reservationId, targetCount, deleteIds, mode } = body;

if (mode !== "validate" && mode !== "execute") {
  return failure("작업 모드가 올바르지 않습니다.", 400);
}

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (
      typeof reservationId !== "string" ||
      !uuidPattern.test(reservationId)
    ) {
      return failure("예약 ID가 올바르지 않습니다.", 400);
    }

    if (!Number.isInteger(targetCount) || targetCount < 1) {
      return failure("변경 인원을 확인해주세요.", 400);
    }

    if (
      !Array.isArray(deleteIds) ||
      deleteIds.length === 0 ||
      deleteIds.some(
        (id: unknown) =>
          typeof id !== "string" || !uuidPattern.test(id),
      ) ||
      new Set(deleteIds).size !== deleteIds.length
    ) {
      return failure("삭제 대상 목록이 올바르지 않습니다.", 400);
    }

    const { data: reservation, error: reservationError } =
      await supabaseAdmin
        .from("reservations")
        .select("id, people_count")
        .eq("id", reservationId)
        .maybeSingle();

    if (reservationError || !reservation) {
      return failure("예약 정보를 확인할 수 없습니다.", 404);
    }

    const { data: people, error: peopleError } =
      await supabaseAdmin
        .from("reservation_people")
        .select("id, is_guide")
        .eq("reservation_id", reservationId);

    if (peopleError) {
      return failure("예약자 명단 조회에 실패했습니다.", 500);
    }

    const customers = (people ?? []).filter(
      (person) => person.is_guide !== true,
    );

    const reductionCount = customers.length - targetCount;
    const customerIds = new Set(customers.map((person) => person.id));

    if (
      reductionCount <= 0 ||
      reductionCount !== deleteIds.length ||
      deleteIds.some((id: string) => !customerIds.has(id))
    ) {
      return failure("감축 인원 또는 삭제 대상이 일치하지 않습니다.", 400);
    }
    

    // 삭제 대상의 객실배정 연결 여부 확인
    const { data: roomMembers, error: roomError } =
      await supabaseAdmin
        .from("room_members")
        .select("reservation_person_id")
        .in("reservation_person_id", deleteIds);

    if (roomError) {
      console.error("BULK PEOPLE ROOM CHECK ERROR", roomError);
      return failure("객실배정 정보 확인에 실패했습니다.", 500);
    }

    if (roomMembers && roomMembers.length > 0) {
      return failure(
        `삭제 대상 중 객실배정된 고객이 ${roomMembers.length}건 있습니다. 객실배정을 먼저 해제해주세요.`,
        400,
      );
    }

    // reservation_people.room_id 직접 연결 여부 확인
    const { data: directRooms, error: directRoomError } =
      await supabaseAdmin
        .from("reservation_people")
        .select("id")
        .eq("reservation_id", reservationId)
        .in("id", deleteIds)
        .not("room_id", "is", null);

    if (directRoomError) {
      console.error("BULK PEOPLE DIRECT ROOM ERROR", directRoomError);
      return failure("객실 연결 상태 확인에 실패했습니다.", 500);
    }

    if (directRooms && directRooms.length > 0) {
      return failure(
        "삭제 대상에 객실이 연결된 고객이 있습니다. 객실배정을 먼저 해제해주세요.",
        400,
      );
    }
    

    // 삭제 대상의 개인정보 등록 여부 확인
    const { data: selectedPeople, error: detailError } =
      await supabaseAdmin
        .from("reservation_people")
        .select(`
          id,
          name,
          passport_image,
          passport_name,
          passport_last_name,
          passport_first_name,
          passport_number,
          passport_birth,
          passport_issue,
          passport_expiry,
          passport_sex,
          passport_nationality
        `)
        .eq("reservation_id", reservationId)
        .in("id", deleteIds);

    if (detailError || selectedPeople?.length !== deleteIds.length) {
      return failure("삭제 대상 상세정보 확인에 실패했습니다.", 500);
    }

    const protectedPeople = selectedPeople.filter((person) => {
      const temporaryName = /^예약자\s*\d+$/i.test(
        person.name?.trim() ?? "",
      );

      const hasPassportInfo = Boolean(
        person.passport_image ||
        person.passport_name ||
        person.passport_last_name ||
        person.passport_first_name ||
        person.passport_number ||
        person.passport_birth ||
        person.passport_issue ||
        person.passport_expiry ||
        person.passport_sex ||
        (
          person.passport_nationality &&
          person.passport_nationality.toUpperCase() !== "KOR"
        )
      );

      return !temporaryName || hasPassportInfo;
    });

    if (protectedPeople.length > 0) {
      return failure(
        `실제 이름 또는 여권정보가 등록된 고객 ${protectedPeople.length}명이 포함되어 있습니다. 해당 고객은 개별 확인 후 처리해야 합니다.`,
        400,
      );
    }

    
    // 대표 명단 보호: 첫 번째 예약자는 감축 대상에서 제외
    const { data: firstPerson, error: firstPersonError } =
      await supabaseAdmin
        .from("reservation_people")
        .select("id")
        .eq("reservation_id", reservationId)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (firstPersonError) {
      console.error("BULK PEOPLE PRIMARY CHECK ERROR", firstPersonError);
      return failure("대표 명단 확인에 실패했습니다.", 500);
    }

    if (
      firstPerson &&
      deleteIds.includes(firstPerson.id)
    ) {
      return failure(
        "첫 번째 대표 명단은 일괄 감축할 수 없습니다.",
        400,
      );
    }

    // Supabase 검증 RPC 실행 (데이터 변경 없음)
    const { data: validation, error: validationError } =
      await supabaseAdmin.rpc(
        "validate_bulk_people_reduction",
        {
          p_reservation_id: reservationId,
          p_target_count: targetCount,
          p_delete_ids: deleteIds,
        },
      );

    if (validationError) {
      console.error(
        "BULK PEOPLE RPC VALIDATION ERROR",
        validationError,
      );

      return failure(
        "인원 감축 검증에 실패했습니다. 예약자 명단을 다시 확인해주세요.",
        400,
      );
    }

    
    if (mode === "execute") {
      // 서버 실행 허용 전까지 실제 삭제 차단
      if (process.env.BULK_PEOPLE_REDUCTION_ENABLED !== "true") {
        return failure(
          "인원 감축 실행 기능은 현재 안전 점검 중입니다.",
          403,
        );
      }

      const { data: result, error: executeError } =
        await supabaseAdmin.rpc(
          "bulk_reduce_reservation_people",
          {
            p_reservation_id: reservationId,
            p_target_count: targetCount,
            p_delete_ids: deleteIds,
          },
        );

      if (executeError) {
        console.error(
          "BULK PEOPLE EXECUTE ERROR",
          executeError,
        );

        return failure(
          "인원 감축 실행에 실패했습니다. 예약자 명단을 확인해주세요.",
          400,
        );
      }

      if (!result || result.success !== true) {
        return failure(
          "인원 감축 처리 결과를 확인할 수 없습니다.",
          500,
        );
      }

      return NextResponse.json({
        success: true,
        mode: "executed",
        ...result,
      });
    }

    return NextResponse.json({
      success: true,
      mode: "validation_only",
      currentCount: customers.length,
      targetCount,
      reductionCount,
      validation,
      message:
        "서버 및 DB 검증 완료. 실제 예약자 삭제는 실행되지 않았습니다.",
    });


  } catch (error) {
    console.error("BULK PEOPLE VALIDATION ERROR", error);
    return failure("인원 감축 검증 중 오류가 발생했습니다.", 500);
  }
}
