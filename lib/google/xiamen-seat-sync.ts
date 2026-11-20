import type { SupabaseClient } from "@supabase/supabase-js";
import type { sheets_v4 } from "googleapis";
import { getGoogleSheetsClient } from "./sheets";

const SHEET_NAME = "좌석현황";
export const PRICE_LABEL = "↳ 1인 상품가";
export const XIAMEN_BLOCKS = [
  { course: "3박5일", dates: [
    "2026-12-03", "2026-12-10", "2026-12-17", "2026-12-24", "2026-12-31",
    "2027-01-07", "2027-01-14", "2027-01-21", "2027-01-28", "2027-02-04",
    "2027-02-11", "2027-02-18", "2027-02-25", "2027-03-04", "2027-03-11", "2027-03-18", "2027-03-25",
  ], variants: [{ name: "하문고품격", label: "하문고품격" }, { name: "하문골프54H", label: "골프" }] },
  { course: "4박6일", dates: [
    "2026-12-06", "2026-12-13", "2026-12-20", "2026-12-27", "2027-01-03",
    "2027-01-10", "2027-01-17", "2027-01-24", "2027-01-31", "2027-02-07",
    "2027-02-14", "2027-02-21", "2027-02-28", "2027-03-07", "2027-03-14", "2027-03-21",
  ], variants: [{ name: "고품격관지산", label: "고품격관지산" }, { name: "고품격무이산", label: "고품격무이산" }, { name: "하문골프72H", label: "골프" }] },
] as const;
const XIAMEN_VARIANTS = ["하문실속", ...XIAMEN_BLOCKS.flatMap(b => b.variants.map(v => v.name))];
type Departure = { id: string; departure_date: string; seat: number | null; variant: string | null; price: number | null };
type Reservation = { departure_id: string | null; people_count: number | null; status: string | null; reservation_people?: { id: string }[] | null };
const text = (cell?: sheets_v4.Schema$CellData) => cell?.userEnteredValue?.stringValue?.trim() ?? "";
const column = (index: number) => String.fromCharCode(65 + index); // This fixed winter matrix spans A:T.

function dateValue(cell?: sheets_v4.Schema$CellData) {
  const serial = cell?.effectiveValue?.numberValue ?? cell?.userEnteredValue?.numberValue;
  if (serial !== undefined && serial !== null) return new Date(Date.UTC(1899, 11, 30) + serial * 86400000).toISOString().slice(0, 10);
  const match = cell?.userEnteredValue?.formulaValue?.match(/^=DATE\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)$/i);
  if (match) return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  return text(cell);
}

/** Read labels and dates, not fixed row offsets. Supports both the old matrix and price rows. */
export function resolveXiamenLayout(sheet: sheets_v4.Schema$Sheet) {
  const rows = sheet.data?.[0]?.rowData ?? [];
  if ((sheet.data?.[0]?.startRow ?? 0) !== 0 || (sheet.data?.[0]?.startColumn ?? 0) !== 0) throw new Error("좌석현황은 A1부터 조회해야 합니다.");
  const blocks = XIAMEN_BLOCKS.map(block => {
    const headers = rows.flatMap((r, i) => text(r.values?.[0]) === block.course && text(r.values?.[1]) === "출발일" ? [i] : []);
    if (headers.length !== 1) throw new Error(`${block.course} 출발일 제목을 확인해 주세요.`);
    const header = headers[0];
    const next = rows.findIndex((r, i) => i > header && text(r.values?.[1]) === "출발일");
    const end = next < 0 ? rows.length : next;
    const find = (label: string) => {
      const matches = rows.flatMap((r, i) => i > header && i < end && text(r.values?.[1]) === label ? [i] : []);
      if (matches.length !== 1) throw new Error(`${block.course} ${label} 행을 확인해 주세요.`);
      return matches[0];
    };
    const dates = block.dates.map((_, i) => dateValue(rows[header].values?.[i + 2]));
    if (new Set(dates).size !== block.dates.length || block.dates.some(d => !dates.includes(d))) throw new Error(`${block.course} 시트 출발일이 등록 일정과 다릅니다.`);
    if (text(rows[header].values?.[block.dates.length + 2]) !== "합계") throw new Error(`${block.course} 합계 열을 확인해 주세요.`);
    const variants = block.variants.map(v => {
      const row = find(v.label);
      return { ...v, row, priceRow: text(rows[row + 1]?.values?.[1]) === PRICE_LABEL ? row + 1 : null };
    });
    return { ...block, header, dates, variants, seatRow: find("보유좌석"), bookedRow: find("통합 모객석"), remainingRow: find("통합 잔여석"), totalColumn: dates.length + 2 };
  });
  const priceCount = blocks.flatMap(b => b.variants).filter(v => v.priceRow !== null).length;
  const allPriceLabels = rows.filter(r => text(r.values?.[1]) === PRICE_LABEL).length;
  if ((priceCount !== 0 && priceCount !== 5) || allPriceLabels !== priceCount) throw new Error("상품가 행이 일부만 있거나 위치가 다릅니다. 시트 구성을 확인해 주세요.");
  return blocks;
}

