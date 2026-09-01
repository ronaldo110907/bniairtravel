import { NextResponse } from "next/server";

type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

export async function GET() {
  try {
    const response = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=KRW&symbols=USD,CNY,JPY",
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!response.ok) {
      throw new Error("환율 정보를 불러오지 못했습니다.");
    }

    const data: FrankfurterResponse = await response.json();

    const usd = data.rates.USD;
    const cny = data.rates.CNY;
    const jpy = data.rates.JPY;

    if (!usd || !cny || !jpy) {
      throw new Error("환율 데이터가 올바르지 않습니다.");
    }

    return NextResponse.json({
      success: true,

      date: data.date,

      rates: {
        USD: 1 / usd,
        CNY: 1 / cny,
        JPY: 1 / jpy,
      },
    });
  } catch (error) {
    console.error("EXCHANGE RATE ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "환율 조회 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  }
}
