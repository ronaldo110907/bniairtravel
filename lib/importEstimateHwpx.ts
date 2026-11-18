import JSZip from "jszip";
import type { ImportedEstimateDay, ImportedEstimateForm } from "./importEstimatePdf";

const fields = ["productName", "travelPeriod", "includes", "excludes", "shopping", "options", "remarks"] as const;
type ContentForm = Partial<Pick<ImportedEstimateForm, typeof fields[number]>>;
export function estimateContentOnly(form: Partial<ImportedEstimateForm>): ContentForm {
  return Object.fromEntries(fields.filter(key => typeof form[key] === "string").map(key => [key, form[key]]));
}
const normalized = (s = "") => s.replace(/[\s:：/·ㆍ()\[\]■□▶]/g, "").toLowerCase();
const append = (a: string, b: string) => a && b ? `${a}\n${b}` : a || b;
const clean = (s = "") => s.trim() === "-" ? "" : s.trim();
const headerNames: Record<string, keyof ContentForm> = {
  상품: "productName", 상품명: "productName", 여행상품명: "productName", 여행기간: "travelPeriod", 기간: "travelPeriod",
  포함: "includes", 포함사항: "includes", 포함내역: "includes", 포함내역사항: "includes", 포함내역및사항: "includes",
  불포함: "excludes", 불포함사항: "excludes", 불포함내역: "excludes", 비고: "remarks", 참고사항: "remarks", 안내사항: "remarks",
  쇼핑: "shopping", 옵션: "options", 선택관광: "options",
};
const dayNumber = (s: string) => /^(?:day\s*|제\s*)?(\d+)\s*(?:일(?:차)?)?(?=\s|$)/i.exec(s.trim())?.[1];
type DayField = Exclude<keyof ImportedEstimateDay, "id">;
type Layout = { day: number; columns: Partial<Record<DayField, number>>; meals: number };

function contentText(node: Node): string {
  if (node.nodeType === 3) return node.textContent || "";
  const name = (node as Element).localName;
  if (name === "lineBreak") return "\n";
  if (name === "tab") return "\t";
  return Array.from(node.childNodes).map(contentText).join("");
}
function paragraphText(p: Element) {
  return Array.from(p.getElementsByTagNameNS("*", "t")).map(contentText).join("");
}
function rowsOf(table: Element): string[][] {
  return Array.from(table.children).filter(e => e.localName === "tr").map(tr => {
    const row: string[] = [];
    let fallback = 0;
    for (const cell of Array.from(tr.children).filter(e => e.localName === "tc")) {
      const addr = Array.from(cell.children).find(e => e.localName === "cellAddr");
      const index = Number(addr?.getAttribute("colAddr") ?? fallback++);
      if (!Number.isInteger(index) || index < 0 || index > 100) throw new Error("한글 표의 열 구성을 확인할 수 없습니다.");
      const sub = Array.from(cell.children).find(e => e.localName === "subList");
      if (sub?.getElementsByTagNameNS("*", "tbl").length) throw new Error("표 안에 다른 표가 있는 양식입니다. 일정표를 단순한 표로 정리한 뒤 다시 올려주세요.");
      row[index] = sub ? Array.from(sub.children).filter(e => e.localName === "p").map(paragraphText).join("\n").trim() : "";
    }
    return row;
  });
}

