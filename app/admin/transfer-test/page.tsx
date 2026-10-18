"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TransferTestPage() {
  const [result, setResult] = useState("테스트 대기 중");
  const [loading, setLoading] = useState(false);

  async function runTest() {
    if (loading) return;

    setLoading(true);
    setResult("검사 중...");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setResult("로그인 토큰이 없습니다. 관리자 재로그인이 필요합니다.");
        return;
      }

      const response = await fetch("/api/admin/reservations/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reservationId: "2c895827-1a2a-42f4-a72c-db5290b0a005",
          targetDepartureId: "1d097b0f-2c31-4291-9c8c-e48870b408bb",
        }),
      });

      const data = await response.json();

      setResult(
        JSON.stringify(
          {
            httpStatus: response.status,
            response: data,
          },
          null,
          2,
        ),
      );
    } catch (error) {
      setResult(error instanceof Error ? error.message : "테스트 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-2xl font-bold">예약 이동 API 인증 테스트</h1>

      <button
        onClick={runTest}
        disabled={loading}
        className="rounded-lg bg-blue-700 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "검사 중..." : "인증 테스트 실행"}
      </button>

      <pre className="mt-5 overflow-auto rounded-lg bg-gray-100 p-4 text-sm text-black">
        {result}
      </pre>
    </main>
  );
}
