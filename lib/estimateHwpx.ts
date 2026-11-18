import JSZip from "jszip";
import { applyBluePageBorder } from "./hwpxPageBorder";

export type EstimateDocument = {
  priceMode: "combined" | "split";
  form: {
    recipient: string; sender: string; sentDate: string; productName: string; travelPeriod: string;
    includes: string; excludes: string; shopping: string; options: string; remarks: string;
    combinedPrice: string; combinedCurrency: string; airfare: string; airfareCurrency: string;
    landCost: string; landCurrency: string;
  };
  days: { region: string; transport: string; time: string; schedule: string;
    breakfast: string; lunch: string; dinner: string; hotel: string }[];
};

const HP = "http://www.hancom.co.kr/hwpml/2011/paragraph";
const all = (node: Document | Element, name: string) => Array.from(node.getElementsByTagNameNS("*", name));
const child = (node: Element, name: string) => {
  const found = Array.from(node.children).find(e => e.localName === name);
  if (!found) throw new Error("견적서 한글 양식의 구성이 올바르지 않습니다.");
  return found;
};
const parse = (xml: string) => {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (all(doc, "parsererror").length) throw new Error("견적서 한글 양식을 읽지 못했습니다.");
  return doc;
};

function money(value: string, currency: string) {
  if (!value) return "-";
  const number = Number(value);
  const text = Number.isNaN(number) ? value : number.toLocaleString("ko-KR");
  return currency === "KRW" ? `${text}원` : currency === "USD" ? `$${text}` : currency === "CNY" ? `¥${text}` : text;
}

export function estimatePriceRows(data: EstimateDocument): string[][] {
  const f = data.form;
  if (data.priceMode === "combined") return [["입금가", money(f.combinedPrice, f.combinedCurrency)]];
  const rows: string[][] = [];
  if (f.airfare) rows.push(["항공료", money(f.airfare, f.airfareCurrency)]);
  if (f.landCost) rows.push(["지상비", money(f.landCost, f.landCurrency)]);
  if (f.airfareCurrency === f.landCurrency && (Number(f.airfare) > 0 || Number(f.landCost) > 0)) {
    rows.push(["총 입금가", money(String(Number(f.airfare || 0) + Number(f.landCost || 0)), f.airfareCurrency)]);
  }
  return rows.length ? rows : [["입금가", "-"]];
}

// Bound cell height so even an unusually long pasted paragraph can flow to
// subsequent pages. Array.from preserves emoji/surrogate pairs; nothing is cut.
export function estimateTextChunks(value: string, limit = 1000): string[] {
  const result: string[] = [];
  let chunk = "", count = 0, lines = 1;
  for (const c of Array.from(value.replace(/\r\n?/g, "\n"))) {
    chunk += c; count++;
    if (c === "\n") lines++;
    if (count >= limit || lines >= 18) {
      result.push(chunk); chunk = ""; count = 0; lines = 1;
    }
  }
  if (chunk || !result.length) result.push(chunk);
  return result;
}

/** Fit ordinary estimates on A4 without dropping text or reducing below 8 pt. */
function compactLayout(doc: Document, header: Document) {
  const tables = all(doc, "tbl");
  const page = all(doc, "pagePr")[0];
  const margins = child(page, "margin");
  margins.setAttribute("top", "1701"); margins.setAttribute("bottom", "1701");
  for (const p of all(header, "paraPr")) {
    if (!["42", "43", "44"].includes(p.getAttribute("id") || "")) continue;
    for (const spacing of all(p, "lineSpacing")) spacing.setAttribute("value", "105");
    for (const m of [...all(p, "prev"), ...all(p, "next")]) m.setAttribute("value", "0");
  }
  for (const c of all(header, "charPr")) if (c.getAttribute("id") === "39") c.setAttribute("height", "1500");
  // Reserve the actual artwork height, title, anchors and footer, plus a safety
  // allowance for Hancom font metrics. Only table/body typography is shrunk.
  const pictureHeight = all(doc, "pic").reduce((sum, pic) => sum + Number(child(pic, "sz").getAttribute("height")), 0);
  const available = Number(page.getAttribute("height")) - 3402 - pictureHeight - 9000 - tables.length * 180;
  for (const font of [950, 900, 850, 800]) {
    for (const c of all(header, "charPr")) if (["38", "40"].includes(c.getAttribute("id") || "")) c.setAttribute("height", String(font));
    let used = 0;
    for (const table of tables) {
      const outer = child(table, "outMargin"); outer.setAttribute("top", "0"); outer.setAttribute("bottom", "0");
      let tableHeight = 0;
      for (const row of Array.from(table.children).filter(e => e.localName === "tr")) {
        const cells = Array.from(row.children).filter(e => e.localName === "tc");
        const height = Math.max(...cells.map(cell => {
          const margin = child(cell, "cellMargin"); margin.setAttribute("top", "60"); margin.setAttribute("bottom", "60");
          const width = Number(child(cell, "cellSz").getAttribute("width")) - 600;
          const lines = all(cell, "p").reduce((sum, p) => {
            const units = Array.from(p.textContent || "").reduce((n, c) => n + (c.codePointAt(0)! > 255 ? 1 : 0.57) * font, 0);
            return sum + Math.max(1, Math.ceil(units / Math.max(width, 1)));
          }, 0);
          return Math.ceil(lines * font * 1.05 + 160);
        }));
        for (const cell of cells) child(cell, "cellSz").setAttribute("height", String(height));
        tableHeight += height;
      }
      child(table, "sz").setAttribute("height", String(tableHeight));
      used += tableHeight;
    }
    if (used <= available) break;
  }
}

