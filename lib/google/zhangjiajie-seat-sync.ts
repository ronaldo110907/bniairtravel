import type { SupabaseClient } from "@supabase/supabase-js";
import type { sheets_v4 } from "googleapis";
import { getGoogleSheetsClient } from "./sheets";

export const ZHANGJIAJIE_SHEET_ID = "1eaDSwD9IxjuOQkqQxc-Ow2XgUrFcxcDMyy0HfC1wrJo";
const TAB = "좌석현황";
type Departure = {
  id: string; departure_date: string; course: string | null;
  price?: number | null; seat?: number | null;
};
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

/** One atomic, deterministic table snapshot: retries never append duplicate dates. */
export function buildZhangjiajieSyncRequests(
  departures: Departure[], reservations: Reservation[], sheet: sheets_v4.Schema$Sheet,
) {
  const sheetId = sheet.properties?.sheetId;
  const rowCount = sheet.properties?.gridProperties?.rowCount;
  const grid = sheet.data?.[0];
  if (sheetId == null || !rowCount || grid?.startRow || grid?.startColumn) {
    throw new Error("좌석현황 시트 범위를 확인해 주세요.");
  }
  const rows = grid?.rowData ?? [];
  const text = (cell?: sheets_v4.Schema$CellData) =>
    String(cell?.formattedValue ?? cell?.userEnteredValue?.stringValue ?? "").trim();
  const headers = rows.flatMap((row, index) =>
    text(row.values?.[1]) === "날짜" && text(row.values?.[3]) === "패턴" ? [index] : []);
  if (headers.length !== 1) throw new Error("좌석현황의 날짜/패턴 머리글을 확인해 주세요.");
  const startRow = headers[0] + 1;
  const sorted = [...departures].sort((a, b) =>
    a.departure_date.localeCompare(b.departure_date) || (a.course ?? "").localeCompare(b.course ?? ""));
  const key = (date: string, course: string) => `${date}|${course}`;
  // Reuse the existing status validation, duplicate detection and guide-inclusive counts.
  const usage = buildZhangjiajieSeatUpdates(sorted, reservations,
    sorted.map(d => [d.departure_date, "", d.course ?? ""]), startRow + 1);
  const keys = new Set(sorted.map(d => key(d.departure_date, d.course ?? "")));
  const existing = new Map<string, sheets_v4.Schema$CellData[]>();
  for (const row of rows.slice(startRow)) {
    const cells = row.values ?? [];
    if (!cells.some(cell => cell.userEnteredValue)) continue;
    const k = key(text(cells[1]), text(cells[3]));
    if (!keys.has(k) || existing.has(k)) throw new Error(`시트와 출발일을 확인해 주세요: ${k}`);
    existing.set(k, cells);
  }
  const template = existing.values().next().value;
  if (!template) throw new Error("서식을 복사할 기존 출발일 행이 없습니다.");
  const fields = "userEnteredValue,userEnteredFormat,note,textFormatRuns,dataValidation";
  const tableRows: sheets_v4.Schema$RowData[] = sorted.map((departure, index) => {
    if (!/^2027-\d{2}-\d{2}$/.test(departure.departure_date) ||
        !["3박4일", "4박5일"].includes(departure.course ?? "")) {
      throw new Error(`출발일/패턴을 확인해 주세요: ${departure.departure_date}`);
    }
    if (departure.seat != null && (!Number.isInteger(departure.seat) || departure.seat < 0)) {
      throw new Error(`총좌석을 확인해 주세요: ${departure.departure_date}`);
    }
    const old = existing.get(key(departure.departure_date, departure.course!));
    if (!old && (departure.price == null || !Number.isFinite(departure.price) || departure.price < 0)) {
      throw new Error(`신규 출발일의 금액을 확인해 주세요: ${departure.departure_date}`);
    }
    const styleSource = old ?? [...existing.values()].find(cells =>
      text(cells[3]) === departure.course && cells[4]?.userEnteredValue?.numberValue === departure.price
    ) ?? template;
    const cells: sheets_v4.Schema$CellData[] = Array.from({ length: 10 }, (_, col) => {
      const source = styleSource[col] ?? {};
      return {
        userEnteredFormat: source.userEnteredFormat,
        dataValidation: source.dataValidation,
        ...(old ? {
          userEnteredValue: source.userEnteredValue,
          note: source.note, textFormatRuns: source.textFormatRuns,
        } : {}),
      };
    });
    const row = startRow + index + 1;
    // E/J keep existing amounts/notes. C/I always reference their own sorted row.
    cells[0].userEnteredValue = { numberValue: index + 1 };
    cells[1].userEnteredValue = {
      numberValue: Date.parse(departure.departure_date + "T00:00:00Z") / 86400000 + 25569,
    };
    cells[2].userEnteredValue = { formulaValue: `=CHOOSE(WEEKDAY(B${row}),"일","월","화","수","목","금","토")` };
    cells[3].userEnteredValue = { stringValue: departure.course! };
    if (!old) cells[4].userEnteredValue = { numberValue: departure.price! };
    cells[5].userEnteredValue = departure.seat == null ? {} : { numberValue: departure.seat };
    cells[6].userEnteredValue = { numberValue: usage[index].values[0][0] };
    cells[7].userEnteredValue = { numberValue: usage[index].values[0][1] };
    cells[8].userEnteredValue = { formulaValue: `=IF(F${row}="","",F${row}-G${row}-H${row})` };
    return { values: cells };
  });
  const endRow = startRow + tableRows.length;
  if (endRow > 1000) throw new Error("좌석현황 시트 범위를 확인해 주세요.");
  const requests: sheets_v4.Schema$Request[] = [];
  if (endRow > rowCount) {
    requests.push({ appendDimension: { sheetId, dimension: "ROWS", length: endRow - rowCount } });
    requests.push({ updateDimensionProperties: {
      range: { sheetId, dimension: "ROWS", startIndex: rowCount, endIndex: endRow },
      properties: { pixelSize: grid?.rowMetadata?.[startRow]?.pixelSize ?? 32 }, fields: "pixelSize",
    } });
  }
  // Clearing and replacing happen in the same atomic batch. Concurrent/retried snapshots
  // cannot leave partially added rows or duplicate dates at the bottom of the table.
  requests.push({ repeatCell: {
    range: { sheetId, startRowIndex: startRow, startColumnIndex: 0, endColumnIndex: 10 },
    cell: {}, fields,
  } });
  requests.push({ updateCells: {
    start: { sheetId, rowIndex: startRow, columnIndex: 0 }, rows: tableRows, fields,
  } });
  for (const [index, rule] of (sheet.conditionalFormats ?? []).entries()) {
    const ranges = rule.ranges?.map(range => {
      if (range.startRowIndex !== startRow) return range;
      const { endRowIndex: _end, ...openEnded } = range;
      return openEnded;
    });
    requests.push({ updateConditionalFormatRule: { sheetId, index, rule: { ...rule, ranges } } });
  }
  if (sheet.basicFilter) {
    requests.push({ setBasicFilter: { filter: {
      ...sheet.basicFilter,
      range: { sheetId, startRowIndex: startRow - 1, startColumnIndex: 0, endColumnIndex: 10 },
    } } });
  }
  requests.push({ updateCells: {
    start: { sheetId, rowIndex: startRow - 1, columnIndex: 5 },
    rows: [{ values: [{ note: "홈페이지 출발일의 총좌석을 자동 반영합니다. 좌석 변경은 홈페이지에서 해주세요." }] }],
    fields: "note",
  } });
  const hold = usage.reduce((sum, row) => sum + row.values[0][0], 0);
  const confirmed = usage.reduce((sum, row) => sum + row.values[0][1], 0);
  return { requests, departureCount: sorted.length, addedCount: sorted.length - existing.size,
    seatUsage: { hold, confirmed, total: hold + confirmed } };
}

