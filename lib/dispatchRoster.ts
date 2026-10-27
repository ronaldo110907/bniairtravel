import type ExcelJS from "exceljs";

/** 생년월일과 성별로 확인 가능한 앞 7자리만 생성합니다. */
export function residentNumberPrefix(birth: unknown, sex: unknown): string {
  if (typeof birth !== "string" || typeof sex !== "string") return "";
  const match = /^(19\d{2}|20\d{2})-(\d{2})-(\d{2})$/.exec(birth.trim());
  if (!match) return "";
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)) return "";
  const gender = sex.trim().toUpperCase();
  const male = ["MR", "MSTR", "M"].includes(gender);
  const female = ["MS", "MISS", "MRS", "F"].includes(gender);
  if (!male && !female) return "";
  const digit = (Number(year) >= 2000 ? 3 : 1) + (female ? 1 : 0);
  return `${year.slice(2)}${month}${day}-${digit}`;
}

export interface DispatchPerson {
  no: number;
  name: string;
  lastName: string;
  firstName: string;
  sex: string;
  birth: string;
  passportNo: string;
  expiry: string;
}

export function fillDispatchRoster(sheet: ExcelJS.Worksheet, people: DispatchPerson[]) {
  const styles = Array.from({ length: 10 }, (_, index) =>
    structuredClone(sheet.getCell(8, index + 1).style));
  const height = sheet.getRow(8).height || 16.5;

  // 삭제 대상의 병합을 먼저 해제해야 행/열 삭제 후 병합이 남지 않습니다.
  for (const merge of [...sheet.model.merges]) {
    if (!/^A[1-6]:J[1-6]$/.test(merge)) sheet.unMergeCells(merge);
  }
  sheet.spliceColumns(11, Math.max(0, sheet.columnCount - 10));
  // ExcelJS의 끝부분 spliceRows 삭제는 일부 서식 행을 남기므로 모델을 잘라냅니다.
  const model = sheet.model as ExcelJS.WorksheetModel & { rows: ExcelJS.RowModel[] };
  const headerMerges = [...model.merges];
  model.rows = model.rows.filter((row) => row.number < 8);
  for (const merge of [...sheet.model.merges]) sheet.unMergeCells(merge);
  sheet.model = model;
  for (const merge of headerMerges) sheet.mergeCells(merge);

  people.forEach((person, index) => {
    const row = sheet.getRow(index + 8);
    row.height = height;
    const values = [person.no, person.name, person.lastName, person.firstName,
      person.sex, person.birth, residentNumberPrefix(person.birth, person.sex),
      person.passportNo, person.expiry, ""];
    values.forEach((value, column) => {
      const cell = row.getCell(column + 1);
      cell.value = value === "" || value == null ? null : value;
      cell.style = structuredClone(styles[column]);
      cell.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" },
      };
    });
    row.getCell(7).numFmt = "@";
  });
  sheet.pageSetup.printArea = `A1:J${7 + people.length}`;
  sheet.pageSetup.fitToPage = true;
  sheet.pageSetup.fitToWidth = 1;
  sheet.pageSetup.fitToHeight = 0;
}
