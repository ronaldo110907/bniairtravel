"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Payment = {
  id: number;
  payment_date: string;
  payment_type: string | null;
  amount: number | string | null;
  memo: string | null;
};

export default function ReservationPayments({ reservationId }: { reservationId: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const request = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError(false);
    try {
      const rows: Payment[] = [];
      // Read every payment, including reservations exceeding the API page limit.
      for (let offset = 0; ; offset += 500) {
        const { data, error: queryError } = await supabase
          .from("reservation_payments")
          .select("id,payment_date,payment_type,amount,memo")
          .eq("reservation_id", reservationId)
          .order("payment_date", { ascending: true })
          .order("created_at", { ascending: true })
          .order("id", { ascending: true })
          .range(offset, offset + 499);
        if (current !== request.current) return;
        if (queryError) throw queryError;
        rows.push(...(data || []));
        if ((data?.length || 0) < 500) break;
      }
      setPayments(rows);
    } catch {
      if (current === request.current) setError(true);
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => {
      ++request.current;
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const total = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const status = loading ? "입금내역 확인 중…" : error ? "입금내역을 불러오지 못했습니다." : `${total.toLocaleString()}원`;

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div aria-live="polite">
          <p className="text-sm text-gray-600">현재 입금 합계</p>
          <p className={`mt-1 font-bold ${error ? "text-red-600" : "text-blue-800"}`}>{status}</p>
        </div>
        <button type="button" className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700"
          onClick={() => { dialog.current?.showModal(); void refresh(); }}>
          입금내역 보기
        </button>
      </div>
      <dialog ref={dialog} aria-labelledby="reservation-payments-title"
        className="fixed inset-0 m-auto max-h-[80dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 text-gray-900 shadow-xl backdrop:bg-black/40">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 id="reservation-payments-title" className="text-lg font-bold">입금내역</h3>
          <button type="button" autoFocus onClick={() => dialog.current?.close()} className="rounded-lg border px-3 py-2 text-sm">닫기</button>
        </div>
        <p className="mb-3 text-sm text-gray-500">입금 등록과 수정은 기존 정산 화면에서 진행해주세요.</p>
        <div aria-live="polite">
          {loading ? <p className="py-6 text-center">입금내역 확인 중…</p> : error ? (
            <div className="py-6 text-center">
              <p className="text-red-600">입금내역을 불러오지 못했습니다.</p>
              <button type="button" onClick={() => void refresh()} className="mt-3 rounded-lg border px-3 py-2">다시 시도</button>
            </div>
          ) : (
            <>
              {payments.length === 0 ? <p className="py-6 text-center text-gray-500">등록된 입금내역이 없습니다.</p> : (
                <ul className="divide-y rounded-lg border px-3">
                  {payments.map((payment) => (
                    <li key={payment.id} className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div><span className="text-sm">{payment.payment_date}</span><span className="ml-2 text-sm text-gray-500">{payment.payment_type || "-"}</span></div>
                        <strong>{Number(payment.amount || 0).toLocaleString()}원</strong>
                      </div>
                      {payment.memo && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-500">{payment.memo}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-right font-bold text-blue-800">현재 입금 합계 {total.toLocaleString()}원</p>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
