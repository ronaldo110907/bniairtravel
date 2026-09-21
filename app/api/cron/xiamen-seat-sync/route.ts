import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { syncXiamenSeats } from "../../../../lib/google/xiamen-seat-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      throw new Error("CRON_SECRET이 설정되지 않았습니다.");
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");
    }

    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const result = await syncXiamenSeats(supabase);

    console.log("[XIAMEN AUTO SHEET SYNC SUCCESS]", result);

    return NextResponse.json({
      success: true,
      message: "하문 Google 좌석표 자동 동기화 완료",
      data: result,
    });
  } catch (error) {
    console.error("[XIAMEN AUTO SHEET SYNC ERROR]", error);

    const message =
      error instanceof Error
        ? error.message
        : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
