import { NextResponse } from "next/server";
import { getAdminUser, unauthorized } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isInvoiceAmount } from "@/lib/invoices";

const columns = "id,reservation_id,invoice_type,amount,created_at";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(request: Request) {
  if (!await getAdminUser(request)) return unauthorized();
  const reservationId = new URL(request.url).searchParams.get("reservationId") ?? "";
  if (!uuid.test(reservationId)) return json({ error: "예약 정보를 확인해주세요." }, 400);
  try {
    // Read every page so the previous-invoice total is never silently truncated.
    const invoices = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabaseAdmin.from("reservation_invoices")
        .select(columns).eq("reservation_id", reservationId)
        .order("created_at", { ascending: false }).order("id", { ascending: false })
        .range(offset, offset + 499);
      if (error) return json({ error: "청구 이력을 불러오지 못했습니다." }, 500);
      invoices.push(...(data ?? []));
      if (!data || data.length < 500) break;
    }
    return json({ invoices });
  } catch { return json({ error: "청구 이력을 불러오지 못했습니다." }, 500); }
}

export async function PATCH(request: Request) {
  if (!await getAdminUser(request)) return unauthorized();
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "요청 형식이 올바르지 않습니다." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "요청 형식이 올바르지 않습니다." }, 400);
  const { reservationId, invoiceId, amount, expectedAmount } = body;
  const id = typeof invoiceId === "string" ? invoiceId : Number.isSafeInteger(invoiceId) ? String(invoiceId) : "";
  if (typeof reservationId !== "string" || !uuid.test(reservationId) || !(uuid.test(id) || /^[1-9]\d{0,18}$/.test(id)) ||
      !isInvoiceAmount(amount) || !isInvoiceAmount(expectedAmount)) {
    return json({ error: "청구 정보와 금액을 확인해주세요. 금액은 0원 이상의 정수여야 합니다." }, 400);
  }
  try {
    // Scope to this reservation and compare the old amount atomically to avoid overwriting another edit.
    const { data, error } = await supabaseAdmin.from("reservation_invoices")
      .update({ amount }).eq("id", id).eq("reservation_id", reservationId)
      .eq("amount", expectedAmount).select(columns).maybeSingle();
    if (error) return json({ error: "청구 금액을 저장하지 못했습니다." }, 500);
    if (!data) return json({ error: "청구 이력이 변경되었거나 없습니다. 목록을 새로 불러온 뒤 다시 정정해주세요." }, 409);
    return json({ invoice: data });
  } catch { return json({ error: "청구 금액을 저장하지 못했습니다." }, 500); }
}
