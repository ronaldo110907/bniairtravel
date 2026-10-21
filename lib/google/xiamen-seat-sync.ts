import type { SupabaseClient } from "@supabase/supabase-js";

import { getGoogleSheetsClient } from "./sheets";

const SHEET_NAME = "좌석현황";

const THURSDAY_DATES = [
  "2026-12-03",
  "2026-12-10",
  "2026-12-17",
  "2026-12-24",
  "2026-12-31",
  "2027-01-07",
  "2027-01-14",
  "2027-01-21",
  "2027-01-28",
  "2027-02-04",
  "2027-02-11",
  "2027-02-18",
  "2027-02-25",
  "2027-03-04",
  "2027-03-11",
  "2027-03-18",
  "2027-03-25",
] as const;

const SUNDAY_DATES = [
  "2026-12-06",
  "2026-12-13",
  "2026-12-20",
  "2026-12-27",
  "2027-01-03",
  "2027-01-10",
  "2027-01-17",
  "2027-01-24",
  "2027-01-31",
  "2027-02-07",
  "2027-02-14",
  "2027-02-21",
  "2027-02-28",
  "2027-03-07",
  "2027-03-14",
  "2027-03-21",
] as const;

const XIAMEN_VARIANTS = [
  "하문실속",
  "하문고품격",
  "하문골프54H",
  "고품격관지산",
  "고품격무이산",
  "하문골프72H",
] as const;

type DepartureRow = {
  id: string;
  departure_date: string;
  seat: number | null;
  variant: string | null;
};

type ReservationRow = {
  departure_id: string | null;
  people_count: number | null;
  status: string | null;
  reservation_people?: { id: string }[] | null;
};

/**
 * 현재 BNI 관리자와 동일한 좌석 계산 방식
 *
 * - 취소만 좌석 사용에서 제외
 * - 대기/확정은 좌석 사용
 * - people_count와 실제 등록인원 중 큰 값 사용
 * - 최소 1석 사용
 */
function getReservationSeatCount(reservation: ReservationRow) {
  if (reservation.status === "취소") {
    return 0;
  }

  const savedPeopleCount = Number(reservation.people_count) || 0;

  const registeredPeopleCount = reservation.reservation_people?.length || 0;

  return Math.max(savedPeopleCount, registeredPeopleCount, 1);
}

function getVariantReservationCount(
  departure: DepartureRow,
  reservations: ReservationRow[],
) {
  return reservations.reduce((sum, reservation) => {
    if (reservation.departure_id !== departure.id) {
      return sum;
    }

    return sum + getReservationSeatCount(reservation);
  }, 0);
}

function getDeparture(
  departures: DepartureRow[],
  date: string,
  variant: string,
) {
  return departures.find(
    (departure) =>
      departure.departure_date === date && departure.variant === variant,
  );
}

/**
 * 같은 날짜의 하문 상품들은 같은 항공 좌석을 공유합니다.
 *
 * 예:
 * 실속 seat 30
 * 고품격 seat 30
 * 골프 seat 30
 *
 * => 총 90석이 아니라 보유좌석 30석
 */
function getSharedSeat(departures: DepartureRow[], date: string) {
  const dateDepartures = departures.filter(
    (departure) => departure.departure_date === date,
  );

  if (dateDepartures.length === 0) {
    throw new Error(`${date} 하문 출발일 데이터가 없습니다.`);
  }

  const seatValues = [
    ...new Set(
      dateDepartures
        .map((departure) => departure.seat)
        .filter(
          (seat): seat is number =>
            seat !== null &&
            seat !== undefined &&
            Number.isFinite(Number(seat)),
        )
        .map((seat) => Number(seat)),
    ),
  ];

  if (seatValues.length === 0) {
    throw new Error(`${date} 보유좌석(seat)이 없습니다.`);
  }

  if (seatValues.length > 1) {
    throw new Error(
      `${date}의 상품별 보유좌석 값이 서로 다릅니다: ${seatValues.join(", ")}`,
    );
  }

  return seatValues[0];
}