export function estimateFilename(data: EstimateDocument) {
  return `BNI_견적서_${data.form.productName || "Estimate"}_${data.form.sentDate}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_") + ".hwpx";
}

export async function generateEstimateHwpx(data: EstimateDocument, template?: ArrayBuffer): Promise<Blob> {
  if (!template) {
    const response = await fetch("/templates/invoice-master.hwpx");
    if (!response.ok) throw new Error("견적서 한글 양식을 불러오지 못했습니다.");
    template = await response.arrayBuffer();
  }
  const zip = await JSZip.loadAsync(template);
  const xml = await zip.file("Contents/section0.xml")?.async("string");
  const headerXml = await zip.file("Contents/header.xml")?.async("string");
  if (!xml || !headerXml) throw new Error("견적서 한글 양식이 올바르지 않습니다.");
  const doc = parse(xml), header = parse(headerXml), root = doc.documentElement;
  // Set every text style, including the default typing style, to Malgun Gothic.
  // Resolve per-language font IDs from the template instead of assuming an ID.
  for (const face of all(header, "fontface")) {
    const font = Array.from(face.children).find(e => e.localName === "font" && e.getAttribute("face") === "맑은 고딕");
    const id = font?.getAttribute("id");
    const lang = face.getAttribute("lang")?.toLowerCase();
    if (!id || !lang) throw new Error("견적서 양식에 맑은 고딕 글꼴이 없습니다.");
    for (const ref of all(header, "fontRef")) ref.setAttribute(lang, id);
  }
  const original = Array.from(root.children);
  const tableTemplate = all(doc, "tbl")[0];
  const cellTemplates = all(child(tableTemplate, "tr"), "tc");
  if (!original[1] || !all(original[1], "pic").length || cellTemplates.length !== 2) throw new Error("견적서 양식의 머리말과 표를 확인해주세요.");
  let nextId = 20000;

  function paragraph(text: string, char = "38", para = "42") {
    const p = doc.createElementNS(HP, "hp:p");
    for (const [key, value] of Object.entries({ id: "0", paraPrIDRef: para, styleIDRef: "0", pageBreak: "0", columnBreak: "0", merged: "0" })) p.setAttribute(key, value);
    const run = doc.createElementNS(HP, "hp:run");
    run.setAttribute("charPrIDRef", char);
    const t = doc.createElementNS(HP, "hp:t");
    t.textContent = text; run.append(t); p.append(run);
    return p;
  }

  function table(values: string[][], widths: number[], heading = false) {
    const t = tableTemplate.cloneNode(true) as Element;
    Array.from(t.children).filter(e => e.localName === "tr").forEach(e => e.remove());
    t.setAttribute("id", String(nextId++));
    t.setAttribute("rowCnt", String(values.length)); t.setAttribute("colCnt", String(widths.length));
    t.setAttribute("pageBreak", "CELL"); t.setAttribute("repeatHeader", heading ? "1" : "0");
    const pos = child(t, "pos");
    pos.setAttribute("treatAsChar", "0"); pos.setAttribute("flowWithText", "1"); pos.setAttribute("affectLSpacing", "0");
    const size = child(t, "sz");
    size.setAttribute("width", String(widths.reduce((sum, w) => sum + w, 0)));
    let height = 0;
    values.forEach((row, i) => {
      const tr = doc.createElementNS(HP, "hp:tr");
      const rowHeight = Math.max(1800, ...row.map((value, j) => {
        const lines = value.split("\n").reduce((sum, line) => {
          const units = Array.from(line).reduce((n, c) => n + (c.codePointAt(0)! > 255 ? 900 : 500), 0);
          return sum + Math.max(1, Math.ceil(units / (widths[j] - 500)));
        }, 0);
        return lines * 1100 + 500;
      }));
      height += rowHeight;
      row.forEach((value, j) => {
        const isLabel = heading ? i === 0 : j === 0;
        const c = cellTemplates[isLabel ? 0 : 1].cloneNode(true) as Element;
        c.setAttribute("header", heading && i === 0 ? "1" : "0");
        const sub = child(c, "subList"); sub.setAttribute("vertAlign", "TOP");
        sub.replaceChildren(...value.split("\n").map(line => paragraph(line, isLabel ? "40" : "38")));
        const addr = child(c, "cellAddr"); addr.setAttribute("colAddr", String(j)); addr.setAttribute("rowAddr", String(i));
        const span = child(c, "cellSpan"); span.setAttribute("rowSpan", "1"); span.setAttribute("colSpan", "1");
        const sz = child(c, "cellSz"); sz.setAttribute("width", String(widths[j])); sz.setAttribute("height", String(rowHeight));
        const margin = child(c, "cellMargin"); margin.setAttribute("left", "250"); margin.setAttribute("right", "250");
        tr.append(c);
      });
      t.append(tr);
    });
    size.setAttribute("height", String(height));
    const wrapper = paragraph(""); child(wrapper, "run").prepend(t); root.append(wrapper);
  }

  function labelled(label: string, value: string) {
    const chunks = estimateTextChunks(value || "-");
    table(chunks.map((text, i) => [i === 0 ? label : "", text]), [8500, 43828]);
  }

  // Retain only section settings and the embedded BNI header artwork.
  root.replaceChildren(original[0], original[1], paragraph("견 적 서", "39", "43"));
  for (const c of all(header, "charPr")) {
    if (["38", "40"].includes(c.getAttribute("id") || "")) c.setAttribute("height", "900");
  }
  const f = data.form;
  table([
    ["수신 / 발신", `${f.recipient || "-"} / ${f.sender ? `BNI항공 ${f.sender}` : "-"}`],
    ["발송일", f.sentDate],
    ["상품명", f.productName || "-"],
    ["여행기간", f.travelPeriod || "-"],
  ].flatMap(([label, value]) => estimateTextChunks(value).map((text, i) => [i === 0 ? label : "", text])), [8500, 43828]);
  root.append(paragraph("■ 견적 금액", "40"));
  table(estimatePriceRows(data), [8500, 43828]);
  for (const [label, value] of [["포함사항", f.includes], ["불포함사항", f.excludes], ["쇼핑", f.shopping], ["옵션", f.options]]) {
    if (value) labelled(label, value);
  }
  root.append(paragraph("■ 상세 일정", "40"));
  const scheduleRows = [["일자", "지역", "교통", "시간", "상세일정 / 호텔", "식사"]];
  data.days.forEach((day, i) => {
    const meals = [["조", day.breakfast], ["중", day.lunch], ["석", day.dinner]].filter(([, value]) => value).map(([label, value]) => `${label} ${value}`).join("\n");
    const schedule = `${day.schedule || "-"}${day.hotel ? `\nHOTEL : ${day.hotel}` : ""}`;
    const fields = [day.region || "-", day.transport || "-", day.time || "-", schedule, meals || "-"];
    const chunks = fields.map((value, j) => estimateTextChunks(value, j === 3 ? 850 : 100));
    for (let n = 0; n < Math.max(...chunks.map(c => c.length)); n++) {
      scheduleRows.push([n === 0 ? `DAY ${i + 1}` : "", ...chunks.map(c => c[n] ?? "")]);
    }
  });
  table(scheduleRows, [3500, 4500, 5000, 4500, 26328, 8500], true);
  if (f.remarks) labelled("비고", f.remarks);
  root.append(paragraph("상기 일정은 현지 및 항공 사정에 따라 변경될 수 있습니다.", "42"));
  compactLayout(doc, header);
  applyBluePageBorder(doc, header);
  all(doc, "linesegarray").forEach(e => e.remove());
  zip.file("Contents/section0.xml", new XMLSerializer().serializeToString(doc));
  zip.file("Contents/header.xml", new XMLSerializer().serializeToString(header));
  zip.file("Preview/PrvText.txt", all(doc, "t").map(t => t.textContent).join("\n"));
  zip.remove("Preview/PrvImage.png");
  return zip.generateAsync({ type: "blob", mimeType: "application/hwp+zip", compression: "DEFLATE" });
}

export async function downloadEstimateHwpx(data: EstimateDocument) {
  const blob = await generateEstimateHwpx(data);
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = estimateFilename(data);
  document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
