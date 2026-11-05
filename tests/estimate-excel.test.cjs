const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const XLSX = require('xlsx-js-style');

const importer = {};
const code = ts.transpileModule(fs.readFileSync('lib/importEstimateExcel.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
new Function('require', 'exports', code)(require, importer);

function workbook(rows) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), '일정표');
  return book;
}
test('actual file import preserves emoji, indentation, repeated lines and merged-label continuation', async () => {
  const original = '   ▶관광조: ✈️ 출발\n      👩‍✈️ 미팅 & 이동';
  const book = workbook([
    ['상 품','일정 테스트',,,, '1인 지상비','123만원/인'],
    ['포 함','🚌 전용차량'], [, '🍴 호텔식'], ['불포함','개인경비'],
    ['날 짜','장 소','교 통','시 간','일 정'],
    ['제 1 일\n02월07일','청주','RF531','20:55',original],
    [,,,, '▶관광'], [,,,, '▶관광'],
    ['호텔','호텔 🌟',,,'식 사','조식 : 호텔식','중식 : 현지식','석식 : 불포함'],
  ]);
  book.Sheets['일정표']['!merges'] = [XLSX.utils.decode_range('A2:A3')];
  const file = new File([XLSX.write(book, { type:'buffer', bookType:'xlsx' })], '테스트.xlsx');
  const result = await importer.importEstimateExcel(file);
  assert.deepEqual(result.days[0], {
    id:'excel-day-1', region:'청주', transport:'RF531', time:'20:55',
    schedule:'02월07일\n' + original + '\n▶관광\n▶관광',
    hotel:'호텔 🌟', breakfast:'호텔식', lunch:'현지식', dinner:'불포함',
  });
  assert.deepEqual(result.form, { productName:'일정 테스트', includes:'🚌 전용차량\n🍴 호텔식', excludes:'개인경비' });
});
test('multiple course lengths use only the selected duration and its return day', () => {
  const book = workbook([
    ['일차',,'장소','교통편','시간','여 행 일 정','식사'],
    [1,1,'인천','항공','','출발','중 : X'],
    [,2,'현지','','','긴 코스 일정'],
    [2,3,'인천','','','귀국'],
    ['● 상기 일정은 변경될 수 있습니다.'], ['추가요금',,,,,1234],
  ]);
  const {days} = importer.parseEstimateWorkbook(book,'여행 2일.xlsx');
  assert.deepEqual(days.map(d => d.schedule), ['출발','귀국']);
  assert.throws(() => importer.parseEstimateWorkbook(book,'여행.xlsx'), /일차 열/);
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['요금']]), '요금');
  assert.throws(() => importer.parseEstimateWorkbook(book,'여행 2일.xlsx'), /시트 한 장/);
});