/** Build and validate everything before one atomic Sheets write; prices never enter seat totals. */
export function buildXiamenSyncRequests(departures: Departure[], reservations: Reservation[], sheet: sheets_v4.Schema$Sheet) {
  const sheetId = sheet.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) throw new Error("좌석현황 탭을 찾을 수 없습니다.");
  const blocks = resolveXiamenLayout(sheet);
  const byKey = new Map<string, Departure>();
  for (const d of departures) {
    const key = `${d.departure_date}|${d.variant}`;
    if (byKey.has(key)) throw new Error(`중복 출발일: ${key}`);
    byKey.set(key, d);
  }
  const counts = new Map<string, number>();
  for (const r of reservations) {
    if (!r.departure_id || r.status === "취소") continue;
    const count = Math.max(Number(r.people_count) || 0, r.reservation_people?.length || 0, 1);
    counts.set(r.departure_id, (counts.get(r.departure_id) ?? 0) + count);
  }
  const requests: sheets_v4.Schema$Request[] = [];
  const write = (row: number, col: number, values: (string | number)[]) => requests.push({ updateCells: {
    range: { sheetId, startRowIndex: row, endRowIndex: row + 1, startColumnIndex: col, endColumnIndex: col + values.length },
    rows: [{ values: values.map(value => ({ userEnteredValue: typeof value === "number" ? { numberValue: value } : value.startsWith("=") ? { formulaValue: value } : { stringValue: value } })) }], fields: "userEnteredValue",
  } });
  const totals: number[] = [];
  const warnings: string[] = [];
  for (const b of blocks) {
    let booked = 0;
    const seats = b.dates.map(date => {
      const values = [...new Set(departures.filter(d => d.departure_date === date && d.seat !== null && Number.isFinite(Number(d.seat))).map(d => Number(d.seat)))];
      if (values.length !== 1) throw new Error(`${date} 상품별 보유좌석이 없거나 서로 다릅니다.`);
      return values[0];
    });
    write(b.seatRow, 2, seats);
    for (const v of b.variants) {
      const source = b.dates.map(date => {
        const d = byKey.get(`${date}|${v.name}`);
        if (!d) throw new Error(`${date} ${v.name} 출발일이 없습니다.`);
        return d;
      });
      const people = source.map(d => counts.get(d.id) ?? 0);
      booked += people.reduce((sum, n) => sum + n, 0);
      write(v.row, 2, people);
      write(v.row, b.totalColumn, [`=SUM(C${v.row + 1}:${column(b.totalColumn - 1)}${v.row + 1})`]);
      if (v.priceRow !== null) {
        write(v.priceRow, 2, source.map(d => {
          if (d.price === null || d.price === undefined) { warnings.push(`${d.departure_date} ${v.name} 상품가 미등록`); return "미등록"; }
          if (!Number.isFinite(Number(d.price)) || Number(d.price) < 0) throw new Error(`${d.departure_date} ${v.name} 상품가를 확인해 주세요.`);
          return Number(d.price);
        }));
        write(v.priceRow, b.totalColumn, [""]);
      }
    }
    const legacy = b.dates.map(date => b.course === "3박5일" ? counts.get(byKey.get(`${date}|하문실속`)?.id ?? "") ?? 0 : 0);
    booked += legacy.reduce((sum, n) => sum + n, 0);
    // Explicit references avoid summing newly inserted price rows. Legacy seat usage stays included.
    write(b.bookedRow, 2, b.dates.map((_, i) => `=${b.variants.map(v => `${column(i + 2)}${v.row + 1}`).join("+")}${legacy[i] ? `+${legacy[i]}` : ""}`));
    write(b.remainingRow, 2, b.dates.map((_, i) => `=IF(${column(i + 2)}${b.seatRow + 1}="","",${column(i + 2)}${b.seatRow + 1}-${column(i + 2)}${b.bookedRow + 1})`));
    for (const row of [b.seatRow, b.bookedRow, b.remainingRow]) write(row, b.totalColumn, [`=SUM(C${row + 1}:${column(b.totalColumn - 1)}${row + 1})`]);
    totals.push(booked);
  }
  // Google omits zero sheetId in responses. Normalise it so rules do not accumulate on every sync.
  const soldOutRule = (rule: sheets_v4.Schema$ConditionalFormatRule) => blocks.some(b => {
    const cell = `C${b.remainingRow + 1}`;
    const formula = rule.booleanRule?.condition?.values?.[0]?.userEnteredValue?.replace(/\s/g, "").toUpperCase();
    return formula === `=AND(ISNUMBER(${cell}),${cell}=0)` && rule.ranges?.length === 1 && rule.ranges.every(r => (r.sheetId ?? sheetId) === sheetId && r.startRowIndex === b.remainingRow && r.endRowIndex === b.remainingRow + 1 && r.startColumnIndex === 2 && r.endColumnIndex === b.totalColumn);
  });
  (sheet.conditionalFormats ?? []).map((rule, index) => ({ rule, index })).filter(x => soldOutRule(x.rule)).reverse().forEach(({ index }) => requests.push({ deleteConditionalFormatRule: { sheetId, index } }));
  for (const b of blocks) {
    const range = { sheetId, startRowIndex: b.remainingRow, endRowIndex: b.remainingRow + 1, startColumnIndex: 2, endColumnIndex: b.totalColumn };
    requests.push({ repeatCell: { range, cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: '0;-0;"마감"' }, backgroundColor: { red: .85, green: .91, blue: .98 }, textFormat: { foregroundColor: { red: 0, green: .2, blue: .7 } } } }, fields: "userEnteredFormat.numberFormat,userEnteredFormat.backgroundColor,userEnteredFormat.textFormat.foregroundColor" } });
    const cell = `C${b.remainingRow + 1}`;
    requests.push({ addConditionalFormatRule: { index: 0, rule: { ranges: [range], booleanRule: { condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: `=AND(ISNUMBER(${cell}),${cell}=0)` }] }, format: { backgroundColor: { red: .85, green: .1, blue: .1 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 } } } } } } });
  }
  return { requests, warnings, seatUsage: { threeNight: totals[0], fourNight: totals[1], total: totals[0] + totals[1] }, priceRowCount: blocks.flatMap(b => b.variants).filter(v => v.priceRow !== null).length };
}