export function parseEstimateHwpxSections(sections: string[]) {
  const form: ContentForm = {}, days: ImportedEstimateDay[] = [], warnings: string[] = [];
  let current: ImportedEstimateDay | undefined;
  let activeSection: keyof ContentForm | undefined;
  let lastDate = "";
  let foundSchedule = false;
  let unsupportedRows = 0;
  function addForm(key: keyof ContentForm, value: string) { form[key] = append(form[key] || "", clean(value)); }
  function startDay(number: number) {
    if (number === days.length && current) return;
    if (number !== days.length + 1) throw new Error("한글 일정의 일차가 연속되지 않거나 코스가 여러 개입니다. 사용할 일정 한 개만 남겨주세요.");
    current = { id: `hwpx-day-${number}`, region: "", transport: "", time: "", schedule: "", breakfast: "", lunch: "", dinner: "", hotel: "" };
    days.push(current);
  }
  function metadata(row: string[]) {
    let matched = false;
    row.forEach((cell, i) => {
      const key = normalized(cell);
      const field = headerNames[key];
      if (field) {
        // Paired headers (포함사항 | 불포함사항) are handled by the table reader.
        const values = row.slice(i + 1);
        const end = values.findIndex(v => !!headerNames[normalized(v)]);
        const value = (end < 0 ? values : values.slice(0, end)).filter(Boolean).join("\n");
        if (value) addForm(field, value);
        activeSection = field; matched = true;
      } else if (/^(항공|항공편|항공스케줄|항공일정|예정호텔|이용호텔)$/.test(key)) {
        const value = row.slice(i + 1).find(Boolean);
        if (value) addForm("remarks", `${cell}\n${value}`);
        matched = true; activeSection = undefined;
      }
    });
    if (!matched) {
      if (!row[0] && activeSection) {
        const value = row.slice(1).filter(Boolean).join("\n");
        if (value) addForm(activeSection, value);
      } else activeSection = undefined;
    }
    return matched;
  }
  function readTable(table: Element) {
    const rows = rowsOf(table);
    let layout: Layout | undefined;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const names = row.map(normalized);
      const index = (pattern: RegExp) => names.findIndex(v => pattern.test(v));
      const schedule = index(/^(상세|여행|여행상세)?일정(표|호텔)?$/);
      if (schedule >= 0 && names.some(v => /^(일자|일차|날짜|일수|day|day\d+지역)$/.test(v))) {
        foundSchedule = true; activeSection = undefined;
        layout = { day: index(/^(일자|일차|날짜|일수|day)$/), meals: index(/^(식사|식사내역)$/), columns: {
          region: index(/^(지역|장소|도시|day\d+지역)$/), transport: index(/^(교통|교통편|항공|항공편)$/), time: index(/^(시간|시각)$/), schedule,
          breakfast: index(/^(조식|아침)$/), lunch: index(/^(중식|점심)$/), dinner: index(/^(석식|저녁)$/), hotel: index(/^(호텔|숙박|숙소)$/),
        } };
        const embedded = row.find(v => /^day\s*\d+\s*지역$/i.test(v));
        if (embedded) startDay(Number(dayNumber(embedded)));
        continue;
      }
      if (!layout) {
        const pairs = row.map((value, col) => ({field: headerNames[normalized(value)], col})).filter(p => p.field);
        if (pairs.length > 1 && row.filter(Boolean).length === pairs.length && r + 1 < rows.length) {
          for (const p of pairs) addForm(p.field, rows[r + 1][p.col] || "");
          r++; activeSection = undefined; continue;
        }
        metadata(row); continue;
      }
      // Footer conditions and hotel rows can follow the schedule in the same table.
      if (headerNames[normalized(row[0])]) { layout = undefined; metadata(row); continue; }
      if (/^(hotel|호텔|숙박)$/.test(normalized(row.find(Boolean) || ""))) {
        if (current) current.hotel = append(current.hotel, row.filter(Boolean).slice(1).join("\n"));
        continue;
      }
      const marker = layout.day >= 0 ? clean(row[layout.day]) : "";
      if (marker) {
        const number = dayNumber(marker);
        if (number) startDay(Number(number));
        else if (/^(?:\d{4}[-./년]\s*)?\d{1,2}[-./월]\s*\d{1,2}/.test(marker)) {
          if (lastDate !== marker) startDay(days.length + 1);
          lastDate = marker;
          if (current && !current.schedule) current.schedule = marker;
        } else { unsupportedRows++; current = undefined; continue; }
      }
      if (!current) { if (row.some(Boolean)) unsupportedRows++; continue; }
      for (const [field, col] of Object.entries(layout.columns) as [DayField, number][]) {
        if (col < 0) continue;
        let value = clean(row[col]);
        if (field === "schedule") {
          const hotel = /(?:^|\n)\s*(?:HOTEL|호텔)\s*[:：]\s*/i.exec(value);
          if (hotel) {
            current.hotel = append(current.hotel, value.slice(hotel.index + hotel[0].length));
            value = value.slice(0, hotel.index).trimEnd();
          }
        }
        if (value) current[field] = append(current[field], value);
      }
      const meals = layout.meals >= 0 ? clean(row[layout.meals]) : "";
      if (meals) {
        let mealField: "breakfast" | "lunch" | "dinner" | undefined;
        for (const line of meals.split("\n")) {
          const match = /^\s*(조|중|석)(?:식)?(?:\s*[:：]\s*|\s+)(.*)$/.exec(line);
          if (match) {
            mealField = ({조:"breakfast",중:"lunch",석:"dinner"} as const)[match[1] as "조"|"중"|"석"];
            current[mealField] = append(current[mealField], match[2]);
          } else if (mealField) current[mealField] = append(current[mealField], line);
          else { addForm("remarks", `DAY ${days.length} 식사 원문: ${line}`); warnings.push(`DAY ${days.length} 식사의 조·중·석 구분을 확인하지 못해 비고에 원문을 넣었습니다.`); }
        }
      }
    }
  }
  for (const xml of sections) {
    if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("외부 참조가 포함된 한글 파일은 읽을 수 없습니다.");
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    if (doc.getElementsByTagName("parsererror").length) throw new Error("한글 문서 내용을 읽지 못했습니다.");
    for (const p of Array.from(doc.documentElement.children)) {
      const tables = Array.from(p.getElementsByTagNameNS("*", "tbl"));
      if (tables.length) { for (const table of tables) readTable(table); continue; }
      const text = paragraphText(p).trim();
      if (!text) continue;
      const colon = /^([^:：\n]{1,25})\s*[:：]\s*([\s\S]*)$/.exec(text);
      const key = headerNames[normalized(colon?.[1] || text)];
      if (key) { activeSection = key; if (colon?.[2]) addForm(key, colon[2]); }
      else if (/견적|금액|입금|항공료|지상비|상세\s*일정|상기 일정/.test(text)) activeSection = undefined;
      else if (activeSection) addForm(activeSection, text);
    }
  }
  if (!foundSchedule || !days.length || days.some(d => !d.schedule.trim())) throw new Error("날짜별 상세 일정을 정확히 읽지 못했습니다. 일자·지역·교통·시간·일정 항목이 있는 표인지 확인해주세요.");
  if (unsupportedRows) throw new Error("인식하지 못한 일정 행이 있습니다. 날짜 열을 DAY 1, DAY 2 또는 1일차 형식으로 정리한 뒤 다시 올려주세요.");
  if (!form.includes) { delete form.includes; warnings.push("포함사항을 찾지 못했습니다. 기존 입력값을 유지하므로 원본과 확인해주세요."); }
  if (!form.excludes) { delete form.excludes; warnings.push("불포함사항을 찾지 못했습니다. 기존 입력값을 유지하므로 원본과 확인해주세요."); }
  if (!days.some(d => d.transport)) warnings.push("교통·항공편 열을 찾지 못했습니다. 항공스케줄은 원본과 비교해주세요.");
  return { form: estimateContentOnly(form), days, warnings };
}