export async function syncXiamenSeats(supabase: SupabaseClient) {
  // --------------------------------
  // 1. 하문 출발일 조회
  // --------------------------------

  const { data: departureData, error: departureError } = await supabase
    .from("departures")
    .select(
      `
      id,
      departure_date,
      seat,
      variant
    `,
    )
    .gte("departure_date", "2026-12-03")
    .lte("departure_date", "2027-03-25")
    .in("variant", [...XIAMEN_VARIANTS]);

  if (departureError) {
    throw new Error(`하문 출발일 조회 실패: ${departureError.message}`);
  }

  const departures = (departureData ?? []) as DepartureRow[];

  if (departures.length === 0) {
    throw new Error("하문 출발일 데이터가 없습니다.");
  }

  const departureIds = departures.map((departure) => departure.id);

  // --------------------------------
  // 2. 하문 예약 조회
  // --------------------------------

  const { data: reservationData, error: reservationError } = await supabase
    .from("reservations")
    .select(
      `
      departure_id,
      people_count,
      status,
      reservation_people (
        id
      )
    `,
    )
    .in("departure_id", departureIds);

  if (reservationError) {
    throw new Error(`하문 예약 조회 실패: ${reservationError.message}`);
  }

  const reservations = (reservationData ?? []) as ReservationRow[];

  // --------------------------------
  // 3. 3박5일 / 목요일
  // --------------------------------

  const threeNightSeats: number[] = [];
  const threeNightPremium: number[] = [];
  const threeNightGolf: number[] = [];
  const threeNightLegacyValue: number[] = [];

  for (const date of THURSDAY_DATES) {
    const valueDeparture = getDeparture(departures, date, "하문실속");

    const premiumDeparture = getDeparture(departures, date, "하문고품격");

    const golfDeparture = getDeparture(departures, date, "하문골프54H");

    if (!premiumDeparture) {
      throw new Error(`${date} 하문고품격 출발일이 없습니다.`);
    }

    if (!golfDeparture) {
      throw new Error(`${date} 하문골프54H 출발일이 없습니다.`);
    }

    threeNightSeats.push(getSharedSeat(departures, date));

    threeNightLegacyValue.push(
      valueDeparture
        ? getVariantReservationCount(valueDeparture, reservations)
        : 0,
    );

    threeNightPremium.push(
      getVariantReservationCount(premiumDeparture, reservations),
    );

    threeNightGolf.push(
      getVariantReservationCount(golfDeparture, reservations),
    );
  }

  // --------------------------------
  // 4. 4박6일 / 일요일
  // --------------------------------

  const fourNightSeats: number[] = [];
  const fourNightGuanzhishan: number[] = [];
  const fourNightMuisan: number[] = [];
  const fourNightGolf: number[] = [];

  for (const date of SUNDAY_DATES) {
    const guanzhishanDeparture = getDeparture(departures, date, "고품격관지산");

    const muisanDeparture = getDeparture(departures, date, "고품격무이산");

    const golfDeparture = getDeparture(departures, date, "하문골프72H");

    if (!guanzhishanDeparture) {
      throw new Error(`${date} 고품격관지산 출발일이 없습니다.`);
    }

    if (!muisanDeparture) {
      throw new Error(`${date} 고품격무이산 출발일이 없습니다.`);
    }

    if (!golfDeparture) {
      throw new Error(`${date} 하문골프72H 출발일이 없습니다.`);
    }

    fourNightSeats.push(getSharedSeat(departures, date));

    fourNightGuanzhishan.push(
      getVariantReservationCount(guanzhishanDeparture, reservations),
    );

    fourNightMuisan.push(
      getVariantReservationCount(muisanDeparture, reservations),
    );

    fourNightGolf.push(getVariantReservationCount(golfDeparture, reservations));
  }

  // --------------------------------
  // 5. Google Sheet 업데이트
  // --------------------------------

  const { sheets, spreadsheetId } = getGoogleSheetsClient();
  // 좌석현황 시트의 실제 sheetId 조회
  const spreadsheetInfo = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))",
  });

  const targetSheet = spreadsheetInfo.data.sheets?.find(
    (sheet) => sheet.properties?.title === SHEET_NAME,
  );

  const sheetId = targetSheet?.properties?.sheetId;

  if (sheetId === undefined || sheetId === null) {
    throw new Error("구글시트 좌석현황 탭을 찾을 수 없습니다.");
  }
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",

      data: [
        // 3박5일 보유좌석
        {
          range: `${SHEET_NAME}!C7:S7`,
          values: [threeNightSeats],
        },

        // 3박5일 상품별 모객
        {
          range: `${SHEET_NAME}!C10:S10`,
          values: [threeNightPremium],
        },
        {
          range: `${SHEET_NAME}!C11:S11`,
          values: [threeNightGolf],
        },
        {
          range: `${SHEET_NAME}!C12:S12`,
          values: [Array(THURSDAY_DATES.length).fill("")],
        },

        // 4박6일 보유좌석
        {
          range: `${SHEET_NAME}!C17:R17`,
          values: [fourNightSeats],
        },

        // 4박6일 상품별 모객
        {
          range: `${SHEET_NAME}!C20:R20`,
          values: [fourNightGuanzhishan],
        },
        {
          range: `${SHEET_NAME}!C21:R21`,
          values: [fourNightMuisan],
        },
        {
          range: `${SHEET_NAME}!C22:R22`,
          values: [fourNightGolf],
        },
      ],
    },
  });
  // --------------------------------
  // 5-1. 잔여석 자동 마감 표시 및 색상
  // --------------------------------

  const soldOutRanges = [
    { startRowIndex: 8, endRowIndex: 9, endColumnIndex: 19 }, // C9:S9
    { startRowIndex: 18, endRowIndex: 19, endColumnIndex: 18 }, // C19:R19
  ];

  // 기존 조건부 서식 조회
  const formatInfo = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId),conditionalFormats)",
  });

  const existingRules =
    formatInfo.data.sheets?.find(
      (sheet) => sheet.properties?.sheetId === sheetId,
    )?.conditionalFormats ?? [];

  const formatRequests = soldOutRanges.flatMap((range) => {
    const gridRange = {
      sheetId,
      startRowIndex: range.startRowIndex,
      endRowIndex: range.endRowIndex,
      startColumnIndex: 2,
      endColumnIndex: range.endColumnIndex,
    };

    const firstCell = range.startRowIndex === 8 ? "C9" : "C19";

    const formula = `=AND(ISNUMBER(${firstCell}),${firstCell}=0)`;

    // 이미 같은 범위에 마감 규칙이 있는지 확인
    const ruleExists = existingRules.some(
      (rule) =>
        rule.booleanRule?.condition?.type === "CUSTOM_FORMULA" &&
        rule.booleanRule.condition.values?.[0]?.userEnteredValue === formula &&
        rule.ranges?.some(
          (r) =>
            r.sheetId === sheetId &&
            r.startRowIndex === gridRange.startRowIndex &&
            r.endRowIndex === gridRange.endRowIndex &&
            r.startColumnIndex === gridRange.startColumnIndex &&
            r.endColumnIndex === gridRange.endColumnIndex,
        ),
    );

    const requests: any[] = [
      {
        repeatCell: {
          range: gridRange,
          cell: {
            userEnteredFormat: {
              numberFormat: {
                type: "NUMBER",
                pattern: '0;-0;"마감"',
              },
            },
          },
          fields: "userEnteredFormat.numberFormat",
        },
      },
    ];

    // 기존 규칙이 없을 때만 새로 생성
    if (!ruleExists) {
      requests.push({
        addConditionalFormatRule: {
          rule: {
            ranges: [gridRange],
            booleanRule: {
              condition: {
                type: "CUSTOM_FORMULA",
                values: [{ userEnteredValue: formula }],
              },
              format: {
                backgroundColor: {
                  red: 0.85,
                  green: 0.1,
                  blue: 0.1,
                },
                textFormat: {
                  foregroundColor: {
                    red: 1,
                    green: 1,
                    blue: 1,
                  },
                },
              },
            },
          },
          index: 0,
        },
      });
    }

    return requests;
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: formatRequests,
    },
  });
  // --------------------------------
  // 6. 결과 요약
  // --------------------------------

  const threeNightBooked =
    threeNightLegacyValue.reduce((sum, count) => sum + count, 0) +
    threeNightPremium.reduce((sum, count) => sum + count, 0) +
    threeNightGolf.reduce((sum, count) => sum + count, 0);

  const fourNightBooked =
    fourNightGuanzhishan.reduce((sum, count) => sum + count, 0) +
    fourNightMuisan.reduce((sum, count) => sum + count, 0) +
    fourNightGolf.reduce((sum, count) => sum + count, 0);

  return {
    success: true,
    syncedAt: new Date().toISOString(),

    departureCount: THURSDAY_DATES.length + SUNDAY_DATES.length,

    reservationCount: reservations.length,

    seatUsage: {
      threeNight: threeNightBooked,
      fourNight: fourNightBooked,
      total: threeNightBooked + fourNightBooked,
    },
  };
}
