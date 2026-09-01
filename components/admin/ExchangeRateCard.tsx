"use client";

import { useEffect, useMemo, useState } from "react";

type Currency = "USD" | "CNY" | "JPY";

type ExchangeRateResponse = {
  success: boolean;
  date?: string;
  rates?: Record<Currency, number>;
  error?: string;
};

export default function ExchangeRateCard({ today }: { today: string }) {
  const [rates, setRates] = useState<Record<Currency, number> | null>(null);
  const [rateDate, setRateDate] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadRates() {
    try {
      const response = await fetch("/api/exchange-rates", {
        cache: "no-store",
      });

      const data: ExchangeRateResponse = await response.json();

      if (!response.ok || !data.success || !data.rates) {
        throw new Error(data.error || "환율 조회 실패");
      }

      setRates(data.rates);
      setRateDate(data.date ?? "");
    } catch (error) {
      console.error("EXCHANGE RATE LOAD ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRates();

    const timer = window.setInterval(
      () => {
        void loadRates();
      },
      60 * 60 * 1000,
    );

    return () => window.clearInterval(timer);
  }, []);

  const calculatedWon = useMemo(() => {
    if (!rates || !amount) return 0;

    const numberAmount = Number(amount.replace(/,/g, ""));

    if (!Number.isFinite(numberAmount)) return 0;

    return numberAmount * rates[currency];
  }, [amount, currency, rates]);

  const currencyInfo = {
    USD: {
      flag: "🇺🇸",
      name: "달러",
    },
    CNY: {
      flag: "🇨🇳",
      name: "위안",
    },
    JPY: {
      flag: "🇯🇵",
      name: "엔",
    },
  };

  return (
    <div className="w-full max-w-[520px] rounded-xl border bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-bold text-gray-900">💱 기준 환율</div>

          <div className="mt-1 text-xs text-gray-400">
            📅 {today}
            {rateDate && ` · 환율 기준 ${rateDate}`}
          </div>
        </div>

        <div className="text-xs text-gray-400">1시간 자동갱신</div>
      </div>

      {loading ? (
        <div className="mt-4 text-sm text-gray-400">
          환율을 불러오는 중입니다...
        </div>
      ) : rates ? (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["USD", "CNY", "JPY"] as Currency[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  currency === code
                    ? "border-blue-400 bg-blue-50"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="text-xs font-semibold text-gray-500">
                  {currencyInfo[code].flag} {code}
                </div>

                <div className="mt-1 whitespace-nowrap text-sm font-bold text-gray-900">
                  {rates[code].toLocaleString("ko-KR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  원
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              <option value="USD">USD 달러</option>
              <option value="CNY">CNY 위안</option>
              <option value="JPY">JPY 엔</option>
            </select>

            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="금액 입력"
              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
            />

            <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white">
              ₩ {Math.round(calculatedWon).toLocaleString("ko-KR")}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 text-sm text-red-500">
          환율 정보를 불러오지 못했습니다.
        </div>
      )}
    </div>
  );
}
