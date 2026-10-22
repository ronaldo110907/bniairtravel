import JSZip from "jszip";
import { calendarDate, displayDate, type ConfirmationInput } from "./model";

const HP = "http://www.hancom.co.kr/hwpml/2011/paragraph";
const all = (node: Document | Element, name: string) => Array.from(node.getElementsByTagNameNS("*", name));
const child = (node: Element, name: string) => {
  const found = Array.from(node.children).find(e => e.localName === name);
  if (!found) throw new Error(`확정서 양식 항목이 없습니다: ${name}`);
  return found;
};
const num = (e: Element, key: string) => Number(e.getAttribute(key));
const parse = (text: string) => {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("확정서 양식을 읽지 못했습니다.");
  return doc;
};
function put(cell: Element, value: string, para?: string, char?: string) {
  const sub = child(cell, "subList"), old = child(sub, "p");
  const pTemplate = old.cloneNode(false) as Element;
  const charId = char ?? child(old, "run").getAttribute("charPrIDRef") ?? "10";
  pTemplate.setAttribute("id", "0");
  if (para) { pTemplate.setAttribute("paraPrIDRef", para); pTemplate.setAttribute("styleIDRef", "0"); }
  sub.replaceChildren();
  for (const line of value.split(/\r?\n/)) {
    const p = pTemplate.cloneNode(false) as Element;
    const run = cell.ownerDocument.createElementNS(HP, "hp:run");
    const t = cell.ownerDocument.createElementNS(HP, "hp:t");
    t.textContent = line; run.setAttribute("charPrIDRef", charId); run.append(t); p.append(run); sub.append(p);
  }
}

/** Uses the same page box and combined table height as the approved master. */
function sizePage(doc: Document, header: Document) {
  const tables = all(doc, "tbl"), title = child(child(child(child(tables[0], "tr"), "tc"), "subList"), "p");
  const titleId = child(title, "run").getAttribute("charPrIDRef");
  const chars = all(header, "charPr");
  for (const pp of all(header, "paraPr")) {
    for (const spacing of all(pp, "lineSpacing")) { spacing.setAttribute("type", "PERCENT"); spacing.setAttribute("value", "105"); }
    for (const margin of [...all(pp, "prev"), ...all(pp, "next")]) margin.setAttribute("value", "0");
  }
  const target = 78785;
  let heights: number[][] = [];
  let chosenSize = 950;
  for (const size of [950, 900, 850, 800]) {
    chosenSize = size;
    for (const c of chars) c.setAttribute("height", c.getAttribute("id") === titleId ? "1500" : String(size));
    const fontSizes = new Map(chars.map(c => [c.getAttribute("id"), num(c, "height")]));
    heights = tables.map(table => {
      const rows = Array.from(table.children).filter(e => e.localName === "tr");
      const rowHeights = rows.map(() => 0);
      const needs = all(table, "tc").map(cell => {
        const addr = child(cell, "cellAddr"), span = child(cell, "cellSpan"), margin = child(cell, "cellMargin");
        cell.setAttribute("hasMargin", "1"); margin.setAttribute("top", "70"); margin.setAttribute("bottom", "70");
        const width = num(child(cell, "cellSz"), "width") - num(margin, "left") - num(margin, "right") - 180;
        let height = 160;
        for (const p of all(cell, "p")) {
          let units = 0, lineHeight = size;
          for (const run of all(p, "run")) {
            const fontSize = fontSizes.get(run.getAttribute("charPrIDRef")) ?? size;
            lineHeight = Math.max(lineHeight, fontSize);
            for (const c of run.textContent ?? "") units += (c.charCodeAt(0) > 255 ? 1 : 0.57) * fontSize;
          }
          height += Math.max(1, Math.ceil(units / Math.max(1, width))) * lineHeight * 1.1;
        }
        const row = num(addr, "rowAddr"), count = num(span, "rowSpan");
        const needed = Math.ceil(height);
        if (count === 1) rowHeights[row] = Math.max(rowHeights[row], needed);
        return { row, count, needed };
      });
      for (const n of needs) {
        const present = rowHeights.slice(n.row, n.row + n.count).reduce((a, b) => a + b, 0);
        if (present < n.needed) rowHeights[n.row] += n.needed - present;
      }
      return rowHeights;
    });
    if (heights.flat().reduce((a, b) => a + b, 0) <= 76000) break;
  }
  const used = heights.flat().reduce((a, b) => a + b, 0);
  if (used > 76000) throw new Error("내용이 한 페이지 분량을 초과합니다. 상품 일정 문구를 줄인 후 다시 생성해주세요. 내용은 삭제되지 않았습니다.");
  const dayRows = Array.from(tables[1].children).filter(e => e.localName === "tr")
    .flatMap((row, i) => i > 0 && i < heights[1].length - 1 && all(row, "tc").length === 6 ? [i] : []);
  const weight = dayRows.reduce((n, i) => n + heights[1][i], 0);
  let remainder = target - used;
  for (const i of dayRows.slice(0, -1)) {
    const extra = Math.round((target - used) * heights[1][i] / weight);
    heights[1][i] += extra; remainder -= extra;
  }
  heights[1][dayRows[dayRows.length - 1]] += remainder;
  tables.forEach((table, index) => {
    for (const cell of all(table, "tc")) {
      const row = num(child(cell, "cellAddr"), "rowAddr"), count = num(child(cell, "cellSpan"), "rowSpan");
      child(cell, "cellSz").setAttribute("height", String(heights[index].slice(row, row + count).reduce((a, b) => a + b, 0)));
    }
    child(table, "sz").setAttribute("height", String(heights[index].reduce((a, b) => a + b, 0)));
  });
  return chosenSize / 100;
}

