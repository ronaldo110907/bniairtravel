"use client";

import { useState } from "react";

export default function XiamenGoogleSheetSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;

    const confirmed = window.confirm(
      "하문·장가계 예약 데이터를 각 구글 좌석표에 동기화하시겠습니까?",
    );

    if (!confirmed) return;

    try {
      setIsSyncing(true);

      const targets = [{ slug: "xiamen", name: "하문" }, { slug: "zhangjiajie", name: "장가계" }];
      const results = await Promise.allSettled(targets.map(async ({ slug, name }) => {
        const response = await fetch(`/api/admin/${slug}/sync-google-sheet`, { method: "POST" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "동기화 실패");
        const usage = result.data?.seatUsage;
        return slug === "zhangjiajie"
          ? `${name}: 완료 (홀드 ${usage?.hold ?? 0}명 / 확정 ${usage?.confirmed ?? 0}명)`
          : `${name}: 완료 (모객 ${usage?.total ?? 0}명)`;
      }));
      window.alert(results.map((result, index) => result.status === "fulfilled"
        ? result.value
        : `${targets[index].name}: 실패 — ${result.reason instanceof Error ? result.reason.message : "잠시 후 다시 시도해 주세요."}`
      ).join("\n"));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";

      window.alert(`구글 좌석표 동기화 실패\n${message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={isSyncing}
      className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {isSyncing ? (
        "🔄 동기화 중..."
      ) : (
        <span className="flex flex-col items-center leading-tight">
          <span>📊 구글시트 좌석 동기화</span>
          <span className="mt-1 text-[10px] font-medium text-green-100">
            하문 17:00 · 장가계 17:05 자동 동기화
          </span>
        </span>
      )}
    </button>
  );
}
