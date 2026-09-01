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

const TRAVEL_DOCUMENT_RETENTION_DAYS = 20;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Vercel Cron의 인증된 호출이면 실제 파기 실행
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return POST(request);
  }

  // 일반 GET은 기존처럼 조회만
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

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

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
    // 전자입국신고서 / Q-CODE가 등록된 예약 조회
    const { data: travelDocumentReservations, error: travelDocumentError } =
      await supabaseAdmin
        .from("reservations")
        .select(
          `
        id,
        departure_id,
        entry_declaration_file,
        qcode_file
      `,
        )
        .or("entry_declaration_file.not.is.null,qcode_file.not.is.null");

    if (travelDocumentError) {
      throw travelDocumentError;
    }

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
    // ======================================================
    // 전자입국신고서 / Q-CODE 자동 파기
    // 기준: 출발일 + 20일
    // ======================================================

    const travelDocumentTargets = (travelDocumentReservations ?? []).filter(
      (reservation: any) => {
        if (!reservation.departure_id) {
          return false;
        }

        const departure = departureMap.get(reservation.departure_id);

        if (!departure?.departure_date) {
          return false;
        }

        const departureDate = new Date(`${departure.departure_date}T00:00:00`);

        const purgeDate = new Date(departureDate);

        purgeDate.setDate(purgeDate.getDate() + TRAVEL_DOCUMENT_RETENTION_DAYS);

        const hasTravelDocument =
          reservation.entry_declaration_file || reservation.qcode_file;

        return Boolean(hasTravelDocument && purgeDate <= today);
      },
    );

    const travelDocumentResults = [];

    for (const reservation of travelDocumentTargets) {
      try {
        const filesToDelete = [
          reservation.entry_declaration_file,
          reservation.qcode_file,
        ].filter((file): file is string => Boolean(file));

        if (filesToDelete.length > 0) {
          const { error: storageError } = await supabaseAdmin.storage
            .from("travel-documents")
            .remove(filesToDelete);

          if (storageError) {
            throw new Error(
              `여행서류 Storage 삭제 실패: ${storageError.message}`,
            );
          }
        }

        const { error: updateError } = await supabaseAdmin
          .from("reservations")
          .update({
            entry_declaration_file: null,
            qcode_file: null,
          })
          .eq("id", reservation.id);

        if (updateError) {
          throw new Error(`여행서류 DB 파기 실패: ${updateError.message}`);
        }

        travelDocumentResults.push({
          reservationId: reservation.id,
          success: true,
          deletedFiles: filesToDelete.length,
        });
      } catch (error: any) {
        console.error("TRAVEL DOCUMENT PURGE ERROR", reservation.id, error);

        travelDocumentResults.push({
          reservationId: reservation.id,
          success: false,
          error: error?.message ?? "Unknown error",
        });
      }
    }
    const successCount = results.filter((result) => result.success).length;

    const failedCount = results.length - successCount;

    const travelDocumentSuccessCount = travelDocumentResults.filter(
      (result) => result.success,
    ).length;

    const travelDocumentFailedCount =
      travelDocumentResults.length - travelDocumentSuccessCount;

    return NextResponse.json({
      success: failedCount === 0 && travelDocumentFailedCount === 0,

      passport: {
        targetCount: targets.length,
        purgedCount: successCount,
        failedCount,
        results,
      },

      travelDocuments: {
        retentionDays: TRAVEL_DOCUMENT_RETENTION_DAYS,
        targetCount: travelDocumentTargets.length,
        purgedCount: travelDocumentSuccessCount,
        failedCount: travelDocumentFailedCount,
        results: travelDocumentResults,
      },
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
