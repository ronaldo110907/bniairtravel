import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function getTravelDays(course: string | null) {
  if (!course) return null;

  const koreanMatch = course.match(/박(\d+)일/);
  if (koreanMatch) {
    return Number(koreanMatch[1]);
  }

  const englishMatch = course.match(/\d+N(\d+)D/i);
  if (englishMatch) {
    return Number(englishMatch[1]);
  }

  return null;
}

export async function GET() {
  try {
    // 1. 예약자 + 예약 정보 조회
    const { data: people, error: peopleError } = await supabaseAdmin.from(
      "reservation_people",
    ).select(`
        id,
        name,
        passport_image,
        passport_name,
        passport_number,
        passport_birth,
        passport_expiry,
        passport_issue,
        passport_nationality,
        passport_sex,
        reservations!inner (
          id,
          departure_id
        )
      `);

    if (peopleError) {
      throw peopleError;
    }

    // 2. 출발일 정보 별도 조회
    const { data: departures, error: departureError } = await supabaseAdmin
      .from("departures")
      .select("id, departure_date, course");

    if (departureError) {
      throw departureError;
    }

    const departureMap = new Map(
      (departures ?? []).map((departure) => [departure.id, departure]),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targets = (people ?? [])
      .map((person: any) => {
        const reservation = person.reservations;

        const departure = departureMap.get(reservation?.departure_id);

        if (!departure?.departure_date) {
          return null;
        }

        const travelDays = getTravelDays(departure.course);

        if (!travelDays) {
          return null;
        }

        const departureDate = new Date(`${departure.departure_date}T00:00:00`);

        const returnDate = new Date(departureDate);
        returnDate.setDate(returnDate.getDate() + travelDays);

        const purgeDate = new Date(returnDate);
        purgeDate.setDate(purgeDate.getDate() + 7);

        const hasPassportData =
          person.passport_image ||
          person.passport_name ||
          person.passport_number ||
          person.passport_birth ||
          person.passport_expiry ||
          person.passport_issue ||
          person.passport_nationality ||
          person.passport_sex;

        if (!hasPassportData || purgeDate > today) {
          return null;
        }

        return {
          id: person.id,
          name: person.name,
          departureDate: departure.departure_date,
          course: departure.course,
          returnDate: returnDate.toISOString().slice(0, 10),
          purgeDate: purgeDate.toISOString().slice(0, 10),
          passportImage: person.passport_image,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      targetCount: targets.length,
      targets,
    });
  } catch (error: any) {
    console.error("PASSPORT CLEANUP CHECK ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    // 1. 예약자 + 예약 정보 조회
    const { data: people, error: peopleError } = await supabaseAdmin.from(
      "reservation_people",
    ).select(`
        id,
        name,
        passport_image,
        passport_name,
        passport_number,
        passport_birth,
        passport_expiry,
        passport_issue,
        passport_nationality,
        passport_sex,
        reservations!inner (
          id,
          departure_id
        )
      `);

    if (peopleError) {
      throw peopleError;
    }

    // 2. 출발일 정보 조회
    const { data: departures, error: departureError } = await supabaseAdmin
      .from("departures")
      .select("id, departure_date, course");

    if (departureError) {
      throw departureError;
    }

    const departureMap = new Map(
      (departures ?? []).map((departure) => [departure.id, departure]),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3. 오늘 기준 파기 대상 선별
    const targets = (people ?? []).filter((person: any) => {
      const reservation = person.reservations;

      const departure = departureMap.get(reservation?.departure_id);

      if (!departure?.departure_date) {
        return false;
      }

      const travelDays = getTravelDays(departure.course);

      if (!travelDays) {
        return false;
      }

      const departureDate = new Date(`${departure.departure_date}T00:00:00`);

      const returnDate = new Date(departureDate);

      // 4박5일:
      // 7/14 출발 → 7/18 귀국
      returnDate.setDate(returnDate.getDate() + travelDays);

      const purgeDate = new Date(returnDate);
      purgeDate.setDate(purgeDate.getDate() + 7);

      const hasPassportData =
        person.passport_image ||
        person.passport_name ||
        person.passport_number ||
        person.passport_birth ||
        person.passport_expiry ||
        person.passport_issue ||
        person.passport_nationality ||
        person.passport_sex;

      return Boolean(hasPassportData && purgeDate <= today);
    });

    const results = [];

    // 4. 대상자별 파기
    for (const person of targets) {
      try {
        // Storage 이미지가 있으면 먼저 실제 파일 삭제
        if (person.passport_image) {
          const { error: storageError } = await supabaseAdmin.storage
            .from("passports")
            .remove([person.passport_image]);

          if (storageError) {
            throw new Error(`Storage 삭제 실패: ${storageError.message}`);
          }
        }

        // Storage 삭제 성공 후 DB 개인정보 제거
        const { error: updateError } = await supabaseAdmin
          .from("reservation_people")
          .update({
            passport_image: null,
            passport_name: null,
            passport_number: null,
            passport_birth: null,
            passport_expiry: null,
            passport_issue: null,
            passport_nationality: null,
            passport_sex: null,
          })
          .eq("id", person.id);

        if (updateError) {
          throw new Error(`DB 파기 실패: ${updateError.message}`);
        }

        results.push({
          id: person.id,
          name: person.name,
          success: true,
        });
      } catch (error: any) {
        console.error("PASSPORT PURGE PERSON ERROR", person.id, error);

        results.push({
          id: person.id,
          name: person.name,
          success: false,
          error: error?.message ?? "Unknown error",
        });
      }
    }

    const successCount = results.filter((result) => result.success).length;

    const failedCount = results.length - successCount;

    return NextResponse.json({
      success: failedCount === 0,
      targetCount: targets.length,
      purgedCount: successCount,
      failedCount,
      results,
    });
  } catch (error: any) {
    console.error("PASSPORT CLEANUP ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}
