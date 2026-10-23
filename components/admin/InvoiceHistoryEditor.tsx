"use client";

import { useState } from "react";
import { invoiceTypeLabels, isInvoiceAmount, type InvoiceHistoryItem } from "@/lib/invoices";

type Props = {
  invoices: InvoiceHistoryItem[];
  reservationId: string;
  disabled: boolean;
  onSaved: () => Promise<void>;
  onEditingChange: (editing: boolean) => void;
};

export default function InvoiceHistoryEditor({ invoices, reservationId, disabled, onSaved, onEditingChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function cancel() { setEditingId(null); onEditingChange(false); setError(""); }
  async function save(row: InvoiceHistoryItem) {
    if (saving || disabled) return;
    const amount = draft.trim() === "" ? NaN : Number(draft.replaceAll(",", ""));
    if (!isInvoiceAmount(amount)) { setError("0원 이상의 정수 금액을 입력해주세요."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/invoices", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId, invoiceId: row.id, expectedAmount: Number(row.amount), amount }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) { cancel(); await onSaved(); }
        throw new Error(result.error || "청구 금액을 저장하지 못했습니다.");
      }
      cancel();
      await onSaved();
      setMessage("청구 금액을 정정했습니다. 이전 청구액에도 반영됩니다.");
    } catch (e) { setError(e instanceof Error ? e.message : "저장하지 못했습니다. 다시 확인해주세요."); }
    finally { setSaving(false); }
  }

  return <details className="no-print rounded-xl border border-blue-200 bg-blue-50 p-4">
    <summary className="cursor-pointer font-semibold text-gray-900">청구 이력 정정 ({invoices.length}건)</summary>
    <p className="mt-2 text-sm text-gray-600">잘못 저장한 청구 금액을 건별로 정정할 수 있습니다. 테스트 청구는 0원으로 저장하면 이전 청구액 합계에서 제외됩니다.</p>
    {invoices.length === 0 ? <p className="mt-3 text-sm">저장된 청구 이력이 없습니다.</p> : <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm"><thead><tr><th className="p-2">생성일</th><th className="p-2">구분</th><th className="p-2">청구액</th><th className="p-2">정정</th></tr></thead>
        <tbody>{invoices.map(row => <tr key={row.id} className="border-t border-blue-100">
          <td className="p-2 whitespace-nowrap">{new Date(row.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</td>
          <td className="p-2">{invoiceTypeLabels[row.invoice_type] ?? row.invoice_type}</td>
          <td className="p-2">{editingId === String(row.id) ? <input aria-label="정정할 청구 금액" className="w-36 rounded border bg-white px-2 py-1 text-right" inputMode="numeric" value={draft} disabled={saving || disabled} onChange={e => setDraft(e.target.value)} /> : `${Number(row.amount).toLocaleString()}원`}</td>
          <td className="p-2 whitespace-nowrap">{editingId === String(row.id) ? <>
            <button type="button" disabled={saving || disabled} onClick={() => void save(row)} className="rounded bg-blue-700 px-3 py-1 text-white disabled:opacity-50">{saving ? "저장 중…" : "저장"}</button>
            <button type="button" disabled={saving} onClick={cancel} className="ml-2 rounded border px-3 py-1">취소</button>
          </> : <button type="button" disabled={disabled || saving || editingId !== null} onClick={() => { setEditingId(String(row.id)); setDraft(String(row.amount)); setError(""); setMessage(""); onEditingChange(true); }} className="rounded border bg-white px-3 py-1 disabled:opacity-50">금액 정정</button>}</td>
        </tr>)}</tbody>
      </table>
    </div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-green-800">{message}</p>}
  </details>;
}
