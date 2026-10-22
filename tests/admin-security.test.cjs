const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { NextRequest } = require('next/server');

// Exercise the real handlers and policy with synthetic auth/DB responses only.
function load(file, mocks = {}, cache = new Map()) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute);
  const output = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  cache.set(absolute, module.exports);
  new Function('require', 'module', 'exports', output)((id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id.startsWith('@/')) return load(`${id.slice(2)}.ts`, mocks, cache);
    if (id.startsWith('.')) return load(path.resolve(path.dirname(absolute), `${id}.ts`), mocks, cache);
    return require(id);
  }, module, module.exports);
  return module.exports;
}

const { isAdminUser } = load('lib/auth/admin-policy.ts');
const admin = email => ({ id: 'synthetic-admin', email, email_confirmed_at: '2026-01-01', app_metadata: {} });
const accounts = ['cjjbni@cjjbni.com', 'ronaldo1109@naver.com'];

test('both confirmed administrator accounts pass the same policy', () => {
  for (const email of accounts) assert.equal(isAdminUser(admin(email)), true);
  assert.equal(isAdminUser(admin('CJJBNI@CJJBNI.COM')), true);
});

test('anonymous, ordinary, unconfirmed and user-metadata-forged accounts cannot be admins', () => {
  assert.equal(isAdminUser(null), false);
  assert.equal(isAdminUser({ ...admin(accounts[0]), is_anonymous: true }), false);
  assert.equal(isAdminUser({ ...admin(accounts[0]), email_confirmed_at: undefined }), false);
  assert.equal(isAdminUser({ ...admin('visitor@example.test'), user_metadata: { role: 'admin' } }), false);
  assert.equal(isAdminUser({ ...admin('managed@example.test'), app_metadata: { role: 'admin' } }), true);
});

function authHarness(user, error = null) {
  const client = { auth: { getUser: async () => ({ data: { user }, error }) } };
  return load('lib/auth/server.ts', {
    '@supabase/ssr': { createServerClient: () => client },
    '@supabase/supabase-js': { createClient: () => client },
    'next/headers': { cookies: async () => ({ getAll: () => [], set() {} }) },
  });
}

test('server verification accepts either account via a validated token or session', async () => {
  for (const email of accounts) {
    const auth = authHarness(admin(email));
    assert.equal((await auth.getAdminUser()).email, email);
    assert.equal((await auth.getAdminUser(new Request('http://test', { headers: { authorization: 'Bearer synthetic-token' } }))).email, email);
  }
});

test('server verification fails closed for rejected tokens, ordinary users and malformed bearer headers', async () => {
  assert.equal(await authHarness(admin(accounts[0]), new Error('expired')).getAdminUser(), null);
  assert.equal(await authHarness(admin('visitor@example.test')).getAdminUser(), null);
  const auth = authHarness(admin(accounts[0]));
  assert.equal(await auth.getAdminUser(new Request('http://test', { headers: { authorization: 'Basic invalid' } })), null);
});

function middlewareHarness(user, refresh = false) {
  return load('middleware.ts', {
    '@supabase/ssr': { createServerClient: (_url, _key, options) => ({ auth: { getUser: async () => {
      if (refresh) options.cookies.setAll([{ name: 'synthetic-refresh', value: 'updated', options: { path: '/', sameSite: 'lax' } }]);
      return { data: { user }, error: null };
    } } }) },
  }).middleware;
}

test('a forged legacy cookie cannot open admin pages; login remains reachable', async () => {
  const middleware = middlewareHarness(null);
  for (const route of ['/admin', '/admin/reservations', '/admin/login/pretend']) {
    const result = await middleware(new NextRequest(`http://test${route}`, { headers: { cookie: 'admin_user=true; admin_email=ronaldo1109%40naver.com' } }));
    assert.equal(result.status, 307);
    assert.equal(result.headers.get('location'), 'http://test/admin/login');
  }
  assert.equal((await middleware(new NextRequest('http://test/admin/login'))).status, 200);
});

test('either administrator can navigate and refreshed session cookies propagate', async () => {
  for (const email of accounts) {
    const response = await middlewareHarness(admin(email), true)(new NextRequest('http://test/admin/reservations'));
    assert.equal(response.status, 200);
    assert.equal(response.cookies.get('synthetic-refresh').value, 'updated');
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.match(response.headers.get('x-middleware-request-cookie'), /synthetic-refresh=updated/);
  }
});

