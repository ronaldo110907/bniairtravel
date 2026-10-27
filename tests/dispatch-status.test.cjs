const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function('require', 'exports', code)(id => mocks[id], exports);
  return exports;
}

function hookHarness(read) {
  const updates = [], effects = [], queries = [];
  const react = {
    useState(initial) { return [initial, value => updates.push(value)]; },
    useCallback: fn => fn,
    useEffect: (effect, dependencies) => effects.push({ effect, dependencies }),
  };
  const { useDispatchRequestStatus: hook } = load('lib/useDispatchRequestStatus.ts', {
    react,
    '@/lib/supabase': { supabase: { from(table) {
      assert.equal(table, 'reservation_checklists');
      return { select(columns) {
        assert.equal(columns, 'request_done');
        return { eq(column, id) {
          assert.equal(column, 'reservation_id'); queries.push(id);
          return { maybeSingle: () => read(id) };
        } };
      } };
    } } },
  });
  return { hook, updates, effects, queries };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('saved flags, missing rows and query failures produce distinct states', async () => {
  for (const [result, expected] of [
    [{ data: { request_done: true }, error: null }, 'done'],
    [{ data: { request_done: false }, error: null }, 'missing'],
    [{ data: null, error: null }, 'missing'],
    [{ data: null, error: { code: 'denied' } }, 'error'],
  ]) {
    const h = hookHarness(async () => result);
    assert.equal(h.hook('booking-A').status, 'loading');
    h.effects[0].effect(); await flush();
    assert.deepEqual(h.queries, ['booking-A']);
    assert.deepEqual(h.updates.at(-1), { id: 'booking-A', status: expected });
  }
});

test('a slow previous reservation response cannot overwrite the new reservation', async () => {
  const pending = {};
  const h = hookHarness(id => new Promise(resolve => { pending[id] = resolve; }));
  h.hook('booking-A');
  const cancelA = h.effects[0].effect();
  cancelA();
  h.hook('booking-B'); h.effects[2].effect();
  pending['booking-B']({ data: { request_done: false }, error: null }); await flush();
  pending['booking-A']({ data: { request_done: true }, error: null }); await flush();
  assert.deepEqual(h.updates.at(-1), { id: 'booking-B', status: 'missing' });
  assert.equal(h.updates.some(row => row.id === 'booking-A' && row.status === 'done'), false);
});

test('network exceptions show a retryable error; reopening reads persisted completion again', async () => {
  const failed = hookHarness(async () => { throw new Error('offline'); });
  failed.hook('booking-A'); failed.effects[0].effect(); await flush();
  assert.equal(failed.updates.at(-1).status, 'error');
  const reopened = hookHarness(async () => ({ data: { request_done: true }, error: null }));
  reopened.hook('booking-A'); reopened.effects[0].effect(); await flush();
  assert.equal(reopened.updates.at(-1).status, 'done');
});

function writerHarness(existing, insertError = null, updateError = null) {
  const calls = [];
  const { markDispatchRequestDone } = load('lib/markDispatchRequestDone.ts', {
    '@/lib/supabase': { supabase: { from(table) {
      assert.equal(table, 'reservation_checklists');
      return {
        select: () => ({ eq: (column, id) => ({ maybeSingle: async () => {
          calls.push({ action: 'read', column, id }); return { data: existing ? { reservation_id: id } : null, error: null };
        } }) }),
        insert: async values => { calls.push({ action: 'insert', values }); return { error: insertError }; },
        update: values => ({ eq: (column, id) => ({ select: () => ({ maybeSingle: async () => {
          calls.push({ action: 'update', column, id, values }); return { data: updateError ? null : { reservation_id: id }, error: updateError };
        } }) }) }),
      };
    } } },
  });
  return { markDispatchRequestDone, calls };
}

test('recording completion updates only the targeted reservation and preserves other checklist flags', async () => {
  const h = writerHarness(true);
  await h.markDispatchRequestDone('booking-A');
  const write = h.calls.find(call => call.action === 'update');
  assert.equal(write.id, 'booking-A');
  assert.equal(write.column, 'reservation_id');
  assert.equal(write.values.request_done, true);
  assert.deepEqual(Object.keys(write.values).sort(), ['request_done', 'updated_at']);
  assert.equal(h.calls.some(call => call.action === 'insert'), false);
});

test('new checklists record completion; concurrent creation retries a narrow update', async () => {
  for (const conflict of [null, { code: '23505' }]) {
    const h = writerHarness(false, conflict);
    await h.markDispatchRequestDone('booking-A');
    const write = h.calls.find(call => call.action === 'insert');
    assert.equal(write.values.reservation_id, 'booking-A');
    assert.equal(write.values.request_done, true);
    assert.equal(h.calls.some(call => call.action === 'update'), !!conflict);
  }
});

test('recording failures are surfaced instead of reporting completion', async () => {
  await assert.rejects(writerHarness(false, { code: 'denied' }).markDispatchRequestDone('booking-A'));
  await assert.rejects(writerHarness(true, null, { code: 'denied' }).markDispatchRequestDone('booking-A'));
});
