import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import path from "path";
import { flightInfo as zhangjiajieFlightInfo } from "@/data/zhangjiajie";
import { flightInfo as baekduFlightInfo } from "@/data/baekdu";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departureId = searchParams.get("id");
    const reservationIds =
      searchParams
        .get("reservationIds")
        ?.split(",")
        .map((id) => id.trim())
        .filter(Boolean) ?? [];

    if (!departureId) {
      return NextResponse.json({ error: "departure id 없음" }, { status: 400 });
    }

    // 출발일 조회
    const { data: departure, error: departureError } = await supabase
      .from("departures")
      .select(
        `
      *,
      products (
        title,
        slug
      )
    `,
      )
      .eq("id", departureId)
      .single();

    if (departureError) {
      return NextResponse.json(
        { error: departureError.message },
        { status: 500 },
      );
    }

    // 객실 조회
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .eq("departure_id", departureId)
      .order("created_at", { ascending: true });

    if (roomsError) {
      return NextResponse.json({ error: roomsError.message }, { status: 500 });
    }

    const roomIds = (rooms ?? []).map((room: any) => room.id);

    let roomMembers: any[] = [];

    if (roomIds.length > 0) {
      const { data, error: roomMembersError } = await supabase
        .from("room_members")
        .select(
          `
      id,
      room_id,
      reservation_person_id,
      reservation_people (
        id,
        reservation_id,
        name,
        passport_name,
        passport_last_name,
        passport_first_name,
        passport_sex,
        passport_birth
      )
    `,
        )
        .in("room_id", roomIds);

      if (roomMembersError) {
        return NextResponse.json(
          { error: roomMembersError.message },
          { status: 500 },
        );
      }

      roomMembers = data ?? [];
    }

    // 예약 + 예약자 조회
    let reservationQuery = supabase
      .from("reservations")
      .select(
        `
      *,
      people:reservation_people(*)
    `,
      )
      .eq("departure_id", departureId)
      .neq("status", "취소")
      .order("created_at");

    if (reservationIds.length > 0) {
      reservationQuery = reservationQuery.in("id", reservationIds);
    }

    const { data: reservations, error: reservationError } =
      await reservationQuery;

    if (reservationError) {
      return NextResponse.json(
        { error: reservationError.message },
        { status: 500 },
      );
    }
    const includedReservationIds = new Set(
      (reservations ?? []).map((reservation: any) => String(reservation.id)),
    );

    const filteredRoomMembers = roomMembers.filter((member: any) => {
      const reservationId = member.reservation_people?.reservation_id;

      return reservationId && includedReservationIds.has(String(reservationId));
    });

    const people = reservations
      .flatMap((reservation) =>
        (reservation.people || []).map((person: any) => ({
          ...person,
          reservationPhone: reservation.phone,
        })),
      )
      .sort(
        (a: any, b: any) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999),
      );

    const rows = people.map((person: any, index: number) => {
      const passportName = (person.passport_name ?? "").trim();
      const [legacyLastName = "", ...legacyFirstNames] =
        passportName.split(/\s+/);

      return {
        no: index + 1,
        name: person.name,

        lastName: person.passport_last_name?.trim() || legacyLastName,

        firstName:
          person.passport_first_name?.trim() || legacyFirstNames.join(" "),

        sex: person.passport_sex,
        birth: person.passport_birth,
        passportNo: person.passport_number,
        expiry: person.passport_expiry,
        phone: "",
      };
    });

    function formatTravelPeriod(departureDate: string, course: string) {
      const start = new Date(departureDate);

      const end = new Date(start);

      const nights = course === "4N5D" ? 4 : 3;

      end.setDate(end.getDate() + nights);

      const week = ["일", "월", "화", "수", "목", "금", "토"];

      const format = (date: Date) =>
        `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}(${week[date.getDay()]})`;

      return `${format(start)} ~ ${format(end)} ${nights}박 ${nights + 1}일`;
    }
    // 템플릿 읽기
    const workbook = new ExcelJS.Workbook();

    const templatePath = path.join(
      process.cwd(),
      "public",
      "templates",
      "dispatch-template.xlsx",
    );

    await workbook.xlsx.readFile(templatePath);

    const sheet = workbook.getWorksheet(1);

    if (!sheet) {
      throw new Error("템플릿 시트를 찾을 수 없습니다.");
    }
    let flightInfo = null;

    switch (departure.products?.slug) {
      case "zhangjiajie":
        flightInfo = zhangjiajieFlightInfo;
        break;

      case "baekdu":
        flightInfo = baekduFlightInfo;
        break;
    }
    sheet.getCell("A1").value =
      `■ 여행기간 : ${formatTravelPeriod(departure.departure_date, departure.course)}`;

    sheet.getCell("A2").value = `■ 피켓명 : ${departure.products?.title}`;

    sheet.getCell("A3").value = `■ 인원 : ${rows.length}명 PKG`;

    sheet.getCell("A5").value = flightInfo
      ? `■ 스케줄 :
출발 : ${flightInfo.outbound.flight} ${flightInfo.outbound.from} ${flightInfo.outbound.departure} → ${flightInfo.outbound.to} ${flightInfo.outbound.arrival}
귀국 : ${flightInfo.inbound.flight} ${flightInfo.inbound.from} ${flightInfo.inbound.departure} → ${flightInfo.inbound.to} ${flightInfo.inbound.arrival}`
      : "";

    let row = 8;
    sheet.getCell("A5").alignment = {
      vertical: "top",
      wrapText: true,
    };

    sheet.getRow(5).height = 70;

    rows.forEach((person) => {
      sheet.getCell(`A${row}`).value = person.no;
      sheet.getCell(`B${row}`).value = person.name;
      sheet.getCell(`C${row}`).value = person.lastName;
      sheet.getCell(`D${row}`).value = person.firstName;
      sheet.getCell(`E${row}`).value = person.sex;
      sheet.getCell(`F${row}`).value = person.birth;
      sheet.getCell(`G${row}`).value = "";
      sheet.getCell(`H${row}`).value = person.passportNo;
      sheet.getCell(`I${row}`).value = person.expiry;
      sheet.getCell(`J${row}`).value = "";

      row++;
    });

    // ======================================================
    // ROOMING LIST 시트
    // ======================================================

    const roomingSheet = workbook.addWorksheet("ROOMING LIST");

    // 영문명 변환
    function getEnglishName(person: any) {
      const lastName = (person?.passport_last_name ?? "").trim();
      const firstName = (person?.passport_first_name ?? "").trim();

      if (lastName || firstName) {
        return [lastName, firstName].filter(Boolean).join("/").toUpperCase();
      }

      const passportName = (person?.passport_name ?? "").trim();

      if (!passportName) return "";

      const [legacyLastName = "", ...legacyFirstNames] =
        passportName.split(/\s+/);

      return [legacyLastName, legacyFirstNames.join(" ")]
        .filter(Boolean)
        .join("/")
        .toUpperCase();
    }

    // 객실 타입별 객실 수
    const singleRoomCount = (rooms ?? []).filter(
      (room: any) => room.room_type === "1인실",
    ).length;

    const twinRoomCount = (rooms ?? []).filter(
      (room: any) => room.room_type === "2인실",
    ).length;

    const tripleRoomCount = (rooms ?? []).filter(
      (room: any) => room.room_type === "3인실",
    ).length;

    // 제목
    roomingSheet.mergeCells("A1:D1");

    roomingSheet.getCell("A1").value = "ROOMING LIST";

    roomingSheet.getCell("A1").font = {
      size: 20,
      bold: true,
    };

    roomingSheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    roomingSheet.getRow(1).height = 32;

    // 기본 정보
    roomingSheet.mergeCells("A2:B2");
    roomingSheet.getCell("A2").value =
      `상품명 : ${departure.products?.title ?? ""}`;

    roomingSheet.mergeCells("C2:D2");
    roomingSheet.getCell("C2").value =
      `출발일 : ${departure.departure_date ?? ""}`;

    roomingSheet.mergeCells("A3:B3");
    roomingSheet.getCell("A3").value = `총 인원 : ${rows.length}명`;

    roomingSheet.mergeCells("C3:D3");
    roomingSheet.getCell("C3").value = `총 객실 : ${(rooms ?? []).length}실`;

    const roomSummary = [
      singleRoomCount > 0 ? `싱글 ${singleRoomCount}실` : "",
      twinRoomCount > 0 ? `트윈 ${twinRoomCount}실` : "",
      tripleRoomCount > 0 ? `트리플 ${tripleRoomCount}실` : "",
    ]
      .filter(Boolean)
      .join(" / ");

    roomingSheet.mergeCells("A4:D4");
    roomingSheet.getCell("A4").value = `객실 구성 : ${roomSummary || "-"}`;

    // 상단 정보 스타일
    ["A2", "C2", "A3", "C3", "A4"].forEach((cellAddress) => {
      const cell = roomingSheet.getCell(cellAddress);

      cell.font = {
        bold: true,
        size: 11,
      };

      cell.alignment = {
        vertical: "middle",
      };
    });

    roomingSheet.getRow(2).height = 24;
    roomingSheet.getRow(3).height = 24;

    // 표 헤더
    const headerRowNumber = 5;

    const headers = ["NO", "객실명", "객실유형", "한글명"];

    headers.forEach((header, index) => {
      const cell = roomingSheet.getCell(headerRowNumber, index + 1);

      cell.value = header;

      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    roomingSheet.getRow(headerRowNumber).height = 25;

    // 컬럼 너비
    roomingSheet.columns = [
      { width: 7 },
      { width: 16 },
      { width: 12 },
      { width: 18 },
    ];

    let roomingRow = 6;
    let roomingNo = 1;

    for (const room of rooms ?? []) {
      const members = filteredRoomMembers.filter(
        (member: any) => String(member.room_id) === String(room.id),
      );

      if (members.length === 0) {
        continue;
      }

      const roomStartRow = roomingRow;

      members.forEach((member: any) => {
        const person = member.reservation_people;

        const values = [
          roomingNo,
          "", // 객실명은 아래에서 병합 후 입력
          "", // 객실유형도 아래에서 병합 후 입력
          person?.name ?? "",
        ];

        values.forEach((value, columnIndex) => {
          const cell = roomingSheet.getCell(roomingRow, columnIndex + 1);

          cell.value = value;

          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          // 모든 칸 검정 외곽선
          cell.border = {
            top: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          };
        });

        roomingRow++;
        roomingNo++;
      });

      const roomEndRow = roomingRow - 1;

      // 같은 객실에 2명 이상이면 객실명 / 객실유형 세로 병합
      if (roomEndRow > roomStartRow) {
        roomingSheet.mergeCells(`B${roomStartRow}:B${roomEndRow}`);

        roomingSheet.mergeCells(`C${roomStartRow}:C${roomEndRow}`);
      }

      // 병합된 셀 값 입력
      roomingSheet.getCell(`B${roomStartRow}`).value = room.room_name;

      roomingSheet.getCell(`C${roomStartRow}`).value = room.room_type;

      roomingSheet.getCell(`B${roomStartRow}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      roomingSheet.getCell(`C${roomStartRow}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      // 병합 영역 외곽선 다시 적용
      for (let r = roomStartRow; r <= roomEndRow; r++) {
        ["B", "C"].forEach((col) => {
          const cell = roomingSheet.getCell(`${col}${r}`);

          cell.border = {
            top: {
              style: r === roomStartRow ? "thin" : undefined,
              color: { argb: "FF000000" },
            },
            left: {
              style: "thin",
              color: { argb: "FF000000" },
            },
            bottom: {
              style: r === roomEndRow ? "thin" : undefined,
              color: { argb: "FF000000" },
            },
            right: {
              style: "thin",
              color: { argb: "FF000000" },
            },
          };
        });
      }
    }

    // 객실 메모가 있는 경우 하단 표시
    const roomsWithMemo = (rooms ?? []).filter((room: any) =>
      room.memo?.trim(),
    );

    if (roomsWithMemo.length > 0) {
      roomingRow++;

      roomingSheet.mergeCells(`A${roomingRow}:D${roomingRow}`);

      roomingSheet.getCell(`A${roomingRow}`).value = "■ 객실 비고";

      roomingSheet.getCell(`A${roomingRow}`).font = {
        bold: true,
      };

      roomingRow++;

      for (const room of roomsWithMemo) {
        roomingSheet.mergeCells(`A${roomingRow}:D${roomingRow}`);

        roomingSheet.getCell(`A${roomingRow}`).value =
          `${room.room_name} : ${room.memo}`;

        roomingRow++;
      }
    }

    // 인쇄 설정
    roomingSheet.pageSetup = {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,

      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    };

    roomingSheet.views = [
      {
        state: "frozen",
        ySplit: 5,
      },
    ];
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          `수배의뢰서_${departure.products?.title}_${departure.departure_date}.xlsx`,
        )}`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "dispatch 생성 실패",
      },
      {
        status: 500,
      },
    );
  }
}
