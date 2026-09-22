"use client";

import { useState } from "react";

export default function XiamenGoogleSheetSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;

    const confirmed = window.confirm(
      "예약 데이터를 구글 좌석표에 동기화하시겠습니까?",
    );

    if (!confirmed) return;

    try {
      setIsSyncing(true);

      const response = await fetch("/api/admin/xiamen/sync-google-sheet", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "동기화에 실패했습니다.");
      }

      const total = result.data?.seatUsage?.total ?? 0;

      window.alert(`구글 좌석표 동기화 완료!\n현재 하문 모객: ${total}명`);
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
            매일 13시 자동 동기화
          </span>
        </span>
      )}
    </button>
  );
}