function routeHarness(file, user, tables = {}) {
  let reads = 0;
  const auth = { getAdminUser: async () => isAdminUser(user) ? user : null, unauthorized: authHarness(null).unauthorized };
  const db = { from(table) {
    reads++;
    const data = tables[table] ?? [];
    const query = { then: resolve => Promise.resolve({ data, error: null }).then(resolve), single: async () => ({ data, error: null }) };
    for (const name of ['select', 'eq', 'in', 'neq', 'order']) query[name] = () => query;
    return query;
  } };
  return { route: load(file, {
    '@/lib/auth/server': auth,
    '@supabase/supabase-js': { createClient: () => db },
    '@/lib/supabaseAdmin': { supabaseAdmin: db },
  }), reads: () => reads };
}

test('dispatch rejects unauthorized download before any reservation query', async () => {
  for (const user of [null, admin('visitor@example.test')]) {
    const harness = routeHarness('app/api/dispatch/route.ts', user);
    const response = await harness.route.GET(new Request('http://test/api/dispatch?id=synthetic', { headers: { cookie: 'admin_user=true' } }));
    assert.equal(response.status, 401);
    assert.equal(harness.reads(), 0);
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
});

test('either administrator downloads a real XLSX populated only with synthetic data', async () => {
  for (const email of accounts) {
    const harness = routeHarness('app/api/dispatch/route.ts', admin(email), {
      departures: { id: 'synthetic', departure_date: '2026-12-03', course: '3N5D', products: { title: '하문', slug: 'xiamen' } },
      reservations: [{ id: 'r1', name: '가상단체', phone: '', product: '하문', people: [{ name: '가상여행자', passport_name: 'TEST PERSON', passport_number: 'SYNTHETIC' }] }],
    });
    const response = await harness.route.GET(new Request('http://test/api/dispatch?id=synthetic'));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /spreadsheetml/);
    assert.match(response.headers.get('cache-control'), /no-store/);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.subarray(0, 2).toString(), 'PK');
    const workbook = new (require('exceljs').Workbook)();
    await workbook.xlsx.load(bytes);
    let found = false;
    workbook.eachSheet(sheet => sheet.eachRow(row => { if (JSON.stringify(row.values).includes('SYNTHETIC')) found = true; }));
    assert.equal(found, true);
  }
});

test('session recheck for invoice and HWPX rejects expired users and accepts both admins', async () => {
  for (const user of [null, ...accounts.map(admin)]) {
    const harness = routeHarness('app/api/admin/session/route.ts', user);
    const response = await harness.route.GET(new Request('http://test/api/admin/session'));
    assert.equal(response.status, user ? 200 : 401);
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
});

test('related admin APIs reject forged cookies before any database work', async () => {
  for (const file of ['app/api/admin/travel-documents/route.ts', 'app/api/admin/reservations/transfer/route.ts']) {
    const harness = routeHarness(file, null);
    const response = await harness.route.POST(new NextRequest('http://test/api/admin/action', { method: 'POST', headers: { cookie: 'admin_user=true' } }));
    assert.equal(response.status, 401);
    assert.equal(harness.reads(), 0);
  }
});

test('logout revokes the Supabase session and clears both legacy cookies', async () => {
  let scope;
  const cleared = [];
  const route = load('app/api/admin/logout/route.ts', {
    '@/lib/auth/server': { createServerSupabase: async () => ({ auth: { signOut: async options => {
      scope = options.scope;
      return { error: null };
    } } }) },
    'next/headers': { cookies: async () => ({ set: (...args) => cleared.push(args) }) },
  });
  const response = await route.POST();
  assert.equal(response.status, 200);
  assert.equal(scope, 'local');
  assert.deepEqual(cleared.map(args => [args[0], args[2].maxAge]), [['admin_user', 0], ['admin_email', 0]]);
});

test('Google sheet sync cannot be triggered using a forged cookie', async () => {
  let called = false;
  const route = load('app/api/admin/xiamen/sync-google-sheet/route.ts', {
    '@/lib/auth/server': { getAdminUser: async () => null, unauthorized: authHarness(null).unauthorized },
    '../../../../../lib/google/xiamen-seat-sync': { syncXiamenSeats: async () => { called = true; } },
  });
  assert.equal((await route.POST(new Request('http://test/api/admin/sync', { method: 'POST' }))).status, 401);
  assert.equal(called, false);
});
