import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  itinerary3N4D,
  itinerary4N5D,
  hotels,
  includes,
  excludes,
} from "@/data/zhangjiajie";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, companyName, managerName, phone, course } =
  await request.json();

    const itinerary =
  course === "4박5일" ? itinerary4N5D : itinerary3N4D;
    
    const itineraryHtml = itinerary
  .map(
    (item) => `
      <div
        style="
          margin-bottom: 24px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background-color: #ffffff;
        "
      >
        <div
          style="
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 700;
            color: #b88a44;
          "
        >
          ${item.day}
        </div>

        <h3
          style="
            margin: 0 0 12px;
            font-size: 20px;
            color: #111827;
          "
        >
          ${item.icon} ${item.title}
        </h3>

        <p
          style="
            margin: 0 0 18px;
            line-height: 1.7;
            color: #4b5563;
          "
        >
          ${item.description}
        </p>

        <div
          style="
            margin-bottom: 16px;
            padding: 14px;
            border-radius: 10px;
            background-color: #f9fafb;
            line-height: 1.7;
          "
        >
          <strong>주요 관광지</strong><br />
          ${item.places.join(" · ")}
        </div>

        <table
          style="
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          "
        >
          <tr>
            <td
              style="
                width: 25%;
                padding: 10px;
                border: 1px solid #e5e7eb;
                background-color: #f9fafb;
                font-weight: 700;
              "
            >
              조식
            </td>

            <td
              style="
                width: 25%;
                padding: 10px;
                border: 1px solid #e5e7eb;
              "
            >
              ${item.meals.breakfast}
            </td>

            <td
              style="
                width: 25%;
                padding: 10px;
                border: 1px solid #e5e7eb;
                background-color: #f9fafb;
                font-weight: 700;
              "
            >
              중식
            </td>

            <td
              style="
                width: 25%;
                padding: 10px;
                border: 1px solid #e5e7eb;
              "
            >
              ${item.meals.lunch}
            </td>
          </tr>

          <tr>
            <td
              style="
                padding: 10px;
                border: 1px solid #e5e7eb;
                background-color: #f9fafb;
                font-weight: 700;
              "
            >
              석식
            </td>

            <td
              style="
                padding: 10px;
                border: 1px solid #e5e7eb;
              "
            >
              ${item.meals.dinner}
            </td>

            <td
              style="
                padding: 10px;
                border: 1px solid #e5e7eb;
                background-color: #f9fafb;
                font-weight: 700;
              "
            >
              숙박
            </td>

            <td
              style="
                padding: 10px;
                border: 1px solid #e5e7eb;
              "
            >
              ${item.hotel}
            </td>
          </tr>
        </table>
      </div>
    `,
  )
  .join("");

  const hotelsHtml = hotels
  .map(
    (hotel) => `
      <div
        style="
          margin-bottom: 12px;
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background-color: #ffffff;
        "
      >
        <div
          style="
            font-size: 17px;
            font-weight: 700;
            color: #111827;
          "
        >
          ${hotel.name}
        </div>

        <div
          style="
            margin-top: 4px;
            color: #b88a44;
          "
        >
          ${hotel.grade}
        </div>

        <div
          style="
            margin-top: 8px;
            line-height: 1.6;
            color: #6b7280;
          "
        >
          ${hotel.desc}
        </div>
      </div>
    `,
  )
  .join("");

const includesHtml = includes
  .map(
    (item) => `
      <li style="margin-bottom: 8px; line-height: 1.6;">
        ${item.text}
      </li>
    `,
  )
  .join("");

const excludesHtml = excludes
  .map(
    (item) => `
      <li style="margin-bottom: 8px; line-height: 1.6;">
        ${item.text}
      </li>
    `,
  )
  .join("");

  const cancellationRules = [
  {
    period: "예약금 입금 다음날 ~ 출발 60일 전",
    fee: "예약금 환불 불가",
  },
  {
    period: "출발 59일 ~ 45일 전",
    fee: "총 여행경비의 30%",
  },
  {
    period: "출발 44일 ~ 30일 전",
    fee: "총 여행경비의 50%",
  },
  {
    period: "출발 29일 ~ 21일 전",
    fee: "총 여행경비의 60%",
  },
  {
    period: "출발 20일 ~ 15일 전",
    fee: "총 여행경비의 70%",
  },
  {
    period: "출발 14일 ~ 1일 전",
    fee: "총 여행경비의 80%",
  },
  {
    period: "출발 당일",
    fee: "총 여행경비의 100%",
  },
];

