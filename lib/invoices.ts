export type InvoiceHistoryItem = {
  id: string | number;
  reservation_id: string;
  invoice_type: string;
  amount: number | string;
  created_at: string;
};

export function isInvoiceAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function invoiceHistoryTotal(rows: InvoiceHistoryItem[]) {
  return rows.reduce((total, row) => {
    const amount = Number(row.amount);
    if (!isInvoiceAmount(amount) || !Number.isSafeInteger(total + amount)) {
      throw new Error("청구 이력의 금액을 확인해주세요.");
    }
    return total + amount;
  }, 0);
}

export const invoiceTypeLabels: Record<string, string> = {
  deposit: "계약금", interim: "중도금", balance: "잔금",
};