export async function generateHwpx(input: ConfirmationInput, template?: ArrayBuffer) {
  const { product } = input;
  if (!product.days.length || product.days.length > 20 || product.days.filter(d => d.hotel).length !== product.nights)
    throw new Error("상품 일수와 호텔 숙박 수를 확인해주세요.");
  if (!input.people.trim() || !input.groupName.trim()) throw new Error("단체명과 인원을 입력해주세요.");
  const start = calendarDate(input.departureDate), end = calendarDate(input.departureDate, product.days.length - 1);
  if (!template) {
    const response = await fetch("/templates/confirmation-master.hwpx", { cache: "no-cache" });
    if (!response.ok) throw new Error("확정서 양식을 불러오지 못했습니다.");
    template = await response.arrayBuffer();
  }
  const zip = await JSZip.loadAsync(template);
  const section = zip.file("Contents/section0.xml"), headerFile = zip.file("Contents/header.xml");
  if (!section || !headerFile) throw new Error("확정서 양식이 올바르지 않습니다.");
  const doc = parse(await section.async("string")), header = parse(await headerFile.async("string"));
  const tables = all(doc, "tbl");
  if (tables.length !== 2) throw new Error("확정서 표 구조가 올바르지 않습니다.");
  const [summary, itinerary] = tables;
  const cell = (r: number, c: number) => {
    const found = all(summary, "tc").find(x => num(child(x, "cellAddr"), "rowAddr") === r && num(child(x, "cellAddr"), "colAddr") === c);
    if (!found) throw new Error("확정서 기본정보 칸이 없습니다.");
    return found;
  };
  put(cell(0, 0), product.title);
  put(cell(1, 1), `${displayDate(start)} ~ ${displayDate(end)} ${product.nights}박${product.days.length}일`);
  put(cell(1, 3), input.people); put(cell(2, 1), input.pickupSign || "미입력"); put(cell(2, 3), input.rooms || "미정");
  put(cell(3, 1), input.guide || "미입력"); put(cell(3, 3), input.vehicle || "미정");
  put(cell(4, 1), [input.meeting, input.meetingContact && `미팅 담당자: ${input.meetingContact}`].filter(Boolean).join("\n"), "22", "10");
  put(cell(5, 1), product.included, "22", "10"); put(cell(6, 1), product.excluded, "22", "10");
  put(cell(7, 1), product.options, "22", "10"); put(cell(8, 1), product.shopping, "22", "10");
  put(cell(9, 1), `단체명: ${input.groupName}\n${product.notice}`, "31", "10");
  const rows = Array.from(itinerary.children).filter(e => e.localName === "tr");
  const bodyTemplate = rows[3].cloneNode(true) as Element, hotelTemplate = rows[4].cloneNode(true) as Element;
  const footer = rows[rows.length - 1].cloneNode(true) as Element;
  rows.slice(1).forEach(r => r.remove());
  let rowIndex = 1;
  product.days.forEach((day, index) => {
    const row = bodyTemplate.cloneNode(true) as Element, date = calendarDate(input.departureDate, index);
    const dateLabel = `제${index + 1}일\n${date.toISOString().slice(5, 10).replace("-", "/")}\n(${"일월화수목금토"[date.getUTCDay()]})`;
    const values = [dateLabel, day.region, day.transport, day.time, day.schedule, day.meals];
    all(row, "tc").forEach((c, col) => {
      child(c, "cellAddr").setAttribute("rowAddr", String(rowIndex));
      child(c, "cellSpan").setAttribute("rowSpan", day.hotel && (col === 0 || col === 5) ? "2" : "1");
      put(c, values[col], col === 4 ? "37" : col === 0 ? "24" : col === 5 ? "38" : "32", "10");
    });
    itinerary.append(row); rowIndex++;
    if (day.hotel) {
      const row = hotelTemplate.cloneNode(true) as Element, c = child(row, "tc");
      child(c, "cellAddr").setAttribute("rowAddr", String(rowIndex)); put(c, `HOTEL: ${day.hotel}`, "17", "10");
      itinerary.append(row); rowIndex++;
    }
  });
  child(child(footer, "tc"), "cellAddr").setAttribute("rowAddr", String(rowIndex));
  put(child(footer, "tc"), "상기 일정은 현지 사정에 의해 변경될 수 있습니다.", "25", "31");
  itinerary.append(footer); itinerary.setAttribute("rowCnt", String(rowIndex + 1));
  all(doc, "linesegarray").forEach(e => e.remove());
  const fontSize = sizePage(doc, header);
  zip.file("Contents/section0.xml", new XMLSerializer().serializeToString(doc));
  zip.file("Contents/header.xml", new XMLSerializer().serializeToString(header));
  zip.file("Preview/PrvText.txt", all(doc, "t").map(t => t.textContent).join("\n"));
  zip.remove("Preview/PrvImage.png");
  zip.file("mimetype", "application/hwp+zip", { compression: "STORE" });
  const bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return { bytes, fontSize };
}



