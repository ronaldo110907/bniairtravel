const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function harness() {
  const sent = [], cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    new Function('require', 'exports', code)(id => {
      if (id === 'next/server') return { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } };
      if (id === 'resend') return { Resend: class {
        emails = { send: async message => { sent.push(message); return { data: { id: 'test-only' }, error: null }; } };
      } };
      if (id.startsWith('@/')) return load(id.slice(2) + '.ts');
      if (id.startsWith('.')) return load(path.resolve(path.dirname(file), id) + '.ts');
      throw new Error(`Unexpected dependency: ${id}`);
    }, exports);
    return exports;
  }
  return { load, sent };
}
const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const request = course => ({ json: async () => ({ product: 'zhangjiajie-2027', course, email: 'test@example.invalid', companyName: '테스트', managerName: '테스트', phone: '000', etc: '' }) });

for (const [course, key] of [['3박4일', 'itinerary3N4D'], ['4박5일', 'itinerary4N5D']]) {
  test(`${course}: every day's detailed schedule is included in actual email HTML`, async () => {
    const h = harness();
    const { POST } = h.load('app/api/send-itinerary/route.ts');
    const items = h.load('data/zhangjiajie-2027.ts')[key];
    assert.equal((await POST(request(course))).status, 200);
    const html = h.sent[0].html;
    for (const item of items) {
      assert.ok(html.includes(escape(item.schedule).replace(/\r\n|\r|\n/g, '<br />')), item.day);
      assert.ok(html.includes(item.description));
      assert.ok(html.includes(item.hotel));
    }
    assert.ok(html.includes('zhangjiajie2027.png'));
    assert.equal((html.match(/>상세 일정<\/strong>/g) ?? []).length, items.length);
  });
}
test('schedule text is escaped and absent schedules do not produce empty boxes', async () => {
  const h = harness();
  const { POST } = h.load('app/api/send-itinerary/route.ts');
  const items = h.load('data/zhangjiajie-2027.ts').itinerary3N4D;
  items.forEach(item => { item.schedule = undefined; });
  items[0].schedule = 'A & B <tag> "quote"\r\n두 번째 줄';
  await POST(request('3박4일'));
  const html = h.sent[0].html;
  assert.ok(html.includes('A &amp; B &lt;tag&gt; &quot;quote&quot;<br />두 번째 줄'));
  assert.equal((html.match(/>상세 일정<\/strong>/g) ?? []).length, 1);
});
