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

    if (!departureId) {
      return NextResponse.json(
        { error: "departure id 없음" },
        { status: 400 },
      );
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

// 예약 + 예약자 조회
const { data: reservations, error: reservationError } = await supabase
  .from("reservations")
  .select(
    `
      *,
      people:reservation_people(*)
    `,
  )
  .eq("departure_id", departureId)
  .order("created_at");

if (reservationError) {
  return NextResponse.json(
    { error: reservationError.message },
    { status: 500 },
  );
}

const people = reservations.flatMap((reservation) =>
  (reservation.people || []).map((person: any) => ({
    ...person,
    reservationPhone: reservation.phone,
  })),
);

const rows = people.map((person: any, index: number) => {
  const passportName = person.passport_name ?? "";
  const [lastName, ...firstNames] = passportName.split(" ");


  return {
    no: index + 1,
    name: person.name,
    lastName,
    firstName: firstNames.join(" "),
    sex: person.passport_sex,
    birth: person.passport_birth,
    passportNo: person.passport_number,
    expiry: person.passport_expiry,
    phone: "",
  };
});

function formatTravelPeriod(
  departureDate: string,
  course: string,
) {
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
sheet.getCell("A1").value = `■ 여행기간 : ${formatTravelPeriod(departure.departure_date, departure.course)}`;

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


const buffer = await workbook.xlsx.writeBuffer();

return new NextResponse(buffer, {
  headers: {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition":
      `attachment; filename*=UTF-8''${encodeURIComponent(
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