import type { SupabaseClient } from "@supabase/supabase-js";
import { getGoogleSheetsClient } from "./sheets";

export const ZHANGJIAJIE_SHEET_ID = "1eaDSwD9IxjuOQkqQxc-Ow2XgUrFcxcDMyy0HfC1wrJo";
const TAB = "좌석현황";
type Departure = { id: string; departure_date: string; course: string | null };
type Reservation = {
  departure_id: string | null;
  people_count: number | null;
  status: string | null;
  reservation_people?: { id: string }[] | null;
};

/** Resolve by date/course, never by DB order: sheet filters/sorts must not mix departures. */
export function buildZhangjiajieSeatUpdates(
  departures: Departure[], reservations: Reservation[], rows: unknown[][], firstDataRow = 2,
) {
  const key = (date: string, course: string) => `${date}|${course}`;
  const byKey = new Map<string, Departure>();
  for (const departure of departures) {
    const k = key(departure.departure_date, departure.course ?? "");
    if (byKey.has(k)) throw new Error(`중복 출발일: ${k}`);
    byKey.set(k, departure);
  }
  if (!byKey.size) throw new Error("장가계 2027 출발일이 없습니다.");
  const counts = new Map<string, { hold: number; confirmed: number }>();
  for (const reservation of reservations) {
    if (reservation.status === "취소" || !reservation.departure_id) continue;
    const status = reservation.status || "대기";
    if (!["대기", "홀드", "확정"].includes(status)) {
      throw new Error(`확인되지 않은 예약 상태: ${status}`);
    }
    // 인솔자도 항공 좌석은 점유합니다. 관리자와 동일한 인원 기준입니다.
    const count = Math.max(Number(reservation.people_count) || 0,
      reservation.reservation_people?.length || 0, 1);
    const usage = counts.get(reservation.departure_id) ?? { hold: 0, confirmed: 0 };
    if (status === "확정") usage.confirmed += count;
    else usage.hold += count;
    counts.set(reservation.departure_id, usage);
  }
  const seen = new Set<string>();
  const data = rows.flatMap((row, index) => {
    if (row.every(value => value === "" || value == null)) return [];
    // B:D contains formatted date, weekday, course.
    const k = key(String(row[0] ?? "").trim(), String(row[2] ?? "").trim());
    const departure = byKey.get(k);
    if (!departure || seen.has(k)) throw new Error(`시트와 출발일을 확인해 주세요: ${k}`);
    seen.add(k);
    const usage = counts.get(departure.id) ?? { hold: 0, confirmed: 0 };
    return [{ range: `'${TAB}'!G${index + firstDataRow}:H${index + firstDataRow}`, values: [[usage.hold, usage.confirmed]] }];
  });
  const missing = [...byKey.keys()].filter(k => !seen.has(k));
  if (missing.length) throw new Error(`시트에 없는 출발일: ${missing.join(", ")}`);
  return data;
}

export async function syncZhangjiajieSeats(supabase: SupabaseClient) {
  const { data: product, error: productError } = await supabase.from("products")
    .select("id").eq("slug", "zhangjiajie-2027").single();
  if (productError || !product) throw new Error("장가계 2027 상품을 찾을 수 없습니다.");
  const { data: departureData, error: departureError } = await supabase.from("departures")
    .select("id,departure_date,course").eq("product_id", product.id)
    .gte("departure_date", "2027-03-01").lte("departure_date", "2027-06-30");
  if (departureError) throw new Error(`출발일 조회 실패: ${departureError.message}`);
  const departures = (departureData ?? []) as Departure[];
  if (!departures.length) throw new Error("장가계 2027 출발일이 없습니다.");

  // Paginate rather than silently dropping reservations at Supabase's default row limit.
  const reservations: Reservation[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("reservations")
      .select("id,departure_id,people_count,status,reservation_people(id)")
      .in("departure_id", departures.map(d => d.id)).order("id").range(offset, offset + 499);
    if (error) throw new Error(`예약 조회 실패: ${error.message}`);
    reservations.push(...(data ?? []) as Reservation[]);
    if (!data || data.length < 500) break;
  }

  const { sheets, spreadsheetId } = getGoogleSheetsClient(ZHANGJIAJIE_SHEET_ID);
  const metadata = await sheets.spreadsheets.get({ spreadsheetId,
    fields: "sheets(properties(title,gridProperties(rowCount)))" });
  const rowCount = metadata.data.sheets?.find(s => s.properties?.title === TAB)
    ?.properties?.gridProperties?.rowCount;
  if (!rowCount || rowCount < 2 || rowCount > 1000) throw new Error("좌석현황 시트 범위를 확인해 주세요.");
  const result = await sheets.spreadsheets.values.get({ spreadsheetId,
    range: `'${TAB}'!B1:D${rowCount}`, valueRenderOption: "FORMATTED_VALUE" });
  const rows = result.data.values ?? [];
  const headers = rows.flatMap((row, index) => row[0] === "날짜" && row[2] === "패턴" ? [index] : []);
  if (headers.length !== 1) throw new Error("좌석현황의 날짜/패턴 머리글을 확인해 주세요.");
  const header = headers[0];
  const data = buildZhangjiajieSeatUpdates(departures, reservations, rows.slice(header + 1), header + 2);
  // Only G:H are managed here. Keep prices, total seats, remaining formulas and notes intact.
  await sheets.spreadsheets.values.batchUpdate({ spreadsheetId, requestBody: {
    valueInputOption: "RAW", data,
  } });
  const hold = data.reduce((sum, row) => sum + row.values[0][0], 0);
  const confirmed = data.reduce((sum, row) => sum + row.values[0][1], 0);
  return { success: true, syncedAt: new Date().toISOString(), departureCount: data.length,
    seatUsage: { hold, confirmed, total: hold + confirmed } };
}
