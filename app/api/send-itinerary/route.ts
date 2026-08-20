import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일 주소가 필요합니다." },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: "BNI AIR TRAVEL <onboarding@resend.dev>",
      to: email,
      subject: "장가계 여행 일정 테스트",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px;">
          <h1>BNI AIR TRAVEL</h1>
          <h2>장가계 여행 일정</h2>
          <p>테스트 메일입니다.</p>
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