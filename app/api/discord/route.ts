import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🔥 Discord API 호출됨");
  try {
    const { message } = await req.json();

    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook URL이 없습니다." },
        { status: 500 },
      );
    }

    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!response.ok) {
      throw new Error("Discord 전송 실패");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Discord 전송 실패" },
      { status: 500 },
    );
  }
}