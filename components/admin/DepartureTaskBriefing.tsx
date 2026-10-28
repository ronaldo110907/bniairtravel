"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type BriefingReservation = {
  reservationId: string;
  productName: string;
  representativeName: string;
  departureDate: string;
  peopleCount: number;
  dDay: number;

  // 실제 미처리 업무
  pendingTasks: string[];

  // 전자입국신고서, Q-CODE 등 확인 안내
  reminders: string[];
};

type Props = {
  today: string;
  viewerId: string;
  items: BriefingReservation[];
};

export default function DepartureTaskBriefing({
  today,
  viewerId,
  items,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 관리자 계정별, 날짜별로 팝업 표시 기록 분리
  const storageKey =
    `bni-departure-briefing:${viewerId}:${today}`;

  // 표시할 내용이 있는 예약만 추출
  const reservations = useMemo(() => {
    return items
      .filter(
        (item) =>
          item.pendingTasks.length > 0 ||
          item.reminders.length > 0,
      )
      .sort((a, b) => {
        if (a.dDay !== b.dDay) {
          return a.dDay - b.dDay;
        }

        return a.departureDate.localeCompare(
          b.departureDate,
        );
      });
  }, [items]);

  const pendingCount = reservations.reduce(
    (sum, item) => sum + item.pendingTasks.length,
    0,
  );

  const reminderCount = reservations.reduce(
    (sum, item) => sum + item.reminders.length,
    0,
  );

  // 하루 한 번 자동 표시
  useEffect(() => {
    if (reservations.length === 0) return;

    const timer = window.setTimeout(() => {
      try {
        const closed =
          window.localStorage.getItem(storageKey);

        if (closed !== "closed") {
          setIsOpen(true);
        }
      } catch {
        setIsOpen(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [reservations.length, storageKey]);

  // 팝업 닫기
  const closeBriefing = useCallback(() => {
    try {
      window.localStorage.setItem(
        storageKey,
        "closed",
      );
    } catch {
      // 브라우저 저장소 사용 불가 시에도 닫기 허용
    }

    setIsOpen(false);
  }, [storageKey]);

  // ESC 닫기 및 팝업 표시 중 배경 스크롤 방지
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBriefing();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, closeBriefing]);

  // 확인할 예약이 없으면 아무것도 표시하지 않음
  if (reservations.length === 0) {
    return null;
  }

  return (
    <>
      {/* 관리자 메인에서 다시 보기 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="
          inline-flex items-center gap-2
          rounded-xl border border-blue-200
          bg-blue-50 px-4 py-2.5
          text-sm font-bold text-blue-700
          transition hover:bg-blue-100
        "
      >
        📋 출발 전 업무 브리핑

        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
          {reservations.length}건
        </span>
      </button>

      {/* 팝업 */}
      {isOpen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-black/50 p-4
          "
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="briefing-title"
            className="
              flex w-full max-w-2xl
              max-h-[90vh] flex-col
              overflow-hidden rounded-2xl
              bg-white shadow-2xl
            "
          >
            {/* 헤더 */}
            <div className="shrink-0 border-b bg-blue-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-blue-600">
                    BNI AIR TRAVEL
                  </p>

                  <h2
                    id="briefing-title"
                    className="mt-1 text-xl font-extrabold text-gray-900"
                  >
                    ✈️ 출발 전 업무 브리핑
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {today} 기준
                  </p>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeBriefing}
                  aria-label="브리핑 닫기"
                  className="
                    rounded-lg px-3 py-1.5
                    text-gray-500
                    hover:bg-white hover:text-gray-900
                  "
                >
                  ✕
                </button>
              </div>

              {/* 업무 요약 */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-gray-700">
                  📅 대상 예약 {reservations.length}건
                </span>

                {pendingCount > 0 && (
                  <span className="rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700">
                    ⚠ 미처리 업무 {pendingCount}건
                  </span>
                )}

                {reminderCount > 0 && (
                  <span className="rounded-lg bg-orange-100 px-3 py-2 text-sm font-bold text-orange-700">
                    🔔 확인 안내 {reminderCount}건
                  </span>
                )}
              </div>
            </div>

            {/* 예약별 카드 */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {reservations.map((reservation) => (
                <div
                  key={reservation.reservationId}
                  className="
                    overflow-hidden rounded-xl
                    border border-gray-200
                    bg-white
                  "
                >
                  <div className="border-b bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-gray-900">
                        ✈️ {reservation.productName}
                      </h3>

                      <span
                        className={`
                          shrink-0 rounded-full px-3 py-1
                          text-xs font-bold
                          ${
                            reservation.dDay <= 1
                              ? "bg-red-100 text-red-700"
                              : reservation.dDay <= 3
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                          }
                        `}
                      >
                        {reservation.dDay === 0
                          ? "D-DAY"
                          : `D-${reservation.dDay}`}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      📅 {reservation.departureDate}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      👤 {reservation.representativeName}
                      {" · "}
                      {reservation.peopleCount}명
                    </p>
                  </div>

                  <div className="space-y-4 p-4">
                    {/* 미처리 업무 */}
                    {reservation.pendingTasks.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-bold text-red-700">
                          ⚠ 미처리 업무
                        </p>

                        <div className="space-y-2">
                          {reservation.pendingTasks.map(
                            (task, index) => (
                              <div
                                key={`${index}-${task}`}
                                className="
                                  rounded-lg bg-red-50
                                  px-3 py-2 text-sm
                                  text-red-800
                                "
                              >
                                • {task}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* 출입국 확인 안내 */}
                    {reservation.reminders.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-bold text-orange-700">
                          🔔 출발 전 확인 사항
                        </p>

                        <div className="space-y-2">
                          {reservation.reminders.map(
                            (reminder, index) => (
                              <div
                                key={`${index}-${reminder}`}
                                className="
                                  rounded-lg bg-orange-50
                                  px-3 py-2 text-sm
                                  text-orange-800
                                "
                              >
                                • {reminder}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Link
                        href={`/admin/reservations?id=${encodeURIComponent(
                          reservation.reservationId,
                        )}`}
                        onClick={closeBriefing}
                        className="
                          rounded-lg bg-blue-600
                          px-4 py-2 text-sm
                          font-bold text-white
                          transition hover:bg-blue-700
                        "
                      >
                        예약 상세 바로가기 →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 버튼 */}
            <div className="flex shrink-0 justify-end gap-3 border-t bg-gray-50 p-4">
              <button
                type="button"
                onClick={closeBriefing}
                className="
                  rounded-xl border border-gray-300
                  bg-white px-5 py-2.5
                  text-sm font-bold text-gray-700
                  hover:bg-gray-100
                "
              >
                오늘은 닫기
              </button>

              <Link
                href="/admin/reservations"
                onClick={closeBriefing}
                className="
                  rounded-xl bg-blue-600
                  px-5 py-2.5 text-sm
                  font-bold text-white
                  hover:bg-blue-700
                "
              >
                예약관리
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}