import type { sheets_v4 } from "googleapis";
import { PRICE_LABEL, resolveXiamenLayout } from "./xiamen-seat-sync";

/** One-time row insertion plan. Runtime sync never inserts rows or changes column widths. */
export function buildXiamenPriceLayout(sheet: sheets_v4.Schema$Sheet) {
  const blocks = resolveXiamenLayout(sheet);
  const variants = blocks.flatMap(b => b.variants);
  if (variants.every(v => v.priceRow !== null)) return { requests: [] as sheets_v4.Schema$Request[], preview: sheet };
  const sheetId = sheet.properties!.sheetId!;
  const requests: sheets_v4.Schema$Request[] = [];
  const preview = JSON.parse(JSON.stringify(sheet)) as sheets_v4.Schema$Sheet;
  const rows = preview.data![0].rowData!;
  const indices = variants.map(v => v.row + 1).sort((a, b) => b - a);
  for (const index of indices) {
    requests.push({ insertDimension: { range: { sheetId, dimension: "ROWS", startIndex: index, endIndex: index + 1 }, inheritFromBefore: true } });
    rows.splice(index, 0, { values: [{}, { userEnteredValue: { stringValue: PRICE_LABEL } }] });
  }
  // Native Sheets adjusts existing formulas, merges and conditional ranges during insertion.
  // This preview is for label/date resolution, not for evaluating shifted cached formulas.
  preview.conditionalFormats = [];
  const nextBlocks = resolveXiamenLayout(preview);
  for (const b of nextBlocks) {
    for (const v of b.variants) {
      const row = v.priceRow!;
      const range = { sheetId, startRowIndex: row, endRowIndex: row + 1, startColumnIndex: 1, endColumnIndex: 20 };
      requests.push({ copyPaste: { source: { ...range, startRowIndex: v.row, endRowIndex: v.row + 1 }, destination: range, pasteType: "PASTE_FORMAT" } });
      requests.push({ updateCells: { range: { ...range, endColumnIndex: 2 }, rows: [{ values: [{ userEnteredValue: { stringValue: PRICE_LABEL } }] }], fields: "userEnteredValue" } });
      requests.push({ repeatCell: { range, cell: { userEnteredFormat: {
        backgroundColor: { red: .94, green: .97, blue: 1 }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", wrapStrategy: "CLIP",
        textFormat: { fontFamily: "Arial", fontSize: 9, bold: false, foregroundColor: { red: .12, green: .28, blue: .46 } },
      } }, fields: "userEnteredFormat.backgroundColor,userEnteredFormat.horizontalAlignment,userEnteredFormat.verticalAlignment,userEnteredFormat.wrapStrategy,userEnteredFormat.textFormat" } });
      requests.push({ repeatCell: { range: { ...range, startColumnIndex: 2, endColumnIndex: b.totalColumn }, cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: '#,##0"원"' } } }, fields: "userEnteredFormat.numberFormat" } });
      requests.push({ updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: row, endIndex: row + 1 }, properties: { pixelSize: 23 }, fields: "pixelSize" } });
      if (b.totalColumn === 18) requests.push({ mergeCells: { range: { ...range, startColumnIndex: 18 }, mergeType: "MERGE_ALL" } });
    }
  }
  // Include the final price row in the vertically merged course label.
  const last = nextBlocks[1];
  const courseRange = { sheetId, startRowIndex: last.header, endRowIndex: last.variants.at(-1)!.priceRow! + 1, startColumnIndex: 0, endColumnIndex: 1 };
  requests.push({ unmergeCells: { range: courseRange } });
  requests.push({ mergeCells: { range: courseRange, mergeType: "MERGE_ALL" } });
  return { requests, preview };
}