export async function syncZhangjiajieSeats(supabase: SupabaseClient) {
  const { data: product, error: productError } = await supabase.from("products")
    .select("id").eq("slug", "zhangjiajie-2027").single();
  if (productError || !product) throw new Error("장가계 2027 상품을 찾을 수 없습니다.");
  const { data: departureData, error: departureError } = await supabase.from("departures")
    .select("id,departure_date,course,price,seat").eq("product_id", product.id)
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
  const rowCount = metadata.data.sheets?.find(s => s.properties?.title === TAB)?.properties?.gridProperties?.rowCount;
  if (!rowCount || rowCount < 2 || rowCount > 1000) throw new Error("좌석현황 시트 범위를 확인해 주세요.");
  const result = await sheets.spreadsheets.get({ spreadsheetId,
    ranges: [`'${TAB}'!A1:J${rowCount}`],
    fields: "sheets(properties,basicFilter,conditionalFormats,data(startRow,startColumn,rowMetadata(pixelSize),rowData(values(formattedValue,userEnteredValue,userEnteredFormat,note,textFormatRuns,dataValidation))))",
  });
  const sheet = result.data.sheets?.find(s => s.properties?.title === TAB);
  if (!sheet) throw new Error("좌석현황 시트를 찾을 수 없습니다.");
  const { requests, ...summary } = buildZhangjiajieSyncRequests(departures, reservations, sheet);
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  return { success: true, syncedAt: new Date().toISOString(), ...summary };
}
