import JSZip from "jszip";

export type InvoiceDocument = {
  reservationId: string;
  name: string;
  product: string;
  departureDate: string;
  people: { name?: string | null; passport_name?: string | null; passport_sex?: string | null; passport_birth?: string | null; passport_number?: string | null; passport_expiry?: string | null; is_guide?: boolean | null }[];
  sender: string;
  receiver: string;
  date: string;
  invoiceType: "deposit" | "interim" | "balance";
  customerType: "individual" | "agency";
  unitPrice: number;
  total: number;
  previous: number;
  current: number;
  commission: number;
  dueDate: string;
  notice: string;
  account: { name: string; number: string; owner: string };
};

const HP = "http://www.hancom.co.kr/hwpml/2011/paragraph";
const all = (node: Document | Element, name: string) => Array.from(node.getElementsByTagNameNS("*", name));
const child = (node: Element, name: string) => {
  const result = Array.from(node.children).find(e => e.localName === name);
  if (!result) throw new Error(`인보이스 양식 항목이 없습니다: ${name}`);
  return result;
};
const rows = (table: Element) => Array.from(table.children).filter(e => e.localName === "tr");
const cells = (row: Element) => Array.from(row.children).filter(e => e.localName === "tc");
const money = (value: number) => `${value.toLocaleString("ko-KR")} 원`;
export const invoiceLabel = (kind: InvoiceDocument["invoiceType"]) => ({ deposit: "계약금", interim: "중도금", balance: "잔금" })[kind];
export function invoiceFilename(data: InvoiceDocument) {
  return `${data.departureDate.replaceAll("-", "").slice(2)}_BNI_Invoice_${data.name}_${invoiceLabel(data.invoiceType)}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_") + ".hwpx";
}

function put(cell: Element, value: string) {
  const sub = child(cell, "subList"), old = child(sub, "p");
  const template = old.cloneNode(false) as Element;
  const char = child(old, "run").getAttribute("charPrIDRef") ?? "0";
  sub.replaceChildren();
  for (const line of value.split(/\r?\n/)) {
    const p = template.cloneNode(false) as Element;
    const run = cell.ownerDocument.createElementNS(HP, "hp:run");
    run.setAttribute("charPrIDRef", char);
    const t = cell.ownerDocument.createElementNS(HP, "hp:t");
    t.textContent = line;
    run.append(t); p.append(run); sub.append(p);
  }
}

function fill(table: Element, values: string[][]) {
  const old = rows(table);
  values.forEach((row, i) => row.forEach((value, j) => put(cells(old[i])[j], value)));
}

/** Fills native HWPX text/tables; the approved v4 artwork stays embedded. */
export async function generateInvoiceHwpx(data: InvoiceDocument, template?: ArrayBuffer): Promise<Blob> {
  if (!template) {
    const response = await fetch("/templates/invoice-master.hwpx");
    if (!response.ok) throw new Error("인보이스 한글 양식을 불러오지 못했습니다.");
    template = await response.arrayBuffer();
  }
  const zip = await JSZip.loadAsync(template);
  const xml = await zip.file("Contents/section0.xml")?.async("string");
  if (!xml) throw new Error("인보이스 한글 양식이 올바르지 않습니다.");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (all(doc, "parsererror").length) throw new Error("인보이스 한글 양식을 읽지 못했습니다.");
  const tables = all(doc, "tbl");
  if (tables.length !== 7) throw new Error("인보이스 한글 양식의 표 구성이 다릅니다.");
  const guides = data.people.filter(p => p.is_guide === true).length;
  const paying = data.people.length - guides;
  const count = `${data.people.length}명${guides ? ` (청구 ${paying}명 · 인솔자 FREE ${guides}명)` : ""}`;
  const name = `${data.name}${data.people.length > 1 ? ` 외 ${data.people.length - 1}명` : ""}`;
  const balance = Math.max(data.total - data.previous - data.current - data.commission, 0);
  fill(tables[0], [["수신", data.receiver], ["발신", `B.N.I(비엔아이)항공여행 / ${data.sender}`], ["발신일", data.date]]);
  const booking = [["예약자", name], ["상품 / 출발일", `${data.product} / ${data.departureDate}`], ["인원", count]];
  fill(tables[1], [...booking, ["청구구분", `${data.customerType === "agency" ? "여행사" : "개인고객"} / ${invoiceLabel(data.invoiceType)} 청구`]]);
  fill(tables[2], [
    ["여행경비", `1인 금액 ${money(data.unitPrice)} × ${paying}명     총액 ${money(data.total)}`],
    ["이전 청구금액", money(data.previous)], ["이번 청구금액", money(data.current)],
    ["커미션", money(data.commission)], [data.invoiceType === "deposit" ? "잔금" : "최종결제", money(balance)],
    ["입금하실 금액", money(data.current)], ["입금기한", data.dueDate ? `${data.dueDate}까지 입금 부탁드립니다.` : ""],
    ["추가안내", data.notice],
  ]);
  if (data.customerType === "individual") rows(tables[2])[3].remove();
  fill(tables[3], [["은행 / 예금주", `${data.account.name} / ${data.account.owner}`], ["계좌번호", data.account.number]]);
  fill(tables[4], booking);
  const list = tables[5], listRows = rows(list), rowTemplate = listRows[1].cloneNode(true) as Element;
  // An inline (treatAsChar) table is laid out as one oversized character by
  // Hancom: it moves to the next page and clips rows beyond the page bottom.
  // A flow-with-text table can split at cell boundaries and repeat its heading.
  list.setAttribute("pageBreak", "CELL");
  list.setAttribute("repeatHeader", "1");
  child(list, "pos").setAttribute("treatAsChar", "0");
  child(list, "pos").setAttribute("flowWithText", "1");
  child(list, "pos").setAttribute("affectLSpacing", "0");
  fill(list, [["No", "한글명", "영문명", "성별", "생년월일", "여권번호", "여권만료일"]]);
  listRows.slice(1).forEach(row => row.remove());
  data.people.forEach((person, i) => {
    const row = rowTemplate.cloneNode(true) as Element;
    const values = [String(i + 1), person.name, person.passport_name, person.passport_sex, person.passport_birth, person.passport_number, person.passport_expiry];
    cells(row).forEach((cell, j) => put(cell, values[j] || "-"));
    list.append(row);
  });
  for (const text of all(doc, "t")) if (text.textContent === "{{invoiceSubtitle}}") text.textContent = `${invoiceLabel(data.invoiceType)} 청구 · 발행일 ${data.date}`;
  // Reflow wrapped values and arbitrary passenger counts without fixed blank rows.
  tables.forEach(table => {
    const tableRows = rows(table);
    table.setAttribute("rowCnt", String(tableRows.length));
    let totalHeight = 0;
    tableRows.forEach((row, i) => {
      const rowCells = cells(row);
      const height = Math.max(2100, ...rowCells.filter(c => child(c, "cellSpan").getAttribute("rowSpan") === "1").map(c => {
        const width = Number(child(c, "cellSz").getAttribute("width")) - 1000;
        const lineCount = all(c, "p").reduce((sum, p) => {
          const units = Array.from(p.textContent ?? "").reduce((n, ch) => n + (ch.charCodeAt(0) > 255 ? 1000 : 570), 0);
          return sum + Math.max(1, Math.ceil(units / width));
        }, 0);
        return lineCount * 1200 + 600;
      }), table === tables[3] ? 4500 : 0);
      rowCells.forEach(c => {
        child(c, "cellAddr").setAttribute("rowAddr", String(i));
        if (child(c, "cellSpan").getAttribute("rowSpan") === "1") child(c, "cellSz").setAttribute("height", String(height));
      });
      totalHeight += height;
    });
    child(table, "sz").setAttribute("height", String(totalHeight));
  });
  // Drop stale layout caches; Hancom recalculates native paragraphs when opened.
  all(doc, "linesegarray").forEach(e => e.remove());
  zip.file("Contents/section0.xml", new XMLSerializer().serializeToString(doc));
  zip.file("Preview/PrvText.txt", all(doc, "t").map(t => t.textContent).join("\n"));
  zip.remove("Preview/PrvImage.png");
  return zip.generateAsync({ type: "blob", mimeType: "application/hwp+zip", compression: "DEFLATE" });
}

export function downloadInvoiceHwpx(blob: Blob, data: InvoiceDocument) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = invoiceFilename(data);
  document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
