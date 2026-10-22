const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../lib/confirmation/model.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
const api = {};
new Function('exports', compiled)(api);
test('calendar arithmetic crosses years and rejects invalid dates', () => {
  assert.equal(api.displayDate(api.calendarDate('2026-12-31', 4)), '2027.01.04(월)');
  assert.equal(api.displayDate(api.calendarDate('2026-12-06', 5)), '2026.12.11(금)');
  assert.throws(() => api.calendarDate('2026-02-30'));
});
test('matching requires destination, variant and both nights and days', () => {
  const products = [{ id: 'g', productSlug: 'xiamen', nights: 4, days: Array(6), variants: ['고품격관지산'] }];
  const departure = { products: { slug: 'xiamen' }, course: '4박 6일', variant: '고품격관지산' };
  assert.equal(api.matchProduct(products, departure).id, 'g');
  for (const override of [{ course: '3N5D' }, { variant: '고품격무이산' }, { products: { slug: 'other' } }])
    assert.equal(api.matchProduct(products, { ...departure, ...override }), undefined);
  assert.equal(api.matchProduct([...products, ...products], departure), undefined);
});
test('cancelled reservations are excluded and mismatched counts are surfaced', () => {
  const result = api.countPeople([{ people_count: 4, people: [{ id: 'p' }], status: '확정' }, { people_count: 20, status: '취소' }]);
  assert.equal(result.total, 4); assert.equal(result.warnings.length, 1);
});
test('only selected rooms count; shared rooms require manual review', () => {
  const rooms = [{ id: 'a', room_type: '2인실', room_name: '트윈1' }, { id: 'b', room_type: '1인실' }];
  const selected = [{ id: 'r', people: [{ id: 'p' }] }];
  assert.equal(api.summarizeRooms(rooms, [{ room_id: 'a', reservation_person_id: 'p' }], selected).text, '트윈 1실');
  const result = api.summarizeRooms(rooms, [{ room_id: 'a', reservation_person_id: 'p' }, { room_id: 'a', reservation_person_id: 'other' }], selected);
  assert.equal(result.text, ''); assert.ok(result.warnings.length);
});
test('filenames cannot contain Windows path separators or reserved characters', () => {
  assert.equal(api.safeFilename('단체/이름:*?'), '단체_이름___');
});
