"use client";

import { useState } from "react";

type Reservation = {
  id: string | number;
  name: string;
  phone: string;
  product: string;
  departure_date: string;
  departure_id?: string | number | null;
  people?: any[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
};

function ContractCheck({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);

  return (
    <label className="inline-flex cursor-pointer items-center gap-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="h-3 w-3"
      />
      <span>{label}</span>
    </label>
  );
}

export default function TravelContractModal({
  open,
  onClose,
  reservation,
}: Props) {
  const [unitPrice, setUnitPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [balanceDate, setBalanceDate] = useState("");
  const [account, setAccount] = useState("");
  const [departureInfo, setDepartureInfo] = useState("");
  const [arrivalInfo, setArrivalInfo] = useState("");
  const [transport, setTransport] = useState("항공기");
  const [contractDate, setContractDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  function printContract() {
    const contract = document.getElementById("travel-contract-print");

    if (!contract) {
      alert("계약서 영역을 찾을 수 없습니다.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=1200");

    if (!printWindow) {
      alert("팝업이 차단되었습니다. 팝업을 허용해주세요.");
      return;
    }

    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");

    printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <title>국외여행 계약서</title>

        <style>
          ${styles}
          
          @page {
            size: A4 portrait;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

         #print-page {
  width: 210mm;
  height: 297mm;
  overflow: hidden;
  background: white;
  padding: 8mm;
  margin: 0 auto;
}

#print-content {
  width: 194mm;
  margin: 0 auto;
  padding: 0;
}

          table {
            width: 100%;
            border-collapse: collapse;
          }

          input {
            border: 0;
            background: transparent;
          }

          @media print {
            html,
            body {
              width: 210mm;
              height: 297mm;
              overflow: hidden;
            }

            #print-page {
             margin: 0 auto;
            }
          }
        </style>
      </head>

      <body>
        <div id="print-page">
          <div id="print-content">
            ${contract.innerHTML}
          </div>
        </div>

        <script>
  window.onload = function () {
    const page = document.getElementById("print-page");
    const content = document.getElementById("print-content");

    if (!page || !content) return;

    const availableHeight = page.clientHeight - 20;
    const contentHeight = content.scrollHeight;

    let scale = availableHeight / contentHeight;

    if (scale > 1) {
      scale = 1;
    }

    content.style.zoom = String(scale);

    setTimeout(function () {
      window.print();
    }, 500);
  };
</script>
      </body>
    </html>
  `);

    printWindow.document.close();
  }

  if (!open || !reservation) return null;

  const peopleCount = reservation.people?.length ?? 0;

  const totalPrice = Number(unitPrice || 0) * peopleCount;

  const balance = Math.max(totalPrice - Number(deposit || 0), 0);

  const thClass =
    "border border-black bg-gray-50 px-2 py-2 text-center font-bold align-middle";

  const tdClass = "border border-black px-2 py-2 align-middle";

  const inputClass = "w-full min-w-0 bg-transparent outline-none";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 p-4">
      <div
        className="
          mx-auto
          flex
          max-h-[95vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* 상단 */}
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            bg-white
            px-6
            py-4
          "
        >
          <div>
            <h2 className="text-xl font-black">📑 국외여행 계약서</h2>

            <p className="mt-1 text-sm text-gray-500">
              {reservation.name} · {reservation.product}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={printContract}
              className="
      rounded-xl
      bg-blue-600
      px-4
      py-2
      font-bold
      text-white
      transition
      hover:bg-blue-700
    "
            >
              🖨️ 계약서 인쇄
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
      rounded-xl
      border
      px-4
      py-2
      font-bold
    "
            >
              ✕ 닫기
            </button>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto p-6">
          {/* A4 */}
          <div
            id="travel-contract-print"
            className="
              mx-auto
              min-h-[1120px]
              w-full
              max-w-[794px]
              bg-white
              p-8
              text-black
              shadow
            "
          >
            <h1 className="text-center text-2xl font-black">
              국외여행 계약서(여행자용)
            </h1>

            <div className="mt-6 text-[11px] leading-5">
              <p>
                여행사와 여행자는 아래와 같이 (□ 기획, □ 희망)여행 계약을
                체결하고 계약서와 여행약관·여행일정표 (또는 여행설명서)를
                교부한다.
              </p>

              <p className="mt-2 text-[10px]">
                ※ 해당란에 기록하거나 ☑로 표기, ( )는 선택입니다.
              </p>
            </div>

            {/* 계약서 본문 */}
            <table
              className="
                mt-4
                w-full
                table-fixed
                border-collapse
                border
                border-black
                text-[10px]
                leading-4
              "
            >
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[22%]" />
                <col className="w-[14%]" />
                <col className="w-[36%]" />
              </colgroup>

              <tbody>
                {/* 상품명 / 여행기간 */}
                <tr>
                  <th colSpan={2} className={thClass}>
                    여행상품명
                  </th>

                  <td className={tdClass}>{reservation.product}</td>

                  <th className={thClass}>여행기간</th>

                  <td className={tdClass}>
                    <div className="flex items-center gap-1">
                      <span className="whitespace-nowrap">
                        {reservation.departure_date}
                      </span>

                      <span>~</span>

                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="min-w-0 flex-1 bg-transparent outline-none"
                      />
                    </div>
                  </td>
                </tr>

                {/* 보험가입 */}
                <tr>
                  <th colSpan={2} className={thClass}>
                    보험가입 등
                  </th>

                  <td colSpan={3} className={tdClass}>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                      <ContractCheck label="영업보증" />
                      <ContractCheck label="공제" />
                      <ContractCheck label="예치금" />
                    </div>
                  </td>
                </tr>

                {/* 여행자 보험 */}
                <tr>
                  <th colSpan={2} className={thClass}>
                    여행자 보험
                  </th>

                  <td colSpan={3} className={tdClass}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>보험 가입</span>
                      <ContractCheck label="여" />
                      <ContractCheck label="부" />

                      <span className="ml-3">보험회사 :</span>

                      <input
                        type="text"
                        placeholder="보험회사 입력"
                        className="min-w-[160px] flex-1 border-b border-gray-400 bg-transparent outline-none"
                      />
                    </div>
                  </td>
                </tr>

                {/* 인원 / 지역 */}
                <tr>
                  <th colSpan={2} className={thClass}>
                    여행인원
                  </th>

                  <td className={tdClass}>{peopleCount}명</td>

                  <th className={thClass}>여행지역</th>

                  <td className={tdClass}>* 여행 일정표 참조</td>
                </tr>

                {/* 여행요금 1 */}
                <tr>
                  <th rowSpan={3} className={thClass}>
                    여행요금
                  </th>

                  <th className={thClass}>1인당</th>

                  <td className={tdClass}>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        placeholder="0"
                        className={`${inputClass} text-right`}
                      />
                      <span className="shrink-0">원</span>
                    </div>
                  </td>

                  <th className={thClass}>총액</th>

                  <td className={`${tdClass} text-right font-bold`}>
                    {totalPrice.toLocaleString()}원
                  </td>
                </tr>

                {/* 여행요금 2 */}
                <tr>
                  <th className={thClass}>계약금</th>

                  <td className={tdClass}>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={deposit}
                        onChange={(e) => setDeposit(e.target.value)}
                        placeholder="0"
                        className={`${inputClass} text-right`}
                      />
                      <span className="shrink-0">원</span>
                    </div>
                  </td>

                  <th className={thClass}>잔액</th>

                  <td className={`${tdClass} text-right font-bold`}>
                    {balance.toLocaleString()}원
                  </td>
                </tr>

                {/* 여행요금 3 */}
                <tr>
                  <th className={thClass}>잔액 완납일</th>

                  <td className={tdClass}>
                    <input
                      type="date"
                      value={balanceDate}
                      onChange={(e) => setBalanceDate(e.target.value)}
                      className={inputClass}
                    />
                  </td>

                  <th className={thClass}>계좌번호</th>

                  <td className={tdClass}>
                    <input
                      type="text"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder="계좌번호 입력"
                      className={inputClass}
                    />
                  </td>
                </tr>

                {/* 출발 */}
                <tr>
                  <th rowSpan={2} className={thClass}>
                    출발(도착)
                    <br />
                    일·시 및 장소
                  </th>

                  <th className={thClass}>출발</th>

                  <td className={tdClass}>
                    <input
                      type="text"
                      value={departureInfo}
                      onChange={(e) => setDepartureInfo(e.target.value)}
                      placeholder="예) 2026.11.11 08:00 청주공항"
                      className={inputClass}
                    />
                  </td>

                  <th rowSpan={2} className={thClass}>
                    교통수단
                  </th>

                  <td rowSpan={2} className={tdClass}>
                    <input
                      type="text"
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                      className={inputClass}
                    />
                  </td>
                </tr>

                {/* 도착 */}
                <tr>
                  <th className={thClass}>도착</th>

                  <td className={tdClass}>
                    <input
                      type="text"
                      value={arrivalInfo}
                      onChange={(e) => setArrivalInfo(e.target.value)}
                      placeholder="예) 2026.11.15 18:00 청주공항"
                      className={inputClass}
                    />
                  </td>
                </tr>

                {/* 숙박 */}
                <tr>
                  <th className={thClass}>숙박시설</th>

                  <td colSpan={4} className={tdClass}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <ContractCheck label="관광호텔" />
                      <ContractCheck label="일반호텔" />
                      <ContractCheck label="기타" />

                      <span className="ml-2">1실 투숙인원 : ______ 명</span>
                    </div>
                  </td>
                </tr>

                {/* 식사 */}
                <tr>
                  <th className={thClass}>식사회수</th>

                  <td colSpan={4} className={tdClass}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <ContractCheck label="일정표에 표시" />

                      <span>조식 (　)회</span>
                      <span>중식 (　)회</span>
                      <span>석식 (　)회</span>
                    </div>
                  </td>
                </tr>

                {/* 인솔자 */}
                <tr>
                  <th className={thClass}>여행인솔자</th>

                  <td className={tdClass}>
                    <div className="flex gap-3">
                      <ContractCheck label="유" />
                      <ContractCheck label="무" />
                    </div>
                  </td>

                  <th className={thClass}>현지 안내원</th>

                  <td colSpan={2} className={tdClass}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <ContractCheck label="유" />
                      <ContractCheck label="무" />
                      <span>* 일정표 참조</span>
                    </div>
                  </td>
                </tr>

                {/* 현지교통 */}
                <tr>
                  <th className={thClass}>현지교통</th>

                  <td className={tdClass}>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <ContractCheck label="버스" />
                      <ContractCheck label="승용차" />
                      <ContractCheck label="기타" />
                    </div>
                  </td>

                  <th className={thClass}>현지 여행사</th>

                  <td colSpan={2} className={tdClass}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <ContractCheck label="유" />
                      <ContractCheck label="무" />
                      <span>* 일정표 참조</span>
                    </div>
                  </td>
                </tr>

                {/* 포함사항 제목 */}
                <tr>
                  <th rowSpan={2} className={thClass}>
                    여행요금
                    <br />
                    포함사항
                  </th>

                  <th colSpan={2} className={thClass}>
                    필수 항목
                  </th>

                  <th colSpan={2} className={thClass}>
                    기타 선택 항목
                  </th>
                </tr>

                {/* 포함사항 내용 */}
                <tr>
                  <td colSpan={2} className={`${tdClass} align-top leading-5`}>
                    <div className="flex flex-col items-start gap-1">
                      <ContractCheck label="항공기·선박·철도 등 운임" />
                      <ContractCheck label="숙박·식사료" />
                      <ContractCheck label="안내자 경비" />
                      <ContractCheck label="국내외 공항·항만세" />
                      <ContractCheck label="관광진흥개발기금" />
                      <ContractCheck label="제세금" />
                      <ContractCheck label="일정표내 관광지 입장료" />
                    </div>
                  </td>

                  <td colSpan={2} className={`${tdClass} align-top leading-5`}>
                    <div className="flex flex-col items-start gap-1">
                      <ContractCheck label="여권발급비" />
                      <ContractCheck label="비자발급비" />
                      <ContractCheck label="봉사료" />
                      <ContractCheck label="포터비" />
                      <ContractCheck label="여행보험료" />
                      <ContractCheck label="쇼핑" />
                      <ContractCheck label="선택관광" />
                      <ContractCheck label="기타" />
                    </div>
                  </td>
                </tr>

                {/* 기타사항 */}
                <tr>
                  <th className={thClass}>기타사항</th>

                  <td colSpan={4} className={tdClass}>
                    여권발급비 __________ 원 &nbsp;&nbsp;&nbsp;&nbsp; 비자발급비
                    __________ 원
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 계약 확인 */}
            <div className="mt-4 text-[10px] leading-5">
              <p>
                여행사와 여행자는 위 계약내용과 약관을 상호 성실히 이행 및
                준수할 것을 확인하며 아래와 같이 서명·날인한다.
              </p>

              <p className="mt-1">
                ※ 본 계약과 관련한 다툼이 있을 경우 관련 법령 및 여행약관에 따른
                절차에 의하여 처리할 수 있습니다.
              </p>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2 text-[11px]">
              <span>작성일 :</span>

              <input
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
                className="border-b border-gray-400 bg-transparent px-1 py-1 outline-none"
              />
            </div>

            {/* 서명 영역 */}
            <table
              className="
                mt-3
                w-full
                table-fixed
                border-collapse
                border
                border-black
                text-[10px]
              "
            >
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[68%]" />
              </colgroup>

              <tbody>
                {/* 여행업자 */}
                <tr>
                  <th rowSpan={5} className={thClass}>
                    여행업자
                  </th>

                  <th className={thClass}>상호</th>

                  <td className={tdClass}>
                    __________________________________________
                  </td>
                </tr>

                <tr>
                  <th className={thClass}>주소</th>

                  <td className={tdClass}>
                    __________________________________________
                  </td>
                </tr>

                <tr>
                  <th className={thClass}>대표자</th>

                  <td className={tdClass}>
                    ______________________________ (인)
                  </td>
                </tr>

                <tr>
                  <th className={thClass}>전화</th>

                  <td className={tdClass}>
                    __________________________________________
                  </td>
                </tr>

                <tr>
                  <th className={thClass}>
                    등록번호 /
                    <br />
                    담당자
                  </th>

                  <td className={tdClass}>
                    등록번호 ____________________ &nbsp;&nbsp;&nbsp; 담당자
                    ____________________ (인)
                  </td>
                </tr>

                {/* 여행자 */}
                <tr>
                  <th rowSpan={3} className={thClass}>
                    여행자
                  </th>

                  <th className={thClass}>이름</th>

                  <td className={tdClass}>
                    <div className="flex justify-between gap-4">
                      <span>{reservation.name}</span>
                      <span>(서명) ____________________</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <th className={thClass}>전화</th>

                  <td className={tdClass}>{reservation.phone}</td>
                </tr>

                <tr>
                  <th className={thClass}>주소</th>

                  <td className={tdClass}>
                    __________________________________________
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
