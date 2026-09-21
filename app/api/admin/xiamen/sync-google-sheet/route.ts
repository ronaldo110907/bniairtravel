import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import { syncXiamenSeats } from "../../../../../lib/google/xiamen-seat-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // 관리자 로그인 확인
    const cookieStore = await cookies();
    const adminUser = cookieStore.get("admin_user")?.value;

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message: "관리자 로그인이 필요합니다.",
        },
        { status: 401 },
      );
    }

    // Supabase 서버 환경변수
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");
    }

    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
    }

    // 서버 전용 Supabase Client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 하문 → Google Sheet 동기화
    const result = await syncXiamenSeats(supabase);

    return NextResponse.json({
      success: true,
      message: "하문 Google 좌석표 동기화가 완료되었습니다.",
      data: result,
    });
  } catch (error) {
    console.error("[XIAMEN GOOGLE SHEET SYNC ERROR]", error);

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
