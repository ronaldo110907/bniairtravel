import type { sheets_v4 } from "googleapis";

export const XIAMEN_ADMIN_SHEET_ID = "11LAHdd49bmtndCjfNBa16lScTkuT31D11vPcm3idbl4";

export const XIAMEN_ADMIN_HEADERS = ["순차", "출발일", "요일", "일정", "보유좌석", "통합 모객석", "통합 잔여석", "상품별 1인 금액", "상품별 모객", "홈페이지 비고", "직원 메모"];
type Departure = { id: string; departure_date: string; course?: string | null; seat: number | null; variant: string | null; price: number | null };
type Reservation = { departure_id: string | null; name?: string | null; people_count: number | null; status: string | null; reservation_people?: { id: string }[] | null };
const count = (r: Reservation) => Math.max(Number(r.people_count) || 0, r.reservation_people?.length || 0, 1);

/** One row per shared departure date. Private reservation names never enter the public sheet. */
export function buildXiamenAdminRows(departures: Departure[], reservations: Reservation[]) {
  const dates = [...new Set(departures.map(d => d.departure_date))].sort();
  if (!dates.length) throw new Error("하문 출발일이 없습니다. 빈 조회 결과로 관리자 시트를 지우지 않습니다.");
  return dates.map((date, index) => {
    const products = departures.filter(d => d.departure_date === date).sort((a, b) => (a.variant ?? "").localeCompare(b.variant ?? "", "ko"));
    if (new Set(products.map(d => d.variant)).size !== products.length) throw new Error(`${date} 상품이 중복됐습니다.`);
    const seats = [...new Set(products.map(d => d.seat))];
    if (seats.length !== 1 || seats[0] === null || !Number.isFinite(seats[0]) || seats[0] < 0) throw new Error(`${date} 공유좌석을 확인해 주세요.`);
    const courses = [...new Set(products.map(d => d.course).filter(Boolean))];
    if (courses.length !== 1) throw new Error(`${date} 일정을 확인해 주세요.`);
    const ids = new Set(products.map(d => d.id));
    const active = reservations.filter(r => r.departure_id && ids.has(r.departure_id) && r.status !== "취소");
    const booked = active.reduce((sum, r) => sum + count(r), 0);
    const prices = products.map(d => {
      if (d.price !== null && (!Number.isFinite(d.price) || d.price < 0)) throw new Error(`${date} 상품가를 확인해 주세요.`);
      return `${d.variant}: ${d.price === null ? "미등록" : d.price.toLocaleString("ko-KR") + "원"}`;
    }).join("\n");
    const usage = products.map(d => `${d.variant}: ${active.filter(r => r.departure_id === d.id).reduce((sum, r) => sum + count(r), 0)}명`).join("\n");
    const notes = products.flatMap(d => active.filter(r => r.departure_id === d.id).map(r => `${r.name?.trim() || "예약자명 미등록"} ${count(r)}명 · ${d.variant} (${r.status || "상태 미등록"})`)).join("\n");
    return [index + 1, date, "일월화수목금토"[new Date(date + "T00:00:00Z").getUTCDay()], courses[0]!, seats[0], booked, seats[0] - booked, prices, usage, notes];
  });
}

