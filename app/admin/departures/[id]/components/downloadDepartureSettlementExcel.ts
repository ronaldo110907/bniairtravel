import * as XLSX from "xlsx-js-style";

type SettlementRow = {
  id: string;
  name: string;
  sales: number;
  expense: number;
  profit: number;
};

type DepartureSettlementExcelParams = {
  productName: string;
  departureDate: string;
  peopleCount: number;

  rows: SettlementRow[];

  insuranceCost: number;

  totalSales: number;
  totalReservationExpense: number;
  totalExpense: number;
  finalProfit: number;
};

export function downloadDepartureSettlementExcel({
  productName,
  departureDate,
  peopleCount,
  rows,
  insuranceCost,
  totalSales,
  totalReservationExpense,
  totalExpense,
  finalProfit,
}: DepartureSettlementExcelParams) {
  const data: any[][] = [
    ["일자별 총 정산", "", "", ""],

    ["상품명", productName, "출발일", departureDate],
    ["총 인원", `${peopleCount}명`, "", ""],

    ["예약자", "판매금액", "지출금액", "예약수익"],
  ];

  // 예약건별 정산
  if (rows.length === 0) {
    data.push(["등록된 예약 없음", 0, 0, 0]);
  } else {
    rows.forEach((item) => {
      data.push([
        item.name,
        item.sales,
        item.expense,
        item.profit,
      ]);
    });
  }

  const reservationEndRow = data.length;

  data.push(
    [
      "예약 합계",
      totalSales,
      totalReservationExpense,
      totalSales - totalReservationExpense,
    ],

    ["", "", "", ""],

    ["여행자보험료", "", "", insuranceCost],

    ["", "", "", ""],

    ["총 판매금액", "", "", totalSales],
    ["총 지출금액", "", "", totalExpense],
    ["최종 수익", "", "", finalProfit],
  );

  const ws = XLSX.utils.aoa_to_sheet(data);

  // ========================================
  // 행 위치
  // ========================================

  const reservationTotalRow = reservationEndRow;
  const insuranceRow = reservationTotalRow + 2;
  const totalSalesRow = insuranceRow + 2;
  const totalExpenseRow = totalSalesRow + 1;
  const finalProfitRow = totalExpenseRow + 1;

  // ========================================
  // 셀 병합
  // ========================================

  ws["!merges"] = [
    // 제목
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 3 },
    },

    // 총 인원 값
    {
      s: { r: 2, c: 1 },
      e: { r: 2, c: 3 },
    },

    // 여행자보험료
    {
      s: { r: insuranceRow, c: 0 },
      e: { r: insuranceRow, c: 2 },
    },

    // 총 판매금액
    {
      s: { r: totalSalesRow, c: 0 },
      e: { r: totalSalesRow, c: 2 },
    },

    // 총 지출금액
    {
      s: { r: totalExpenseRow, c: 0 },
      e: { r: totalExpenseRow, c: 2 },
    },

    // 최종 수익
    {
      s: { r: finalProfitRow, c: 0 },
      e: { r: finalProfitRow, c: 2 },
    },
  ];

  // ========================================
  // 열 너비
  // ========================================

  ws["!cols"] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
  ];

  // ========================================
  // 행 높이
  // ========================================

  ws["!rows"] = data.map((_, index) => {
    if (index === 0) {
      return { hpt: 36 };
    }

    if (index === 3) {
      return { hpt: 25 };
    }

    return { hpt: 22 };
  });

  // ========================================
  // 공통 스타일
  // ========================================

  const range = XLSX.utils.decode_range(
    ws["!ref"] || "A1:D1",
  );

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({
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

  // ========================================
  // 제목
  // ========================================

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

  // ========================================
  // 기본정보 라벨
  // ========================================

  ["A2", "C2", "A3"].forEach((address) => {
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
  });

  // ========================================
  // 예약 표 헤더
  // ========================================

  for (let col = 0; col <= 3; col++) {
    const address = XLSX.utils.encode_cell({
      r: 3,
      c: col,
    });

    ws[address].s = {
      ...ws[address].s,

      font: {
        name: "맑은 고딕",
        sz: 10,
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
    };
  }

  // ========================================
  // 예약자 행
  // ========================================

  const actualRowCount = Math.max(rows.length, 1);

  for (let i = 0; i < actualRowCount; i++) {
    const excelRow = 4 + i;

    const nameCell = XLSX.utils.encode_cell({
      r: excelRow,
      c: 0,
    });

    if (ws[nameCell]) {
      ws[nameCell].s = {
        ...ws[nameCell].s,

        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }
  }

  // ========================================
  // 금액 셀
  // ========================================

  Object.keys(ws).forEach((key) => {
    if (key.startsWith("!")) return;

    const cell = ws[key];

    if (cell && typeof cell.v === "number") {
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

  // ========================================
  // 예약 합계 강조
  // ========================================

  for (let col = 0; col <= 3; col++) {
    const address = XLSX.utils.encode_cell({
      r: reservationTotalRow,
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
    };
  }

  // ========================================
  // 여행자보험료
  // ========================================

  for (let col = 0; col <= 3; col++) {
    const address = XLSX.utils.encode_cell({
      r: insuranceRow,
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
          rgb: "FFF2CC",
        },
      },
    };
  }

  // ========================================
  // 최종 합계
  // ========================================

  [totalSalesRow, totalExpenseRow].forEach((row) => {
    for (let col = 0; col <= 3; col++) {
      const address = XLSX.utils.encode_cell({
        r: row,
        c: col,
      });

      ws[address].s = {
        ...ws[address].s,

        font: {
          name: "맑은 고딕",
          sz: 11,
          bold: true,
        },

        fill: {
          fgColor: {
            rgb: "F2F2F2",
          },
        },
      };
    }
  });

  // 최종수익 강조
  for (let col = 0; col <= 3; col++) {
    const address = XLSX.utils.encode_cell({
      r: finalProfitRow,
      c: col,
    });

    ws[address].s = {
      ...ws[address].s,

      font: {
        name: "맑은 고딕",
        sz: 12,
        bold: true,
      },

      fill: {
        fgColor: {
          rgb: "E2F0D9",
        },
      },
    };
  }

  // ========================================
  // A4 세로 1장 출력
  // ========================================

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

  ws["!printArea"] =
    `A1:D${finalProfitRow + 1}`;

  // ========================================
  // 파일 생성
  // ========================================

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "일자별 총 정산",
  );

  XLSX.writeFile(
    wb,
    `총정산_${productName}_${departureDate}.xlsx`,
  );
}