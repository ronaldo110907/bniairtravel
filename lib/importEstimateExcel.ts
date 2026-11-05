import * as XLSX from "xlsx-js-style";
import type { ImportedEstimateDay, ImportedEstimateForm } from "./importEstimatePdf";

type HeaderFields = Partial<Pick<ImportedEstimateForm,
  "productName" | "travelPeriod" | "includes" | "excludes" | "remarks" | "shopping" | "options">>;
type DayColumn = "region" | "transport" | "time" | "schedule";
const label = (s = "") => s.replace(/[\s:：]/g, "").toLowerCase();
const append = (a: string | undefined, b: string) => a ? a + "\n" + b : b;

// Sparse cells only: a formatted but empty sheet can have a million-row !ref.
function readRows(sheet: XLSX.WorkSheet) {
  const rows = new Map<number, string[]>();
  for (const address of Object.keys(sheet)) {
    if (address.startsWith("!")) continue;
    const cell = sheet[address];
    const value = typeof cell.v === "string" ? cell.v : cell.w ?? String(cell.v ?? "");
    if (!value.trim()) continue;
    const { r, c } = XLSX.utils.decode_cell(address);
    const row = rows.get(r) ?? [];
    row[c] = value.replace(/\r\n?/g, "\n");
    rows.set(r, row);
  }
  return [...rows.entries()].sort(([a], [b]) => a - b).map(([, row]) => row);
}

function collectHeader(rows: string[][]) {
  const fields: HeaderFields = {};
  let section: keyof HeaderFields | undefined;
  const names: Record<string, keyof HeaderFields> = {
    상품: "productName", 상품명: "productName", 기간: "travelPeriod", 여행기간: "travelPeriod",
    포함: "includes", 포함사항: "includes", 불포함: "excludes", 불포함사항: "excludes",
    remarks: "remarks", 비고: "remarks", 쇼핑: "shopping", 옵션: "options",
  };
  let noteSection = false;
  for (const [index, row] of rows.entries()) {
    const key = label(row[0]);
    if (key) {
      section = names[key];
      noteSection = /^(적용예정골프장|견적조건|차량옵션)$/.test(key);
    }
    // Supplier contact / price columns can share a row with product information.
    const value = row.slice(1).find(Boolean);
    if (section && value) fields[section] = append(fields[section], value);
    if (noteSection) fields.remarks = append(fields.remarks, row.filter(Boolean).join(" "));
    if (!section && index === 0 && row.filter(Boolean).length === 1 && row[0]) {
      fields.productName = row[0];
    }
  }
  // Preserve descriptive notes and the airline from the supplier's summary.
  for (const row of rows) {
    row.forEach((cell, i) => {
      if (/^(항공|항공편|차량|미팅방법및담당가이드|예정호텔|호텔)$/.test(label(cell))) {
        const value = row.slice(i + 1).find(Boolean);
        if (value) fields.remarks = append(fields.remarks, cell.trim() + " " + value);
      }
    });
  }
  return fields;
}

function dayNumber(value = "") {
  return /^(?:제\s*)?(\d+)\s*(?:일(?:차)?|일차)?(?:\s|$)/.exec(value.trim())?.[1]
    ?? /^day\s*(\d+)\b/i.exec(value.trim())?.[1];
}

