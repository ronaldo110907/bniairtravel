// lib/admin/departureTaskRules.ts

export type TaskCheck = boolean | null;

export type DepartureTaskSource = {
  reservationId: string;
  productName: string;
  representativeName: string;
  departureDate: string;

  // 실제 한국 도착일
  arrivalDate: string | null;

  peopleCount: number;
  status: string;

  // 기존 관리자 시스템에서 확인할 값
  passportMissingCount: number | null;
  dispatchDone: TaskCheck;
  roomingDone: TaskCheck;
  balanceDue: number | null;
  insuranceDone: TaskCheck;

  // 상품별 출입국 관련 설정
  requiresEntryDeclaration: boolean;
  requiresQcode: boolean;
};

// 날짜 차이 계산 (시간대에 따른 오차 방지)
export function getCalendarDayDiff(
  today: string,
  targetDate: string,
): number | null {
  function parseDate(value: string): number | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }

    const [year, month, day] = value.split("-").map(Number);

    const timestamp = Date.UTC(year, month - 1, day);
    const date = new Date(timestamp);

    if (date.toISOString().slice(0, 10) !== value) {
      return null;
    }

    return timestamp;
  }

  const start = parseDate(today);
  const end = parseDate(targetDate);

  if (start === null || end === null) {
    return null;
  }

  return Math.round(
    (end - start) / (1000 * 60 * 60 * 24),
  );
}

// 출발 임박 업무 브리핑 생성
export function buildDepartureTaskBriefing(
  sources: DepartureTaskSource[],
  today: string,
) {
  return sources
    .map((source) => {
      // 확정 예약만 대상
      if (source.status !== "확정") {
        return null;
      }

      const dDay = getCalendarDayDiff(
        today,
        source.departureDate,
      );

      // 출발 7일 전부터 출발 당일까지
      if (dDay === null || dDay < 0 || dDay > 7) {
        return null;
      }

      const pendingTasks: string[] = [];
      const reminders: string[] = [];

      // 완료 상태 판단 공통 함수
      const checkTask = (
        done: TaskCheck,
        incompleteMessage: string,
        unknownMessage: string,
      ) => {
        if (done === false) {
          pendingTasks.push(incompleteMessage);
        } else if (done === null) {
          pendingTasks.push(unknownMessage);
        }
      };

      // 1. 여권정보
      if (source.passportMissingCount === null) {
        pendingTasks.push("여권정보 등록 상태 확인 필요");
      } else if (source.passportMissingCount > 0) {
        pendingTasks.push(
          `여권정보 미등록 ${source.passportMissingCount}명`,
        );
      }

      // 2. 수배의뢰서
      checkTask(
        source.dispatchDone,
        "수배의뢰서 미생성",
        "수배의뢰서 생성 여부 확인 필요",
      );

      // 3. 객실배정
      checkTask(
        source.roomingDone,
        "객실배정 미완료",
        "객실배정 완료 여부 확인 필요",
      );

      // 4. 잔금
      if (source.balanceDue === null) {
        pendingTasks.push("잔금 정산 상태 확인 필요");
      } else if (source.balanceDue > 0) {
        pendingTasks.push(
          `잔금 미수 ${source.balanceDue.toLocaleString("ko-KR")}원`,
        );
      }

      // 5. 확정서
// 완료 여부 판단 없이 출발 전 확인 안내만 표시
reminders.push(
  "확정서 최종 확인 및 전달 여부 확인",
);
      // 6. 여행자보험
      checkTask(
        source.insuranceDone,
        "여행자보험 미완료",
        "여행자보험 가입 여부 확인 필요",
      );

      // 7. 전자입국신고서
      // 완료 체크 없이 안내만 표시
      if (source.requiresEntryDeclaration) {
        reminders.push(
          "전자입국신고서 작성 필요 여부 및 작성 여부 확인",
        );
      }

      // 8. Q-CODE
      // 한국 도착일 기준 7일 이내에만 작성 안내
      if (source.requiresQcode) {
        if (!source.arrivalDate) {
          reminders.push(
            "Q-CODE 한국 도착일 확인 필요",
          );
        } else {
          const arrivalDDay = getCalendarDayDiff(
            today,
            source.arrivalDate,
          );

          if (arrivalDDay === null) {
            reminders.push(
              "Q-CODE 한국 도착일 확인 필요",
            );
          } else if (
            arrivalDDay >= 0 &&
            arrivalDDay <= 7
          ) {
            reminders.push(
              "Q-CODE 작성 필요 여부 및 작성 여부 확인",
            );
          }
        }
      }

      // 처리하거나 확인할 사항이 없으면 제외
      if (
        pendingTasks.length === 0 &&
        reminders.length === 0
      ) {
        return null;
      }

      return {
        reservationId: source.reservationId,
        productName: source.productName,
        representativeName: source.representativeName,
        departureDate: source.departureDate,
        peopleCount: source.peopleCount,
        dDay,
        pendingTasks,
        reminders,
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== null,
    )
    .sort((a, b) => a.dDay - b.dDay);
}