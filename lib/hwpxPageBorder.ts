/** A page-only border: cell/paragraph styles and content margins are unchanged. */
export function applyBluePageBorder(section: Document, header: Document) {
  const fills = header.getElementsByTagNameNS("*", "borderFills")[0];
  const source = fills?.getElementsByTagNameNS("*", "borderFill")[0];
  if (!fills || !source) throw new Error("한글 양식의 페이지 테두리 정보를 찾지 못했습니다.");
  const id = String(Math.max(...Array.from(fills.children).map(e => Number(e.getAttribute("id")) || 0)) + 1);
  const border = source.cloneNode(true) as Element;
  border.setAttribute("id", id);
  for (const name of ["leftBorder", "rightBorder", "topBorder", "bottomBorder"]) {
    const side = border.getElementsByTagNameNS("*", name)[0];
    if (!side) throw new Error("한글 양식의 테두리 구성이 올바르지 않습니다.");
    side.setAttribute("type", "SOLID"); side.setAttribute("width", "0.25 mm"); side.setAttribute("color", "#2563EB");
  }
  fills.append(border); fills.setAttribute("itemCnt", String(fills.children.length));
  for (const page of Array.from(section.getElementsByTagNameNS("*", "pageBorderFill"))) {
    page.setAttribute("borderFillIDRef", id); page.setAttribute("textBorder", "PAPER");
    const offset = page.getElementsByTagNameNS("*", "offset")[0];
    if (offset) for (const edge of ["left", "right", "top", "bottom"]) offset.setAttribute(edge, "1417");
  }
  for (const visibility of Array.from(section.getElementsByTagNameNS("*", "visibility"))) visibility.setAttribute("border", "SHOW_ALL");
}