export async function syncXiamenSeats(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("departures").select("id,departure_date,seat,variant,price")
    .gte("departure_date", "2026-12-03").lte("departure_date", "2027-03-25").in("variant", XIAMEN_VARIANTS);
  if (error) throw new Error(`하문 출발일 조회 실패: ${error.message}`);
  const departures = (data ?? []) as Departure[];
  if (!departures.length) throw new Error("하문 출발일 데이터가 없습니다.");
  const reservations: Reservation[] = [];
  for (let offset = 0; ; offset += 500) {
    const result = await supabase.from("reservations").select("id,departure_id,people_count,status,reservation_people(id)")
      .in("departure_id", departures.map(d => d.id)).order("id").range(offset, offset + 499);
    if (result.error) throw new Error(`하문 예약 조회 실패: ${result.error.message}`);
    reservations.push(...(result.data ?? []) as Reservation[]);
    if ((result.data?.length ?? 0) < 500) break;
  }
  const { sheets, spreadsheetId } = getGoogleSheetsClient();
  const info = await sheets.spreadsheets.get({ spreadsheetId, ranges: [`'${SHEET_NAME}'!A1:T80`], includeGridData: true,
    fields: "sheets(properties(sheetId,title),conditionalFormats,data(startRow,startColumn,rowData(values(userEnteredValue,effectiveValue))))" });
  const sheet = info.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
  if (!sheet) throw new Error("구글시트 좌석현황 탭을 찾을 수 없습니다.");
  const plan = buildXiamenSyncRequests(departures, reservations, sheet);
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: plan.requests } });
  return { success: true, syncedAt: new Date().toISOString(), departureCount: 33, reservationCount: reservations.length, seatUsage: plan.seatUsage, priceRowCount: plan.priceRowCount, warnings: plan.warnings };
}
