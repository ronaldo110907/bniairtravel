const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(file, mocks = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  new Function('require', 'module', 'exports', code)(id => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id.startsWith('@/')) return load(path.resolve(`${id.slice(2)}.ts`), mocks);
    return require(id);
  }, module, module.exports);
  return module.exports;
}
const { invoiceHistoryTotal } = load('lib/invoices.ts');
const reservationId = '11111111-1111-4111-8111-111111111111';
const otherReservation = '22222222-2222-4222-8222-222222222222';

function harness(authorized = true) {
  const rows = [
    { id: '1', reservation_id: reservationId, invoice_type: 'deposit', amount: 300000, created_at: '2026-10-01T00:00:00Z' },
    { id: '2', reservation_id: reservationId, invoice_type: 'interim', amount: 200000, created_at: '2026-10-02T00:00:00Z' },
    { id: '3', reservation_id: otherReservation, invoice_type: 'deposit', amount: 900000, created_at: '2026-10-03T00:00:00Z' },
  ];
  let queries = 0;
  const db = { from(table) {
    assert.equal(table, 'reservation_invoices'); queries++;
    const filters = []; let update; let start = 0; let end = Infinity;
    function execute() {
      const matches = rows.filter(row => filters.every(([key, value]) => String(row[key]) === String(value)));
      if (update) matches.forEach(row => Object.assign(row, update));
      return matches.slice(start, end + 1).map(row => ({ ...row }));
    }
    const query = {
      select() { return this; }, order() { return this; },
      eq(key, value) { filters.push([key, value]); return this; },
      range(a, b) { start = a; end = b; return this; },
      update(value) { update = value; return this; },
      maybeSingle: async () => ({ data: execute()[0] ?? null, error: null }),
      then: resolve => Promise.resolve({ data: execute(), error: null }).then(resolve),
    };
    return query;
  } };
  const api = load('app/api/admin/invoices/route.ts', {
    '@/lib/auth/server': { getAdminUser: async () => authorized ? { id: 'admin' } : null, unauthorized: () => Response.json({ error: 'Unauthorized' }, { status: 401 }) },
    '@/lib/supabaseAdmin': { supabaseAdmin: db },
  });
  return { api, rows, queries: () => queries };
}
const patch = body => new Request('http://test/api/admin/invoices', { method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
const read = id => new Request(`http://test/api/admin/invoices?reservationId=${id}`);

test('history total uses persisted corrected amounts on every subsequent invoice', async () => {
  const { api } = harness();
  let result = await (await api.GET(read(reservationId))).json();
  assert.equal(invoiceHistoryTotal(result.invoices), 500000);
  const update = await api.PATCH(patch({ reservationId, invoiceId: '2', expectedAmount: 200000, amount: 50000 }));
  assert.equal(update.status, 200);
  result = await (await api.GET(read(reservationId))).json();
  assert.equal(invoiceHistoryTotal(result.invoices), 350000);
  assert.equal(invoiceHistoryTotal((await (await api.GET(read(otherReservation))).json()).invoices), 900000);
});

test('zeroing a test charge keeps its row and removes it from future totals', async () => {
  const { api, rows } = harness();
  assert.equal((await api.PATCH(patch({ reservationId, invoiceId: '1', expectedAmount: 300000, amount: 0 }))).status, 200);
  assert.equal(rows.length, 3);
  assert.equal(invoiceHistoryTotal((await (await api.GET(read(reservationId))).json()).invoices), 200000);
});

test('stale amounts and a row belonging to another reservation cannot be overwritten', async () => {
  const { api, rows } = harness();
  assert.equal((await api.PATCH(patch({ reservationId, invoiceId: '2', expectedAmount: 1, amount: 0 }))).status, 409);
  assert.equal((await api.PATCH(patch({ reservationId, invoiceId: '3', expectedAmount: 900000, amount: 0 }))).status, 409);
  assert.equal(rows[1].amount, 200000);
  assert.equal(rows[2].amount, 900000);
});

test('anonymous reads and changes stop before any database query', async () => {
  const h = harness(false);
  assert.equal((await h.api.GET(read(reservationId))).status, 401);
  assert.equal((await h.api.PATCH(patch({ reservationId, invoiceId: '1', expectedAmount: 300000, amount: 0 }))).status, 401);
  assert.equal(h.queries(), 0);
});

test('invalid amounts, IDs and malformed requests are rejected without updates', async () => {
  const h = harness();
  for (const amount of [-1, 0.5, '0', null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal((await h.api.PATCH(patch({ reservationId, invoiceId: '1', expectedAmount: 300000, amount }))).status, 400);
  }
  assert.equal((await h.api.PATCH(patch({ reservationId: 'bad', invoiceId: '1', expectedAmount: 300000, amount: 0 }))).status, 400);
  assert.equal((await h.api.PATCH(new Request('http://test', { method: 'PATCH', body: '{' }))).status, 400);
  assert.equal(h.queries(), 0);
});

test('history is uncached and retrieves more than one database page', async () => {
  const h = harness();
  for (let id = 4; id <= 510; id++) h.rows.push({ ...h.rows[0], id: String(id), amount: 1 });
  const response = await h.api.GET(read(reservationId));
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal((await response.json()).invoices.length, 509);
  assert.equal(h.queries(), 2);
});
