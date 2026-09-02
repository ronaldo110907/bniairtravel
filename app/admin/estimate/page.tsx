"use client";

import { Fragment, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { estimateProducts } from "@/data/estimateProducts";

type EstimateMode = "product" | "free" | null;
type PriceMode = "combined" | "split";

type DayPlan = {
  id: string;
  region: string;
  transport: string;
  time: string;
  schedule: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  hotel: string;
};

function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function EstimatePage() {
  const [mode, setMode] = useState<EstimateMode>(null);
  const [priceMode, setPriceMode] = useState<PriceMode>("split");
  const estimateRef = useRef<HTMLDivElement>(null);

  const [showPreview, setShowPreview] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedStay, setSelectedStay] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [form, setForm] = useState({
    recipient: "",
    sender: "",
    sentDate: getToday(),

    productName: "",
    travelPeriod: "",

    // 견적 조건
    includes: "",
    excludes: "",
    shopping: "",
    options: "",
    remarks: "",

    combinedPrice: "",
    combinedCurrency: "KRW",

    airfare: "",
    airfareCurrency: "KRW",

    landCost: "",
    landCurrency: "USD",
  });

  const [days, setDays] = useState<DayPlan[]>([
    {
      id: "day-1",
      region: "",
      transport: "",
      time: "",
      schedule: "",
      breakfast: "",
      lunch: "",
      dinner: "",
      hotel: "",
    },
  ]);

  function updateForm(key: keyof typeof form, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const airfareNumber = Number(form.airfare || 0);
  const landCostNumber = Number(form.landCost || 0);

  const canShowSplitTotal =
    form.airfareCurrency === form.landCurrency &&
    (airfareNumber > 0 || landCostNumber > 0);

  const splitTotal = airfareNumber + landCostNumber;

  function addDay() {
    setDays((prev) => [
      ...prev,
      {
        id: `day-${Date.now()}`,
        region: "",
        transport: "",
        time: "",
        schedule: "",
        breakfast: "",
        lunch: "",
        dinner: "",
        hotel: "",
      },
    ]);
  }

  function updateDay(
    id: string,
    key: keyof Omit<DayPlan, "id">,
    value: string,
  ) {
    setDays((prev) =>
      prev.map((day) =>
        day.id === id
          ? {
              ...day,
              [key]: value,
            }
          : day,
      ),
    );
  }

  function deleteDay(id: string) {
    if (days.length === 1) {
      alert("일정은 최소 1일 이상 필요합니다.");
      return;
    }

    setDays((prev) => prev.filter((day) => day.id !== id));
  }

  function formatEstimateDate(value: string) {
    if (!value) return "";

    const [year, month, day] = value.split("-");

    return `${year}년 ${month}월 ${day}일`;
  }

  function formatMoney(value: string, currency: string) {
    if (!value) return "";

    const number = Number(value);

    const formatted = Number.isNaN(number)
      ? value
      : number.toLocaleString("ko-KR");

    if (currency === "KRW") {
      return `${formatted}원`;
    }

    if (currency === "USD") {
      return `$${formatted}`;
    }

    if (currency === "CNY") {
      return `¥${formatted}`;
    }

    return formatted;
  }

  const handlePrint = useReactToPrint({
    contentRef: estimateRef,

    documentTitle: `BNI_견적서_${form.productName || "Estimate"}`,

    pageStyle: `
    @page {
      size: A4 portrait;
      margin: 0;
    }

    @media print {
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .estimate-print-page {
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        padding: 6mm !important;
        box-sizing: border-box !important;
        box-shadow: none !important;
        background: #ffffff !important;
      }

      tr {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}

thead {
  display: table-header-group !important;
}
    }
  `,
  });

  const regions = Array.from(
    new Set(estimateProducts.map((product) => product.region)),
  );

  const stays = selectedRegion
    ? Array.from(
        new Set(
          estimateProducts
            .filter((product) => product.region === selectedRegion)
            .map((product) => product.stay),
        ),
      )
    : [];

  const productsByStay =
    selectedRegion && selectedStay
      ? estimateProducts.filter(
          (product) =>
            product.region === selectedRegion && product.stay === selectedStay,
        )
      : [];

  const types = Array.from(
    new Set(
      productsByStay
        .map((product) => product.type)
        .filter((type): type is string => Boolean(type)),
    ),
  );

  const needsTypeSelection = types.length > 0;

  const selectedProduct = productsByStay.find((product) => {
    if (needsTypeSelection) {
      return product.type === selectedType;
    }

    return true;
  });

  function loadSelectedProduct() {
    if (!selectedProduct) {
      alert("불러올 상품을 먼저 선택해주세요.");
      return;
    }

    setForm((prev) => ({
      ...prev,

      productName: selectedProduct.productName,
      travelPeriod: selectedProduct.travelPeriod,

      includes: selectedProduct.includes,
      excludes: selectedProduct.excludes,

      shopping: selectedProduct.shopping,
      options: selectedProduct.options,
      remarks: selectedProduct.remarks,
    }));

    setDays(
      selectedProduct.days.map((day) => ({
        ...day,
      })),
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* 제목 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">📄 견적서 만들기</h1>

        <p className="mt-2 text-sm text-gray-500">
          등록 상품의 일정을 불러오거나 자유롭게 견적서를 작성합니다.
        </p>
      </div>

      {/* 견적 유형 선택 */}
      <div className="grid gap-5 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("product")}
          className={`rounded-2xl border bg-white p-7 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            mode === "product"
              ? "border-blue-500 ring-2 ring-blue-100"
              : "border-gray-200"
          }`}
        >
          <div className="text-3xl">🧳</div>

          <div className="mt-4 text-xl font-bold">등록 상품 불러오기</div>

          <div className="mt-2 text-sm leading-6 text-gray-500">
            홈페이지에 등록된 상품과 일정을 불러와
            <br />
            내용을 수정하여 견적서를 작성합니다.
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("free")}
          className={`rounded-2xl border bg-white p-7 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            mode === "free"
              ? "border-emerald-500 ring-2 ring-emerald-100"
              : "border-gray-200"
          }`}
        >
          <div className="text-3xl">✍️</div>

          <div className="mt-4 text-xl font-bold">자유 견적 작성</div>

          <div className="mt-2 text-sm leading-6 text-gray-500">
            홈페이지에 없는 지역이나 별도 상품을
            <br />빈 견적서에서 직접 작성합니다.
          </div>
        </button>
      </div>

      {mode && (
        <>
          {/* 선택 상태 */}
          <div
            className={`rounded-xl border px-5 py-4 text-sm font-semibold ${
              mode === "product"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {mode === "product"
              ? "🧳 등록 상품 견적서 작성"
              : "✍️ 자유 견적서 작성"}
          </div>

          {/* 등록 상품 불러오기 */}
          {mode === "product" && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold">🧳 상품 불러오기</h2>

                <p className="mt-1 text-sm text-gray-500">
                  지역과 일정을 선택하면 등록된 상품 내용을 견적서로 불러옵니다.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* 지역 */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    지역
                  </label>

                  <select
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setSelectedStay("");
                      setSelectedType("");
                    }}
                    className="w-full rounded-lg border bg-white px-3 py-3"
                  >
                    <option value="">지역 선택</option>

                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 박수 */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    일정 / 박수
                  </label>

                  <select
                    value={selectedStay}
                    disabled={!selectedRegion}
                    onChange={(e) => {
                      setSelectedStay(e.target.value);
                      setSelectedType("");
                    }}
                    className="w-full rounded-lg border bg-white px-3 py-3 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {selectedRegion
                        ? "박수 선택"
                        : "지역을 먼저 선택해주세요"}
                    </option>

                    {stays.map((stay) => (
                      <option key={stay} value={stay}>
                        {stay}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 상품 타입 - 필요한 경우에만 */}
                {needsTypeSelection && (
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      상품
                    </label>

                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full rounded-lg border bg-white px-3 py-3"
                    >
                      <option value="">상품 선택</option>

                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 선택 결과 */}
              {selectedProduct && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  선택 상품 :{" "}
                  <span className="font-bold">
                    {selectedProduct.productName}
                  </span>
                </div>
              )}

              {/* 불러오기 버튼 */}
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={loadSelectedProduct}
                  disabled={!selectedProduct}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  🧳 선택 상품 불러오기
                </button>
              </div>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold">📌 기본 정보</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  수신
                </label>

                <input
                  type="text"
                  value={form.recipient}
                  onChange={(e) => updateForm("recipient", e.target.value)}
                  placeholder="예: 000여행사 대표님"
                  className="w-full rounded-lg border px-3 py-3"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  발신
                </label>

                <select
                  value={form.sender}
                  onChange={(e) => updateForm("sender", e.target.value)}
                  className="w-full rounded-lg border bg-white px-3 py-3"
                >
                  <option value="">발신자 선택</option>
                  <option value="송선호 대표">송선호 대표</option>
                  <option value="정서인 실장">정서인 실장</option>
                  <option value="이민우 부장">이민우 부장</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  발송일
                </label>

                <input
                  type="date"
                  value={form.sentDate}
                  onChange={(e) => updateForm("sentDate", e.target.value)}
                  className="w-full rounded-lg border px-3 py-3"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  상품명
                </label>

                <input
                  type="text"
                  value={form.productName}
                  onChange={(e) => updateForm("productName", e.target.value)}
                  placeholder="예: [노팁/노옵션/품격] 연길/백두산 5일"
                  className="w-full rounded-lg border px-3 py-3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  여행기간
                </label>

                <input
                  type="text"
                  value={form.travelPeriod}
                  onChange={(e) => updateForm("travelPeriod", e.target.value)}
                  placeholder="예: 2027년 9월중 4박5일"
                  className="w-full rounded-lg border px-3 py-3"
                />
              </div>
            </div>
          </div>

          {/* 입금가 */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">💰 입금가</h2>

                <p className="mt-1 text-sm text-gray-500">
                  견적 성격에 따라 통합 금액 또는 항공료와 지상비를 나누어
                  입력합니다.
                </p>
              </div>

              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setPriceMode("combined")}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                    priceMode === "combined"
                      ? "bg-white text-blue-700 shadow"
                      : "text-gray-500"
                  }`}
                >
                  통합 입금가
                </button>

                <button
                  type="button"
                  onClick={() => setPriceMode("split")}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                    priceMode === "split"
                      ? "bg-white text-blue-700 shadow"
                      : "text-gray-500"
                  }`}
                >
                  항공료 + 지상비
                </button>
              </div>
            </div>

            {/* 통합 입금가 */}
            {priceMode === "combined" && (
              <div className="rounded-xl border bg-gray-50 p-5">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  입금가
                </label>

                <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
                  <input
                    type="number"
                    value={form.combinedPrice}
                    onChange={(e) =>
                      updateForm("combinedPrice", e.target.value)
                    }
                    placeholder="0"
                    className="w-full rounded-lg border bg-white px-3 py-3 text-right text-lg font-bold"
                  />

                  <select
                    value={form.combinedCurrency}
                    onChange={(e) =>
                      updateForm("combinedCurrency", e.target.value)
                    }
                    className="rounded-lg border bg-white px-3 py-3"
                  >
                    <option value="KRW">원</option>
                    <option value="USD">USD ($)</option>
                    <option value="CNY">CNY (¥)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 항공료 + 지상비 */}
            {priceMode === "split" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* 항공료 */}
                  <div className="rounded-xl border bg-blue-50 p-5">
                    <div className="mb-3 font-bold text-blue-900">
                      ✈️ 항공료
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                      <input
                        type="number"
                        value={form.airfare}
                        onChange={(e) => updateForm("airfare", e.target.value)}
                        placeholder="항공 별도인 경우 비워두세요"
                        className="w-full rounded-lg border bg-white px-3 py-3 text-right"
                      />

                      <select
                        value={form.airfareCurrency}
                        onChange={(e) =>
                          updateForm("airfareCurrency", e.target.value)
                        }
                        className="rounded-lg border bg-white px-3 py-3"
                      >
                        <option value="KRW">원</option>
                        <option value="USD">$</option>
                        <option value="CNY">¥</option>
                      </select>
                    </div>
                  </div>

                  {/* 지상비 */}
                  <div className="rounded-xl border bg-emerald-50 p-5">
                    <div className="mb-3 font-bold text-emerald-900">
                      🚌 지상비
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                      <input
                        type="number"
                        value={form.landCost}
                        onChange={(e) => updateForm("landCost", e.target.value)}
                        placeholder="지상비 입력"
                        className="w-full rounded-lg border bg-white px-3 py-3 text-right"
                      />

                      <select
                        value={form.landCurrency}
                        onChange={(e) =>
                          updateForm("landCurrency", e.target.value)
                        }
                        className="rounded-lg border bg-white px-3 py-3"
                      >
                        <option value="KRW">원</option>
                        <option value="USD">$</option>
                        <option value="CNY">¥</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 같은 통화일 때만 합계 */}
                {canShowSplitTotal && (
                  <div className="flex items-center justify-between rounded-xl bg-gray-900 px-5 py-4 text-white">
                    <span className="font-semibold">총 입금가</span>

                    <span className="text-xl font-bold">
                      {splitTotal.toLocaleString()}
                      {form.airfareCurrency === "KRW"
                        ? "원"
                        : form.airfareCurrency === "USD"
                          ? "$"
                          : "¥"}
                    </span>
                  </div>
                )}

                {form.airfareCurrency !== form.landCurrency &&
                  (form.airfare || form.landCost) && (
                    <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      항공료와 지상비의 통화가 달라 합계는 표시하지 않습니다.
                      PDF에는 각각의 금액으로 표시됩니다.
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* 견적 조건 */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold">📋 견적 조건</h2>

              <p className="mt-1 text-sm text-gray-500">
                거래처에 전달할 포함·불포함 및 기타 조건을 입력합니다.
              </p>
            </div>

            <div className="space-y-5">
              {/* 포함사항 */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  포함사항
                </label>

                <textarea
                  value={form.includes}
                  onChange={(e) => updateForm("includes", e.target.value)}
                  placeholder={`예:
왕복항공권, 호텔(2인1실), 전용차량
일정표상의 식사, 관광지 입장료, 현지가이드
기사/가이드 경비, 여행자보험`}
                  rows={5}
                  className="w-full resize-y rounded-lg border px-3 py-3 leading-6"
                />
              </div>

              {/* 불포함사항 */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  불포함사항
                </label>

                <textarea
                  value={form.excludes}
                  onChange={(e) => updateForm("excludes", e.target.value)}
                  placeholder={`예:
기타 개인경비, 매너팁
싱글룸차지`}
                  rows={4}
                  className="w-full resize-y rounded-lg border px-3 py-3 leading-6"
                />
              </div>

              {/* 쇼핑 / 옵션 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    쇼핑
                  </label>

                  <input
                    type="text"
                    value={form.shopping}
                    onChange={(e) => updateForm("shopping", e.target.value)}
                    placeholder="예: 노쇼핑 / 쇼핑 2회"
                    className="w-full rounded-lg border px-3 py-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    옵션
                  </label>

                  <input
                    type="text"
                    value={form.options}
                    onChange={(e) => updateForm("options", e.target.value)}
                    placeholder="예: 노옵션 / 선택관광 별도"
                    className="w-full rounded-lg border px-3 py-3"
                  />
                </div>
              </div>

              {/* 비고 */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  비고
                </label>

                <textarea
                  value={form.remarks}
                  onChange={(e) => updateForm("remarks", e.target.value)}
                  placeholder={`예:
* 수하물 : 기내 10kg / 위탁 15kg
* 환율은 1$ = 1,430원 기준
* 현지 및 항공 사정에 따라 일정이 변경될 수 있습니다.`}
                  rows={5}
                  className="w-full resize-y rounded-lg border px-3 py-3 leading-6"
                />
              </div>
            </div>
          </div>

          {/* 상세 일정표 */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">🗓️ 상세 일정표</h2>

                <p className="mt-1 text-sm text-gray-500">
                  일자별 지역, 교통, 일정, 식사와 호텔을 입력합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={addDay}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                + DAY 추가
              </button>
            </div>

            <div className="space-y-5">
              {days.map((day, index) => (
                <div
                  key={day.id}
                  className="overflow-hidden rounded-2xl border bg-gray-50"
                >
                  {/* DAY 제목 */}
                  <div className="flex items-center justify-between border-b bg-gray-900 px-5 py-3 text-white">
                    <div className="font-bold">DAY {index + 1}</div>

                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteDay(day.id)}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold hover:bg-red-600"
                      >
                        DAY 삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-5 p-5">
                    {/* 지역 / 교통 / 시간 */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          지역
                        </label>

                        <input
                          type="text"
                          value={day.region}
                          onChange={(e) =>
                            updateDay(day.id, "region", e.target.value)
                          }
                          placeholder="예: 연길 / 용정 / 이도백하"
                          className="w-full rounded-lg border bg-white px-3 py-3"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          교통
                        </label>

                        <input
                          type="text"
                          value={day.transport}
                          onChange={(e) =>
                            updateDay(day.id, "transport", e.target.value)
                          }
                          placeholder="예: 전용버스 / 항공"
                          className="w-full rounded-lg border bg-white px-3 py-3"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                          시간
                        </label>

                        <input
                          type="text"
                          value={day.time}
                          onChange={(e) =>
                            updateDay(day.id, "time", e.target.value)
                          }
                          placeholder="예: 전일 / 10:30"
                          className="w-full rounded-lg border bg-white px-3 py-3"
                        />
                      </div>
                    </div>

                    {/* 상세일정 */}
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        상세 일정
                      </label>

                      <textarea
                        value={day.schedule}
                        onChange={(e) =>
                          updateDay(day.id, "schedule", e.target.value)
                        }
                        placeholder={`예:
연길 국제공항 도착 후 가이드 미팅
중식 후 용정으로 이동
▶ 윤동주 시인 생가 방문
▶ 일송정 및 해란강 차창관광
석식 후 호텔 투숙 및 휴식`}
                        rows={8}
                        className="w-full resize-y rounded-lg border bg-white px-3 py-3 leading-7"
                      />
                    </div>

                    {/* 식사 */}
                    <div>
                      <div className="mb-2 text-sm font-semibold text-gray-700">
                        식사
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">
                            조식
                          </label>

                          <input
                            type="text"
                            value={day.breakfast}
                            onChange={(e) =>
                              updateDay(day.id, "breakfast", e.target.value)
                            }
                            placeholder="예: 호텔식"
                            className="w-full rounded-lg border bg-white px-3 py-3"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs text-gray-500">
                            중식
                          </label>

                          <input
                            type="text"
                            value={day.lunch}
                            onChange={(e) =>
                              updateDay(day.id, "lunch", e.target.value)
                            }
                            placeholder="예: 현지식"
                            className="w-full rounded-lg border bg-white px-3 py-3"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs text-gray-500">
                            석식
                          </label>

                          <input
                            type="text"
                            value={day.dinner}
                            onChange={(e) =>
                              updateDay(day.id, "dinner", e.target.value)
                            }
                            placeholder="예: 삼겹살 무제한"
                            className="w-full rounded-lg border bg-white px-3 py-3"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 호텔 */}
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        호텔
                      </label>

                      <input
                        type="text"
                        value={day.hotel}
                        onChange={(e) =>
                          updateDay(day.id, "hotel", e.target.value)
                        }
                        placeholder="예: 금수학호텔 ★★★★☆ 또는 동급"
                        className="w-full rounded-lg border bg-white px-3 py-3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* A4 미리보기 버튼 */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="rounded-xl bg-gray-900 px-6 py-3 font-bold text-white hover:bg-black"
            >
              📄 A4 견적서 미리보기
            </button>
          </div>
          {showPreview && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-6">
              <div className="relative">
                {/* 닫기 버튼 */}
                <div className="sticky top-0 z-10 mb-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
                  >
                    🖨️ 인쇄 / PDF 테스트
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-lg"
                  >
                    ✕ 미리보기 닫기
                  </button>
                </div>

                {/* 실제 A4 */}
                <div
                  ref={estimateRef}
                  className="
    estimate-print-page
    box-border
    min-h-[297mm]
    w-[210mm]
    bg-white
    p-[6mm]
    text-[10pt]
    leading-[1.25]
    text-gray-900
    shadow-2xl

    [&_table]:text-[10pt]
    [&_td]:text-[10pt]
    [&_th]:text-[10pt]
  "
                >
                  {/* BNI 머리말 */}
                  <img
                    src="/images/invoice/BNIheader.jpg"
                    alt="BNI Header"
                    className="mb-[3mm] block w-full"
                  />

                  {/* 견적서 제목 */}
                  <div className="mb-[3mm] border-b-2 border-gray-900 pb-[2mm] text-center">
                    <h1 className="text-[24px] font-black tracking-[0.45em]">
                      견 적 서
                    </h1>
                  </div>

                  {/* 수신 / 발신 */}
                  <div className="mb-[3mm] grid grid-cols-2 gap-[2mm] text-[11px]">
                    <div className="rounded-sm border border-gray-300 px-[3mm] py-[2mm]">
                      <span className="mr-2 font-bold">수신</span>
                      <span>{form.recipient || "수신처를 입력해주세요."}</span>
                    </div>

                    <div className="rounded-sm border border-gray-300 px-[3mm] py-[2mm] text-right">
                      <span className="mr-2 font-bold">발신</span>
                      <span>
                        {form.sender
                          ? `BNI항공 ${form.sender}`
                          : "발신자를 선택해주세요."}
                      </span>
                    </div>
                  </div>

                  {/* 발송일 */}
                  <div className="mb-[3mm] text-right text-[10px] text-gray-600">
                    {formatEstimateDate(form.sentDate)}
                  </div>

                  {/* 견적 금액 */}
                  <div className="mb-[3mm]">
                    <div className="mb-[1.5mm] text-[12px] font-black">
                      ■ 견적 금액
                    </div>

                    <table className="w-full table-fixed border-collapse text-[10px]">
                      <tbody>
                        {priceMode === "combined" && (
                          <tr>
                            <th className="w-[32mm] border border-gray-400 bg-gray-100 px-[2mm] py-[2mm] text-center font-bold">
                              입금가
                            </th>

                            <td className="border border-gray-400 px-[3mm] py-[2mm] text-right text-[12px] font-black">
                              {form.combinedPrice
                                ? formatMoney(
                                    form.combinedPrice,
                                    form.combinedCurrency,
                                  )
                                : "-"}
                            </td>
                          </tr>
                        )}

                        {priceMode === "split" && (
                          <>
                            {form.airfare && (
                              <tr>
                                <th className="w-[32mm] border border-gray-400 bg-gray-100 px-[2mm] py-[2mm] text-center font-bold">
                                  항공료
                                </th>

                                <td className="border border-gray-400 px-[3mm] py-[2mm] text-right font-bold">
                                  {formatMoney(
                                    form.airfare,
                                    form.airfareCurrency,
                                  )}
                                </td>
                              </tr>
                            )}

                            {form.landCost && (
                              <tr>
                                <th className="w-[32mm] border border-gray-400 bg-gray-100 px-[2mm] py-[2mm] text-center font-bold">
                                  지상비
                                </th>

                                <td className="border border-gray-400 px-[3mm] py-[2mm] text-right font-bold">
                                  {formatMoney(
                                    form.landCost,
                                    form.landCurrency,
                                  )}
                                </td>
                              </tr>
                            )}

                            {canShowSplitTotal && (
                              <tr>
                                <th className="border border-gray-500 bg-gray-800 px-[2mm] py-[2mm] text-center font-bold text-white">
                                  총 입금가
                                </th>

                                <td className="border border-gray-500 bg-gray-50 px-[3mm] py-[2mm] text-right text-[12px] font-black">
                                  {formatMoney(
                                    String(splitTotal),
                                    form.airfareCurrency,
                                  )}
                                </td>
                              </tr>
                            )}

                            {!form.airfare && !form.landCost && (
                              <tr>
                                <th className="w-[32mm] border border-gray-400 bg-gray-100 px-[2mm] py-[2mm] text-center font-bold">
                                  입금가
                                </th>

                                <td className="border border-gray-400 px-[3mm] py-[2mm] text-right">
                                  -
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 포함 / 불포함 */}
                  {(form.includes || form.excludes) && (
                    <div className="mb-[2mm] grid grid-cols-2 gap-[2mm] text-[10px] leading-[1.35]">
                      {/* 포함사항 */}
                      <div className="border border-gray-400">
                        <div className="border-b border-gray-400 bg-gray-100 px-[2mm] py-[1mm] font-bold">
                          포함사항
                        </div>

                        <div className="min-h-[12mm] whitespace-pre-line px-[2mm] py-[1.5mm]">
                          {form.includes || "-"}
                        </div>
                      </div>

                      {/* 불포함사항 */}
                      <div className="border border-gray-400">
                        <div className="border-b border-gray-400 bg-gray-100 px-[2mm] py-[1mm] font-bold">
                          불포함사항
                        </div>

                        <div className="min-h-[12mm] whitespace-pre-line px-[2mm] py-[1.5mm]">
                          {form.excludes || "-"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 쇼핑 / 옵션 */}
                  {(form.shopping || form.options) && (
                    <table className="mb-[2mm] w-full table-fixed border-collapse text-[7.5px]">
                      <tbody>
                        {form.shopping && (
                          <tr>
                            <th className="w-[22mm] border border-gray-400 bg-gray-100 px-[1.5mm] py-[1mm] text-center font-bold">
                              쇼핑
                            </th>

                            <td className="border border-gray-400 px-[2mm] py-[1mm]">
                              {form.shopping}
                            </td>
                          </tr>
                        )}

                        {form.options && (
                          <tr>
                            <th className="border border-gray-400 bg-gray-100 px-[1.5mm] py-[1mm] text-center font-bold">
                              옵션
                            </th>

                            <td className="border border-gray-400 px-[2mm] py-[1mm]">
                              {form.options}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* 상세 일정 */}
                  <div className="mb-[2mm]">
                    <div className="mb-[1mm] text-[10px] font-black">
                      ■ 상세 일정
                    </div>

                    <table className="w-full table-fixed border-collapse text-[10pt] leading-[1.25]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="w-[13mm] border border-gray-500 px-[1mm] py-[1mm]">
                            일자
                          </th>

                          <th className="w-[15mm] border border-gray-500 px-[1mm] py-[1mm]">
                            지역
                          </th>

                          <th className="w-[16mm] border border-gray-500 px-[1mm] py-[1mm]">
                            교통/시간
                          </th>

                          <th className="border border-gray-500 px-[1mm] py-[1mm]">
                            상세일정
                          </th>

                          <th className="w-[37mm] border border-gray-500 px-[1mm] py-[1mm] text-center">
                            식사
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {days.map((day, index) => (
                          <Fragment key={day.id}>
                            {/* DAY 일정 본문 */}
                            <tr>
                              {/* DAY */}
                              <td
                                rowSpan={day.hotel ? 2 : 1}
                                className="w-[13mm] border border-gray-400 px-[1mm] py-[1.2mm] text-center align-top font-bold"
                              >
                                DAY
                                <br />
                                {index + 1}
                              </td>

                              {/* 지역 */}
                              <td className="w-[15mm] whitespace-pre-line border border-gray-400 px-[1mm] py-[1.2mm] align-top">
                                {day.region || "-"}
                              </td>

                              {/* 교통 / 시간 */}
                              <td className="w-[16mm] border border-gray-400 px-[1mm] py-[1.2mm] align-top">
                                {day.transport && <div>{day.transport}</div>}

                                {day.time && (
                                  <div className="mt-[0.5mm]">{day.time}</div>
                                )}

                                {!day.transport && !day.time && "-"}
                              </td>

                              {/* 상세일정 */}
                              <td className="whitespace-pre-line border border-gray-400 px-[1.5mm] py-[1.2mm] align-top">
                                {day.schedule || "-"}
                              </td>

                              {/* 식사 */}
                              <td className="w-[37mm] border border-gray-400 px-[1mm] py-[1.2mm] text-center align-middle">
                                {day.breakfast && (
                                  <div>
                                    <span className="font-bold">조</span>{" "}
                                    {day.breakfast}
                                  </div>
                                )}

                                {day.lunch && (
                                  <div>
                                    <span className="font-bold">중</span>{" "}
                                    {day.lunch}
                                  </div>
                                )}

                                {day.dinner && (
                                  <div>
                                    <span className="font-bold">석</span>{" "}
                                    {day.dinner}
                                  </div>
                                )}

                                {!day.breakfast &&
                                  !day.lunch &&
                                  !day.dinner &&
                                  "-"}
                              </td>
                            </tr>

                            {/* 호텔 - DAY 맨 아래 별도 줄 */}
                            {day.hotel && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="border border-gray-400 bg-gray-50 px-[2mm] py-[1.2mm]"
                                >
                                  <span className="mr-[2mm] font-bold">
                                    HOTEL
                                  </span>

                                  {day.hotel}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 비고 */}
                  {form.remarks && (
                    <div className="mb-[2mm] border border-gray-400 text-[7px] leading-[1.3]">
                      <div className="border-b border-gray-400 bg-gray-100 px-[2mm] py-[1mm] font-bold">
                        비고
                      </div>

                      <div className="whitespace-pre-line px-[2mm] py-[1.5mm]">
                        {form.remarks}
                      </div>
                    </div>
                  )}

                  {/* 하단 안내 */}
                  <div className="mt-[2mm] border-t border-gray-500 pt-[1.5mm] text-center text-[6.5px] text-gray-600">
                    상기 일정은 현지 및 항공 사정에 따라 변경될 수 있습니다.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
