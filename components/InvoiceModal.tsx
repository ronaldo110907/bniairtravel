"use client";

import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import CancellationSection from "@/components/sections/CancellationSection";

type ReservationPeople = {
  id: string;
};

type Reservation = {
  name: string;
  product: string;
  departure_date: string;
  people?: ReservationPeople[];
  departure_price?: number;
  departure_id: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
};

const accounts = [
  {
    label: "전세기계좌",
    name: "신한은행",
    number: "110-499-221610",
    owner: "비엔아이항공여행",
  },
  {
    label: "개인계좌",
    name: "신한은행",
    number: "618-04-268807",
    owner: "송선호",
  },
  {
    label: "사업자계좌",
    name: "신한은행",
    number: "100-028-911100",
    owner: "비엔아이항공여행",
  },
];

function formatMoney(value: string) {
  const numbers = value.replace(/[^\d]/g, "");

  if (!numbers) return "";

  return Number(numbers).toLocaleString();
}

function parseMoney(value: string) {
  return Number(value.replaceAll(",", "")) || 0;
}

export default function InvoiceModal({ open, onClose, reservation }: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [sender, setSender] = useState("이민우 부장");
  const [receiver, setReceiver] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [commission, setCommission] = useState("");

  const [invoiceType, setInvoiceType] = useState<"deposit" | "balance">(
    "deposit",
  );
  const [account, setAccount] = useState("전세기계좌");

  const peopleCount = reservation?.people?.length ?? 0;
  const totalAmount = (reservation?.departure_price ?? 0) * peopleCount;
  const enteredTotalPrice = parseMoney(totalPrice);
  const enteredDeposit = parseMoney(deposit);
  const enteredCommission = parseMoney(commission);

  const balance = Math.max(
    enteredTotalPrice - enteredDeposit - enteredCommission,
    0,
  );

  const amountToPay = invoiceType === "deposit" ? enteredDeposit : balance;

  const today = new Date().toISOString().split("T")[0];
  const selectedAccount =
    accounts.find((item) => item.label === account) ?? accounts[0];

  useEffect(() => {
    setTotalPrice(totalAmount.toLocaleString());
    setDeposit("");
    setCommission("");
  }, [totalAmount, reservation?.departure_id]);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `BNI_Invoice_${reservation?.name ?? ""}`,
    pageStyle: `
  @page {
    size: A4 portrait;
    margin: 6mm;
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

    .invoice-page {
      width: 100% !important;
      max-width: none !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      zoom: 0.78;
    }

    .invoice-box,
    table,
    tbody,
    tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    input {
      color: #111827 !important;
      background: transparent !important;
    }

    .print-page-break{
      break-before: page;
      page-break-before: always;
    }
  }
`,
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const printInvoice = async () => {
    setIsPrinting(true);

    setTimeout(async () => {
      await handlePrint();

      setTimeout(() => {
        setIsPrinting(false);
      }, 300);
    }, 50);
  };

  if (!open || !reservation) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-2xl font-bold">📄 인보이스 생성</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2"
          >
            닫기
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div ref={invoiceRef} className="invoice-page bg-white p-6">
            <img
              src="/images/invoice/BNIheader.jpg"
              alt="Header"
              className="mb-8 w-full"
            />

            <div className="mx-auto mb-8 w-fit bg-gray-200 px-10 py-2">
              <h2 className="text-4xl font-light tracking-[0.4em]">
                청 구 서 (INVOICE)
              </h2>
            </div>

            <div className="space-y-3 text-lg">
              <div className="flex items-center">
                <span className="w-24">▶ 수 신</span>

                <input
                  value={receiver}
                  onChange={(event) => setReceiver(event.target.value)}
                  className="flex-1 border-b border-gray-400 bg-transparent outline-none"
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="w-20 font-semibold">▶ 발신</span>

                <span className="font-medium">B.N.I(비엔아이)항공여행</span>

                {isPrinting ? (
                  <span className="rounded-lg px-3 py-2 font-medium">
                    {sender}
                  </span>
                ) : (
                  <select
                    value={sender}
                    onChange={(event) => setSender(event.target.value)}
                    className="rounded-lg border px-3 py-2"
                  >
                    <option>송선호 대표</option>
                    <option>정서인 실장</option>
                    <option>이민우 부장</option>
                  </select>
                )}
              </div>

              <div className="flex items-center">
                <span className="w-24">▶ 발신일</span>

                <input
                  type="date"
                  value={today}
                  readOnly
                  className="flex-1 border-b border-gray-400 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="invoice-box mt-6 rounded-lg border border-gray-300">
              <div className="border-b bg-gray-50 px-4 py-2 font-bold">
                예약정보
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-y-3 p-4 text-sm">
                <div className="font-semibold text-gray-600">예약자</div>
                <div>{reservation.name}</div>

                <div className="font-semibold text-gray-600">상품</div>
                <div>{reservation.product}</div>

                <div className="font-semibold text-gray-600">출발일</div>
                <div>{reservation.departure_date}</div>

                <div className="font-semibold text-gray-600">인원</div>
                <div>{peopleCount}명</div>
              </div>
            </div>

            <div className="invoice-box mt-6 rounded-lg border border-gray-300">
              <div className="border-b bg-gray-50 px-4 py-2 font-bold">
                청구구분
              </div>

              <div className="flex gap-3 p-4">
                <button
                  type="button"
                  onClick={() => setInvoiceType("deposit")}
                  className={`rounded-lg px-5 py-2 font-semibold ${
                    invoiceType === "deposit"
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white"
                  }`}
                >
                  계약금 청구
                </button>

                <button
                  type="button"
                  onClick={() => setInvoiceType("balance")}
                  className={`rounded-lg px-5 py-2 font-semibold ${
                    invoiceType === "balance"
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white"
                  }`}
                >
                  잔금 청구
                </button>
              </div>
            </div>

            <div className="invoice-box mt-6 rounded-lg border border-gray-300">
              <div className="border-b bg-gray-50 px-4 py-2 font-bold">
                청구금액
              </div>

              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="w-40 bg-gray-50 px-4 py-3 font-semibold">
                      여행경비
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          value={totalPrice}
                          onChange={(event) =>
                            setTotalPrice(formatMoney(event.target.value))
                          }
                          className="w-56 rounded-md border border-gray-300 px-3 py-2 text-right outline-none"
                        />
                        <span className="font-medium">원</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="border-b">
                    <td className="bg-gray-50 px-4 py-3 font-semibold">
                      계약금
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          value={deposit}
                          onChange={(event) =>
                            setDeposit(formatMoney(event.target.value))
                          }
                          className="w-56 rounded-md border border-gray-300 px-3 py-2 text-right outline-none"
                        />
                        <span className="font-medium">원</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 px-4 py-3 font-semibold">
                      커미션
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          value={commission}
                          onChange={(event) =>
                            setCommission(formatMoney(event.target.value))
                          }
                          className="w-56 rounded-md border border-gray-300 px-3 py-2 text-right outline-none"
                        />
                        <span className="font-medium">원</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-yellow-50 px-4 py-4 text-lg font-bold">
                      {invoiceType === "deposit" ? "잔금" : "최종결제"}
                    </td>

                    <td className="px-4 py-4 text-right text-2xl font-bold text-gray-950">
                      {balance.toLocaleString()} 원
                    </td>
                  </tr>

                  <tr className="border-t">
                    <td className="bg-red-50 px-4 py-4 text-lg font-bold">
                      입금하실 금액
                    </td>

                    <td className="px-4 py-4 text-right text-2xl font-bold text-red-600">
                      {amountToPay.toLocaleString()} 원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="invoice-box mt-6 rounded-lg border border-gray-300">
              <div className="border-b bg-gray-50 px-4 py-2 font-bold">
                입금계좌
              </div>

              <div className="space-y-4 p-4">
                {!isPrinting && (
                  <select
                    value={account}
                    onChange={(event) => setAccount(event.target.value)}
                    className="w-56 rounded-md border border-gray-300 px-3 py-2"
                  >
                    {accounts.map((item) => (
                      <option key={item.number} value={item.label}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-end justify-between rounded-lg bg-gray-50 p-4">
                  <div>
                    <div className="font-semibold">{selectedAccount.name}</div>

                    <div className="mt-2 text-2xl font-bold tracking-wider">
                      {selectedAccount.number}
                    </div>

                    <div className="mt-1 text-gray-600">
                      예금주 :{" "}
                      <span className="font-semibold">
                        {selectedAccount.owner}
                      </span>
                    </div>
                  </div>

                  <img
                    src="/images/invoice/BNIfooter.jpg"
                    alt="명판"
                    className="w-60"
                  />
                </div>
              </div>
            </div>

            <div className="print-page-break" />

            <div className="invoice-page bg-white p-6">
              <CancellationSection />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-center gap-3 border-t bg-gray-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border bg-white px-5 py-2"
          >
            닫기
          </button>

          <button
            type="button"
            onClick={printInvoice}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            인쇄&amp;저장
          </button>
        </div>
      </div>
    </div>
  );
}