/** Write A:J only; live K notes move with dates on the server, never replay a stale note snapshot. */
export function buildXiamenAdminSyncRequests(departures: Departure[], reservations: Reservation[], sheet: sheets_v4.Schema$Sheet) {
  const sheetId = sheet.properties?.sheetId;
  if (sheetId == null || !sheet.properties?.gridProperties?.rowCount) throw new Error("관리자 시트 구성을 확인해 주세요.");
  const grid = sheet.data?.[0];
  if ((grid?.startRow ?? 0) !== 0 || (grid?.startColumn ?? 0) !== 0) throw new Error("관리자 시트는 A1부터 조회해야 합니다.");
  const existing = grid?.rowData ?? [];
  const string = (cell?: sheets_v4.Schema$CellData) => cell?.userEnteredValue?.stringValue ?? "";
  if (XIAMEN_ADMIN_HEADERS.some((h, i) => string(existing[2]?.values?.[i]) !== h)) throw new Error("관리자 시트 제목 행을 확인해 주세요.");
  const locations = new Map<string, number>();
  let nextRow = 3;
  existing.forEach((row, i) => {
    if (i < 3) return;
    const cell = row.values?.[1];
    const serial = cell?.userEnteredValue?.numberValue;
    const date = serial != null ? new Date(Date.UTC(1899, 11, 30) + serial * 86400000).toISOString().slice(0, 10) : string(cell);
    if (!date) {
      if (row.values?.some(c => c.userEnteredValue)) throw new Error("날짜 없는 관리자 행을 확인해 주세요.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || locations.has(date)) throw new Error("관리자 시트 출발일이 중복되거나 잘못됐습니다.");
    locations.set(date, i); nextRow = Math.max(nextRow, i + 1);
  });
  const values = buildXiamenAdminRows(departures, reservations);
  const dates = new Set(values.map(row => String(row[1])));
  const requests: sheets_v4.Schema$Request[] = [];
  const writes: sheets_v4.Schema$Request[] = [];
  for (const row of values) {
    const index = locations.get(String(row[1])) ?? nextRow++;
    if (!locations.has(String(row[1])) && locations.size) writes.push({ copyPaste: { source: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 11 }, destination: { sheetId, startRowIndex: index, endRowIndex: index + 1, startColumnIndex: 0, endColumnIndex: 11 }, pasteType: "PASTE_FORMAT" } });
    const cells: sheets_v4.Schema$CellData[] = row.map(v => ({ userEnteredValue: typeof v === "number" ? { numberValue: v } : { stringValue: v } }));
    cells[0] = { userEnteredValue: { formulaValue: "=ROW()-3" } };
    cells[1] = { userEnteredValue: { numberValue: (Date.parse(String(row[1]) + "T00:00:00Z") - Date.UTC(1899, 11, 30)) / 86400000 }, userEnteredFormat: { numberFormat: { type: "DATE", pattern: "yyyy-mm-dd" } } };
    cells[6] = { userEnteredValue: { formulaValue: "=INDEX(E:E,ROW())-INDEX(F:F,ROW())" } };
    writes.push({ updateCells: { range: { sheetId, startRowIndex: index, endRowIndex: index + 1, startColumnIndex: 0, endColumnIndex: 10 }, rows: [{ values: cells }], fields: "userEnteredValue" } });
  }
  if (nextRow > 1000) throw new Error("관리자 시트 행 범위를 확인해 주세요.");
  const capacity = sheet.properties.gridProperties.rowCount;
  if (nextRow > capacity) requests.push({ appendDimension: { sheetId, dimension: "ROWS", length: nextRow - capacity } });
  requests.push(...writes);
  const removed = [...locations].filter(([date]) => !dates.has(date)).map(([, row]) => row).sort((a,b) => b-a);
  for (const row of removed) requests.push({ deleteRange: { range: { sheetId, startRowIndex: row, endRowIndex: row+1, startColumnIndex: 0, endColumnIndex: 11 }, shiftDimension: "ROWS" } });
  const end = nextRow - removed.length;
  requests.push({ sortRange: { range: { sheetId, startRowIndex: 3, endRowIndex: end, startColumnIndex: 0, endColumnIndex: 11 }, sortSpecs: [{ dimensionIndex: 1, sortOrder: "ASCENDING" }] } });
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: end, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { numberFormat: { type: "DATE", pattern: "yyyy-mm-dd" } } }, fields: "userEnteredFormat.numberFormat" } });
  requests.push({ setBasicFilter: { filter: { range: { sheetId, startRowIndex: 2, endRowIndex: end, startColumnIndex: 0, endColumnIndex: 11 } } } });
  values.forEach((row, i) => requests.push({ updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: i + 3, endIndex: i + 4 }, properties: { pixelSize: Math.max(72, ...row.slice(7).map(v => String(v).split("\n").reduce((n, line) => n + Math.max(1, Math.ceil(line.length / 30)), 0) * 18 + 16)) }, fields: "pixelSize" } }));
  // Keep the existing sold-out rule bounded to the current rows, including newly appended dates.
  for (const [index, rule] of (sheet.conditionalFormats ?? []).entries()) {
    if (rule.ranges?.length === 1 && rule.ranges[0].startColumnIndex === 6 && rule.ranges[0].endColumnIndex === 7) requests.push({ updateConditionalFormatRule: { sheetId, index, rule: { ...rule, ranges: [{ sheetId, startRowIndex: 3, endRowIndex: end, startColumnIndex: 6, endColumnIndex: 7 }] } } });
  }
  return { requests, values, departureCount: values.length };
}
