const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const XLSX = require('xlsx-js-style');
const JSZip = require('jszip');

// Exercise the download handler, including the serialized XLSX rather than
// checking worksheet properties that the writer might silently ignore.
const source = ts.createSourceFile('button.tsx',
  fs.readFileSync('components/admin/XiamenNameTagButton.tsx', 'utf8'),
  ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const functions = [];
function visit(node) {
  if (ts.isFunctionDeclaration(node) &&
      ['generateExcel', 'formatEnglishName', 'makeSafeFileName'].includes(node.name?.text)) {
    functions.push(node.getText(source));
  }
  ts.forEachChild(node, visit);
}
visit(source);
const code = ts.transpile(functions.join('\n'), { target: ts.ScriptTarget.ES2022 });

for (const count of [1, 10, 11, 48]) {
  test(`download ${count} people with persisted A4 print settings`, async () => {
    const people = Array.from({ length: count }, (_, index) => ({
      name: `테스트${index + 1}`, passportLastName: 'TEST', passportFirstName: `PERSON ${index + 1}`,
    }));
    let result;
    const alerts = [];
    const env = {
      people, selectedGroup: { departureDate: '2026-11-11', product: '검증' },
      ITEMS_PER_PAGE: 10, excelGenerating: false, setExcelGenerating() {},
      XLSX, JSZip, alert: message => alerts.push(message), console,
      URL: { createObjectURL(blob) { result = blob; return 'blob:test'; }, revokeObjectURL() {} },
      document: { createElement: () => ({ click() {}, remove() {} }), body: { appendChild() {} } },
      setTimeout: callback => callback(),
    };
    await new Function(...Object.keys(env), code + '; return generateExcel();')(...Object.values(env));
    assert.deepEqual(alerts, []);
    const buffer = Buffer.from(await result.arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);
    const workbookXml = await zip.file('xl/workbook.xml').async('string');
    const pages = Math.ceil(count / 10);
    assert.equal((workbookXml.match(/name="_xlnm.Print_Area"/g) || []).length, pages);
    for (let i = 1; i <= pages; i++) {
      const xml = await zip.file(`xl/worksheets/sheet${i}.xml`).async('string');
      assert.match(xml, /<pageSetup paperSize="9" scale="100" orientation="portrait"/);
      assert.match(xml, /top="0.8070866141732284"/);
      assert.match(xml, /left="0.45275590551181105"/);
      assert.ok(xml.indexOf('<pageMargins') < xml.indexOf('<pageSetup'));
      assert.ok(xml.indexOf('<pageSetup') < xml.indexOf('<ignoredErrors'));
      assert.match(xml, /width="44.67259979248047"/);
      assert.match(xml, /ht="62.25"/);
      assert.ok(workbookXml.includes(`localSheetId="${i - 1}"`));
      assert.ok(workbookXml.includes('!$A$1:$C$15'));
    }
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    for (let i = 0; i < count; i++) {
      const sheet = workbook.Sheets[workbook.SheetNames[Math.floor(i / 10)]];
      const row = Math.floor((i % 10) / 2) * 3 + 1;
      const col = i % 2 ? 'C' : 'A';
      assert.equal(sheet[col + row].v, people[i].name);
    }
    const last = workbook.Sheets[workbook.SheetNames.at(-1)];
    if (count === 48) {
      assert.equal(last.A13?.v || '', '');
      assert.equal(last.C13?.v || '', '');
      if (process.env.NAMETAG_TEST_OUTPUT) fs.writeFileSync(process.env.NAMETAG_TEST_OUTPUT, buffer);
    }
  });
}