export async function importEstimateHwpx(file: File) {
  if (/\.hwp$/i.test(file.name)) throw new Error("한글에서 ‘다른 이름으로 저장 → 한글 표준 문서(.hwpx)’로 저장한 뒤 올려주세요.");
  if (!/\.hwpx$/i.test(file.name)) throw new Error("한글 표준 문서(.hwpx)를 선택해주세요.");
  if (file.size > 20 * 1024 * 1024) throw new Error("20MB 이하의 한글 파일을 선택해주세요.");
  let zip: JSZip;
  try { zip = await JSZip.loadAsync(await file.arrayBuffer()); } catch { throw new Error("한글 파일을 열 수 없습니다. 암호가 없는 HWPX 문서인지 확인해주세요."); }
  const sections = Object.keys(zip.files).filter(name => /^Contents\/section\d+\.xml$/.test(name)).sort((a,b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));
  if (!sections.length || sections.length > 50) throw new Error("일정이 들어 있는 한글 본문을 찾을 수 없습니다.");
  const xml: string[] = [];
  let size = 0;
  for (const name of sections) {
    const entry = zip.files[name] as JSZip.JSZipObject & { _data?: { uncompressedSize?: number } };
    if ((entry._data?.uncompressedSize || 0) > 10 * 1024 * 1024) throw new Error("본문이 너무 큰 한글 파일입니다.");
    const text = await entry.async("string"); size += text.length;
    if (size > 10 * 1024 * 1024) throw new Error("본문이 너무 큰 한글 파일입니다.");
    xml.push(text);
  }
  return parseEstimateHwpxSections(xml);
}
