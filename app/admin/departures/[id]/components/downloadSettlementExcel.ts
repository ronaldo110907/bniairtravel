import * as XLSX from "xlsx-js-style";

type Payment = {
  payment_date: string;
  payment_type: string;
  amount: number;
  memo?: string | null;
};

type SettlementExcelParams = {
  productName: string;
  departureDate: string;
  arrivalDate: string;

  reservationName: string;
  peopleCount: number;

  unitPrice: number;
  airfare: number;
  landCost: number;
  otherCost: number;

  payments: Payment[];

  isCompleted: boolean;
};

export function downloadSettlementExcel({
  productName,
  departureDate,
  arrivalDate,
  reservationName,
  peopleCount,
  unitPrice,
  airfare,
  landCost,
  otherCost,
  payments,
  isCompleted,
}: SettlementExcelParams) {
  const totalPrice = unitPrice * peopleCount;

  const totalAirfare = airfare * peopleCount;
  const totalLandCost = landCost * peopleCount;

  const totalCost =
    totalAirfare +
    totalLandCost +
    otherCost;

  const profit = totalPrice - totalCost;

  const totalPayment = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const unpaid = Math.max(totalPrice - totalPayment, 0);

  // ==============================
  // 엑셀 데이터
  // ==============================

  const rows: any[][] = [
    ["예약건별 정산내역", "", "", ""],

    ["상품명", productName, "예약자", reservationName],
    ["출발일", departureDate, "도착일", arrivalDate],
    ["인원", `${peopleCount}명`, "정산상태", isCompleted ? "정산완료" : "미정산"],

    ["매 출", "", "", ""],

    ["구분", "단가", "인원", "금액"],
    ["상품가", unitPrice, peopleCount, totalPrice],

    ["입 금 내 역", "", "", ""],

    ["입금일", "구분", "입금액", "메모"],
  ];

  if (payments.length === 0) {
    rows.push([
      "-",
      "등록된 입금내역 없음",
      0,
      "-",
    ]);
  } else {
    payments.forEach((payment) => {
      rows.push([
        payment.payment_date,
        payment.payment_type,
        Number(payment.amount || 0),
        payment.memo || "",
      ]);
    });
  }

  rows.push(
    ["총 입금액", "", totalPayment, ""],
    ["미수금", "", unpaid, ""],

    ["원 가", "", "", ""],

    ["구분", "단가", "인원", "금액"],
    ["항공료", airfare, peopleCount, totalAirfare],
    ["랜드비", landCost, peopleCount, totalLandCost],
    ["기타비용", "", "", otherCost],

    ["총 원가", "", "", totalCost],
    ["예약 수익", "", "", profit],
  );

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // ==============================
  // 셀 병합
  // ==============================

  const paymentStartRow = 9;
  const paymentCount = Math.max(payments.length, 1);

  const totalPaymentRow =
    paymentStartRow + paymentCount;

  const unpaidRow =
    totalPaymentRow + 1;

  const costTitleRow =
    unpaidRow + 1;

  const costHeaderRow =
    costTitleRow + 1;

  const airfareRow =
    costHeaderRow + 1;

  const landRow =
    airfareRow + 1;

  const otherRow =
    landRow + 1;

  const totalCostRow =
    otherRow + 1;

  const profitRow =
    totalCostRow + 1;

  ws["!merges"] = [
    // 제목
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 3 },
    },

    // 매출 제목
    {
      s: { r: 4, c: 0 },
      e: { r: 4, c: 3 },
    },

    // 입금내역 제목
    {
      s: { r: 7, c: 0 },
      e: { r: 7, c: 3 },
    },

    // 총 입금액
    {
      s: { r: totalPaymentRow, c: 0 },
      e: { r: totalPaymentRow, c: 1 },
    },

    // 미수금
    {
      s: { r: unpaidRow, c: 0 },
      e: { r: unpaidRow, c: 1 },
    },

    // 원가 제목
    {
      s: { r: costTitleRow, c: 0 },
      e: { r: costTitleRow, c: 3 },
    },

    // 총 원가
    {
      s: { r: totalCostRow, c: 0 },
      e: { r: totalCostRow, c: 2 },
    },

    // 예약 수익
    {
      s: { r: profitRow, c: 0 },
      e: { r: profitRow, c: 2 },
    },
  ];

  // ==============================
  // 열 너비
  // ==============================

  ws["!cols"] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 24 },
  ];

  // ==============================
  // 행 높이
  // ==============================

  ws["!rows"] = rows.map((_, index) => {
    if (index === 0) {
      return { hpt: 34 };
    }

    if (
      index === 4 ||
      index === 7 ||
      index === costTitleRow
    ) {
      return { hpt: 25 };
    }

    return { hpt: 21 };
  });

  // ==============================
  // 공통 셀 스타일
  // ==============================

  const range = XLSX.utils.decode_range(
    ws["!ref"] || "A1:D1",
  );

  for (
    let row = range.s.r;
    row <= range.e.r;
    row++
  ) {
    for (
      let col = range.s.c;
      col <= range.e.c;
      col++
    ) {
      const address =
        XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

      if (!ws[address]) {
        ws[address] = {
          t: "s",
          v: "",
        };
      }

      ws[address].s = {
        font: {
          name: "맑은 고딕",
          sz: 10,
        },

        alignment: {
          vertical: "center",
        },

        border: {
          top: {
            style: "thin",
            color: { rgb: "BFBFBF" },
          },
          bottom: {
            style: "thin",
            color: { rgb: "BFBFBF" },
          },
          left: {
            style: "thin",
            color: { rgb: "BFBFBF" },
          },
          right: {
            style: "thin",
            color: { rgb: "BFBFBF" },
          },
        },
      };
    }
  }

  // ==============================
  // 메인 제목
  // ==============================

  ws["A1"].s = {
    font: {
      name: "맑은 고딕",
      sz: 18,
      bold: true,
    },

    alignment: {
      horizontal: "center",
      vertical: "center",
    },

    border: {
      bottom: {
        style: "medium",
        color: { rgb: "333333" },
      },
    },
  };

  // ==============================
  // 기본정보 라벨
  // ==============================

  ["A2", "C2", "A3", "C3", "A4", "C4"].forEach(
    (address) => {
      ws[address].s = {
        ...ws[address].s,

        font: {
          name: "맑은 고딕",
          sz: 10,
          bold: true,
        },

        fill: {
          fgColor: {
            rgb: "F2F2F2",
          },
        },

        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    },
  );

  // ==============================
  // 구역 제목
  // ==============================

  const sectionRows = [
    4,
    7,
    costTitleRow,
  ];

  sectionRows.forEach((row) => {
    const address =
      XLSX.utils.encode_cell({
        r: row,
        c: 0,
      });

    ws[address].s = {
      font: {
        name: "맑은 고딕",
        sz: 11,
        bold: true,
        color: {
          rgb: "FFFFFF",
        },
      },

      fill: {
        fgColor: {
          rgb: "4472C4",
        },
      },

      alignment: {
        horizontal: "center",
        vertical: "center",
      },

      border: {
        top: {
          style: "thin",
          color: { rgb: "4472C4" },
        },
        bottom: {
          style: "thin",
          color: { rgb: "4472C4" },
        },
        left: {
          style: "thin",
          color: { rgb: "4472C4" },
        },
        right: {
          style: "thin",
          color: { rgb: "4472C4" },
        },
      },
    };
  });

  // ==============================
  // 표 헤더
  // ==============================

  const headerRows = [
    5,
    8,
    costHeaderRow,
  ];

  headerRows.forEach((row) => {
    for (let col = 0; col <= 3; col++) {
      const address =
        XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

      ws[address].s = {
        ...ws[address].s,

        font: {
          name: "맑은 고딕",
          sz: 10,
          bold: true,
        },

        fill: {
          fgColor: {
            rgb: "D9EAF7",
          },
        },

        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }
  });

  // ==============================
  // 금액 표시
  // ==============================

  Object.keys(ws).forEach((key) => {
    if (key.startsWith("!")) return;

    const cell = ws[key];

    if (
      cell &&
      typeof cell.v === "number"
    ) {
      cell.z = '#,##0"원"';

      cell.s = {
        ...cell.s,

        alignment: {
          horizontal: "right",
          vertical: "center",
        },
      };
    }
  });

  // 인원 숫자는 원 표시 제거
  if (ws["C7"]) {
    ws["C7"].z = '0"명"';

    ws["C7"].s = {
      ...ws["C7"].s,
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };
  }

  const airfarePeopleCell =
    XLSX.utils.encode_cell({
      r: airfareRow,
      c: 2,
    });

  const landPeopleCell =
    XLSX.utils.encode_cell({
      r: landRow,
      c: 2,
    });

  [airfarePeopleCell, landPeopleCell].forEach(
    (address) => {
      if (ws[address]) {
        ws[address].z = '0"명"';

        ws[address].s = {
          ...ws[address].s,
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        };
      }
    },
  );

  // ==============================
  // 총계 강조
  // ==============================

  [
    totalPaymentRow,
    unpaidRow,
    totalCostRow,
    profitRow,
  ].forEach((row) => {
    for (let col = 0; col <= 3; col++) {
      const address =
        XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

      ws[address].s = {
        ...ws[address].s,

        font: {
          name: "맑은 고딕",
          sz: 10,
          bold: true,
        },

        fill: {
          fgColor: {
            rgb:
              row === profitRow
                ? "E2F0D9"
                : "FFF2CC",
          },
        },
      };
    }
  });

  // ==============================
  // A4 인쇄 설정
  // ==============================

  ws["!pageSetup"] = {
    paperSize: 9,
    orientation: "portrait",
    fitToWidth: 1,
    fitToHeight: 1,
  };

  ws["!margins"] = {
    left: 0.25,
    right: 0.25,
    top: 0.35,
    bottom: 0.35,
    header: 0.15,
    footer: 0.15,
  };

  // 인쇄 영역
  ws["!printArea"] =
    `A1:D${profitRow + 1}`;

  // ==============================
  // 파일 생성
  // ==============================

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "예약 정산",
  );

  XLSX.writeFile(
    wb,
    `정산_${reservationName}_${departureDate}.xlsx`,
  );
}