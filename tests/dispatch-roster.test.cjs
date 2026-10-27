const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const ExcelJS = require('exceljs');
const exportsFromTs = {};
new Function('exports', ts.transpileModule(fs.readFileSync('lib/dispatchRoster.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText)(exportsFromTs);
const { residentNumberPrefix, fillDispatchRoster } = exportsFromTs;

test('birth and supported gender titles produce only the requested identifier prefix', () => {
  for (const [birth, sex, expected] of [
    ['1975-04-05', 'MR', '750405-1'], ['1975-04-05', 'MS', '750405-2'],
    ['1999-12-31', 'M', '991231-1'], ['2000-01-01', 'MSTR', '000101-3'],
    ['2000-02-29', 'MISS', '000229-4'], ['2004-04-05', 'F', '040405-4'],
    ['1975-04-05', ' mrs ', '750405-2'],
  ]) assert.equal(residentNumberPrefix(birth, sex), expected);
  for (const birth of [null, '', '1900-02-29', '2001-02-29', '1975-13-01', '1975-04-31', '1975-00-01', '1975-01-00', '75-04-05', '1800-01-01']) {
    assert.equal(residentNumberPrefix(birth, 'MR'), '');
  }
  for (const sex of [null, '', 'X']) assert.equal(residentNumberPrefix('1975-04-05', sex), '');
});

for (const count of [0, 1, 10, 30, 31, 51]) {
  test(`exported workbook contains exactly ${count} bordered people and no K column`, async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('public/templates/dispatch-template.xlsx');
    const sheet = workbook.worksheets[0];
    const header = sheet.getCell('A7').value;
    fillDispatchRoster(sheet, Array.from({ length: count }, (_, i) => ({
      no: i + 1, name: `가상여행자${i + 1}`, lastName: 'TEST', firstName: 'PERSON',
      sex: i % 2 ? 'MS' : 'MR', birth: '1975-04-05', passportNo: 'SYNTHETIC', expiry: '2030-01-01',
    })));
    const bytes = await workbook.xlsx.writeBuffer();
    const reopened = new ExcelJS.Workbook();
    await reopened.xlsx.load(bytes);
    const result = reopened.worksheets[0];
    assert.equal(result.rowCount, count + 7);
    assert.equal(result.columnCount, 10);
    assert.equal(result.getCell('A7').value, header);
    assert.deepEqual(result.model.merges, ['A1:J1', 'A2:J2', 'A3:J3', 'A4:J4', 'A5:J5', 'A6:J6']);
    assert.equal(result.pageSetup.printArea, `A1:J${count + 7}`);
    assert.equal(result.pageSetup.fitToHeight, 0);
    for (let r = 8; r < 8 + count; r++) {
      assert.equal(result.getCell(r, 1).value, r - 7);
      assert.equal(result.getCell(r, 7).value, `750405-${(r - 8) % 2 ? 2 : 1}`);
      assert.equal(result.getCell(r, 10).value, null);
      assert.equal(result.getRow(r).height, 16.5);
      for (let c = 1; c <= 10; c++) {
        for (const side of ['top', 'bottom', 'left', 'right']) {
          assert.equal(result.getCell(r, c).border[side].style, 'thin', `${r},${c},${side}`);
        }
      }
    }
    if (process.env.DISPATCH_PREVIEW && [10, 51].includes(count)) {
      fs.mkdirSync('coverage/dispatch-preview', { recursive: true });
      fs.writeFileSync(`coverage/dispatch-preview/${count}-people.xlsx`, Buffer.from(bytes));
    }
  });
}