export function parseEstimateWorkbook(book: XLSX.WorkBook, filename: string) {
  if (book.SheetNames.length !== 1) throw new Error("견적에 사용할 일정 시트 한 장만 남긴 엑셀 파일을 선택해 주세요.");
  const rows = readRows(book.Sheets[book.SheetNames[0]]);
  const headerAt = rows.findIndex(row => row.some(cell => /^(여행|상세|여행상세)?일정(표)?$/.test(label(cell))) &&
    row.some(cell => /^(날짜|일차|일자|일수|일별|day)$/.test(label(cell))));
  if (headerAt < 0) throw new Error("날짜·일정 머리글을 찾을 수 없습니다. 일정표가 들어 있는 시트를 확인해 주세요.");
  const header = rows[headerAt];
  const col = (pattern: RegExp) => header.findIndex(cell => pattern.test(label(cell)));
  const columns: Record<DayColumn, number> = {
    region: col(/^(지역|장소|도시)$/), transport: col(/^(교통|교통편|항공편)$/), time: col(/^(시간|시각)$/),
    schedule: col(/^(여행|상세|여행상세)?일정(표)?$/),
  };
  const body = rows.slice(headerAt + 1);
  const dayCol = col(/^(날짜|일차|일자|일수|일별|day)$/);
  const nextHeader = header.findIndex((v, i) => i > dayCol && Boolean(v));
  const dayCols = Array.from({length: nextHeader - dayCol}, (_, i) => dayCol + i)
    .filter(i => body.some(row => dayNumber(row[i]) === "1"));
  const duration = filename.match(/(\d+)\s*일(?:간)?(?=\s|[-_.(]|$)/)?.[1];
  const candidates = dayCols.length > 1 ? dayCols.filter(i =>
    body.reduce((last, row) => dayNumber(row[i]) ?? last, "") === duration) : dayCols;
  if (candidates.length !== 1) throw new Error("사용할 일차 열을 확인할 수 없습니다. 해당 코스의 일차 열만 남겨 주세요.");
  const chosen = candidates[0];
  const form = collectHeader(rows.slice(0, headerAt));
  const days: ImportedEstimateDay[] = [];
  let day: ImportedEstimateDay | undefined;
  for (const row of body) {
    const marker = row[chosen] ?? "";
    if (dayCols.some(i => dayNumber(row[i]))) {
      day = undefined;
      const num = dayNumber(marker);
      if (!num) continue; // A block belonging only to a longer course.
      if (Number(num) !== days.length + 1) throw new Error("일차가 연속되지 않습니다. 원본 일정의 날짜 열을 확인해 주세요.");
      day = { id: "excel-day-" + num, region: "", transport: "", time: "", schedule: "",
        breakfast: "", lunch: "", dinner: "", hotel: "" };
      days.push(day);
      const date = marker.trim().split("\n").slice(1).join("\n");
      if (date) day.schedule = date;
    } else if (row[dayCol] && !/^(호텔|식사)$/.test(label(row[dayCol]))) {
      break; // End of itinerary, before notices / pricing tables.
    }
    if (!day) continue;
    const region = row[columns.region] ?? "";
    const schedule = row[columns.schedule] ?? "";
    if (label(region) === "호텔") {
      day.hotel = [schedule, ...row.slice(columns.schedule + 1).filter(Boolean)].filter(Boolean).join(" ");
      continue;
    }
    if (label(row[dayCol]) === "호텔") day.hotel = region;
    for (const cell of row.slice(columns.schedule + 1).filter(Boolean)) {
      for (const match of cell.matchAll(/(?:^|\n)\s*(조|중|석)(?:식)?\s*[:：]\s*([^\n]*(?:\n(?!\s*[조중석](?:식)?\s*[:：])[^\n]*)*)/g)) {
        const field = ({조:"breakfast", 중:"lunch", 석:"dinner"} as const)[match[1] as "조" | "중" | "석"];
        day[field] = append(day[field], match[2]);
      }
    }
    if (label(row[dayCol]) === "호텔" || label(schedule) === "식사") continue;
    for (const key of Object.keys(columns) as DayColumn[]) {
      const value = row[columns[key]];
      if (value) day[key] = append(day[key], value);
    }
  }
  if (!days.length || days.some(d => !d.schedule.trim())) throw new Error("날짜별 상세 일정을 읽을 수 없습니다. 원본 일정표를 확인해 주세요.");
  return { form, days };
}

export async function importEstimateExcel(file: File) {
  if (!/\.xlsx?$/i.test(file.name)) throw new Error("엑셀 파일(.xls, .xlsx)을 선택해 주세요.");
  return parseEstimateWorkbook(XLSX.read(await file.arrayBuffer(), { type: "array" }), file.name);
}