const cancellationRulesHtml = cancellationRules
  .map(
    (rule) => `
      <tr>
        <td
          style="
            padding: 12px;
            border: 1px solid #e5e7eb;
          "
        >
          ${rule.period}
        </td>

        <td
          style="
            padding: 12px;
            border: 1px solid #e5e7eb;
            font-weight: 700;
          "
        >
          ${rule.fee}
        </td>
      </tr>
    `,
  )
  .join("");

    if (!email) {
      return NextResponse.json(
        { error: "이메일 주소가 필요합니다." },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: "BNI AIR TRAVEL <onboarding@resend.dev>",
      to: email,
      subject: `[${companyName}] 장가계 ${course} 여행 일정`,
      html: `
  <div
    style="
      font-family: Arial, sans-serif;
      padding: 30px;
      color: #111827;
    "
  >
    <div
      style="
        margin-bottom: 40px;
        padding: 32px;
        border-radius: 16px;
        background-color: #faf8f4;
        text-align: center;
      "
    >
      <div
        style="
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #b88a44;
        "
      >
        TRAVEL ITINERARY
      </div>

      <h1
        style="
          margin: 0;
          font-size: 28px;
          color: #111827;
        "
      >
        장가계 ${course} 여행 일정
      </h1>

      <p
        style="
          margin: 12px 0 0;
          color: #6b7280;
        "
      >
        즐거운 여행을 위한 상세 일정을 안내드립니다.
      </p>

      <div
        style="
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          line-height: 1.8;
          color: #374151;
        "
      >
        <strong>${companyName}</strong><br />
        담당자 ${managerName} · ${phone}
      </div>
    </div>

    <h2 style="margin-top: 40px;">상세 일정</h2>

${itineraryHtml}

<h2 style="margin-top: 40px;">이용 예정 호텔</h2>

${hotelsHtml}

<h2 style="margin-top: 40px;">포함사항</h2>

<div
  style="
    padding: 20px;
    border-radius: 12px;
    background-color: #f0fdf4;
    color: #166534;
  "
>
  <ul style="margin: 0; padding-left: 20px;">
    ${includesHtml}
  </ul>
</div>

<h2 style="margin-top: 40px;">불포함사항</h2>

<div
  style="
    padding: 20px;
    border-radius: 12px;
    background-color: #fef2f2;
    color: #991b1b;
  "
>
  <ul style="margin: 0; padding-left: 20px;">
    ${excludesHtml}
  </ul>
</div>
<h2 style="margin-top: 40px;">
  전세기 특별약관 및 취소규정
</h2>

<div
  style="
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #fcd34d;
    border-radius: 12px;
    background-color: #fffbeb;
    line-height: 1.7;
  "
>
  <strong>전세기 특별약관</strong>

  <p style="margin-bottom: 0; color: #4b5563;">
    본 상품은 전세기 상품으로 국외여행 표준약관이 아닌
    전세기 특별약관이 적용됩니다. 취소 시 일반 상품보다
    높은 취소수수료가 발생할 수 있습니다.
  </p>
</div>

<div
  style="
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
  "
>
  <strong>계약금 안내</strong>

  <ul
    style="
      margin-bottom: 0;
      padding-left: 20px;
      line-height: 1.8;
      color: #4b5563;
    "
  >
    <li>예약일 기준 3일 이내 1인당 계약금 200,000원 입금</li>
    <li>기한 내 미입금 시 예약이 자동 취소될 수 있습니다.</li>
    <li>
      취소규정 적용기간 예약 시 계약금보다 취소료가 큰 경우
      해당 취소료가 적용됩니다.
    </li>
  </ul>
</div>

<table
  style="
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  "
>
  <thead>
    <tr style="background-color: #c8a15a; color: #ffffff;">
      <th
        style="
          padding: 12px;
          border: 1px solid #c8a15a;
          text-align: left;
        "
      >
        취소 시점
      </th>

      <th
        style="
          padding: 12px;
          border: 1px solid #c8a15a;
          text-align: left;
        "
      >
        취소 수수료
      </th>
    </tr>
  </thead>

  <tbody>
    ${cancellationRulesHtml}
  </tbody>
</table>

<div
  style="
    margin-top: 20px;
    padding: 18px;
    border: 1px solid #fecaca;
    border-radius: 12px;
    background-color: #fef2f2;
    line-height: 1.7;
  "
>
  <strong style="color: #b91c1c;">※ 중요 안내</strong>

  <p style="margin-bottom: 0; color: #4b5563;">
    항공 좌석 및 호텔 객실을 사전 확보한 전세기 상품으로
    취소 시 위 특별약관이 적용됩니다.
    예약 전 반드시 취소규정을 확인해 주시기 바랍니다.
  </p>
</div>
<hr style="margin: 40px 0;" />
  </div>
`,
    });

    if (error) {
      console.error("RESEND ERROR:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("SEND ITINERARY ERROR:", error);

    return NextResponse.json(
      { error: "메일 발송 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}