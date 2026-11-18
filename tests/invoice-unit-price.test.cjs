const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const invoiceModule = { exports: {} };
new Function('require', 'module', 'exports', ts.transpileModule(fs.readFileSync('lib/invoiceHwpx.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText)(id => id === './hwpxPageBorder' ? { applyBluePageBorder() {} } : require(id), invoiceModule, invoiceModule.exports);

// Exercise the actual input handlers without fetching or saving live invoices.
function harness(people, departureVariant) {
  const state = [];
  let index = 0;
  const hooks = {
    useState(initial) {
      const i = index++;
      if (!(i in state)) state[i] = initial;
      return [state[i], value => { state[i] = value; }];
    },
    useRef: () => ({ current: null }),
    useEffect: () => {},
    useCallback: fn => fn,
  };
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('components/InvoiceModal.tsx', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  new Function('require', 'module', 'exports', code)(id => {
    if (id === 'react') return hooks;
    if (id === 'react/jsx-runtime') return require(id);
    if (id === 'react-to-print') return { useReactToPrint: () => () => {} };
    if (id.startsWith('@/components/')) return { __esModule: true, default: () => null };
    if (id === '@/lib/invoiceHwpx') return invoiceModule.exports;
    if (id.startsWith('@/lib/')) return {};
    throw new Error(`Unexpected import: ${id}`);
  }, module, module.exports);
  function render() {
    index = 0;
    return module.exports.default({ open: true, onClose() {}, reservation: {
      id: 'test', name: '테스트', product: '샤먼', departure_variant: departureVariant, departure_date: '2026-12-24', people,
    } });
  }
  function input(label) {
    function find(node) {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) return node.map(find).find(Boolean);
      if (node.type === 'input' && node.props['aria-label'] === label) return node.props;
      return find(node.props?.children);
    }
    const result = find(render());
    assert.ok(result, `Missing input: ${label}`);
    return result;
  }
  return { input, render, change: (label, value) => input(label).onChange({ target: { value } }) };
}

test('editing the unit price updates the total shown in the actual invoice inputs', () => {
  const h = harness(Array.from({ length: 4 }, (_, id) => ({ id: String(id) })));
  h.change('1인 금액', '560800');
  assert.equal(h.input('1인 금액').value, '560,800');
  assert.equal(h.input('여행경비').value, '2,243,200');
  h.change('여행경비', '2200000');
  assert.equal(h.input('여행경비').value, '2,200,000');
  assert.equal(h.input('1인 금액').value, '560,800');
  h.change('1인 금액', '600000');
  assert.equal(h.input('여행경비').value, '2,400,000');
});
test('free guides are excluded and zero or cleared prices do not retain a stale total', () => {
  const h = harness([{ id: '1' }, { id: '2' }, { id: '3', is_guide: true }]);
  h.change('1인 금액', '1,000');
  assert.equal(h.input('여행경비').value, '2,000');
  h.change('1인 금액', '0');
  assert.equal(h.input('여행경비').value, '0');
  h.change('1인 금액', '');
  assert.equal(h.input('여행경비').value, '');
});

test('invoice and confirmation show the departure variant, with a product fallback', () => {
  function textNodes(node) {
    if (typeof node === 'string') return [node];
    if (Array.isArray(node)) return node.flatMap(textNodes);
    return node?.props ? textNodes(node.props.children) : [];
  }
  const custom = textNodes(harness([], ' 하문고품격 ').render());
  assert.equal(custom.filter(text => text === '하문고품격').length, 2);
  assert.equal(custom.includes('샤먼'), false);
  const fallback = textNodes(harness([], ' ').render());
  assert.equal(fallback.filter(text => text === '샤먼').length, 2);
});
test('download filenames include the product, reservation and invoice type safely', () => {
  assert.equal(invoiceModule.exports.invoiceFilename({ departureDate: '2026-12-24', product: '하문고품격', name: '트립시아', invoiceType: 'deposit' }), '261224_BNI_Invoice_하문고품격_트립시아_계약금.hwpx');
  assert.equal(invoiceModule.exports.invoiceFilename({ departureDate: '2026-12-24', product: '상품/특가', name: '예약:테스트', invoiceType: 'balance' }), '261224_BNI_Invoice_상품_특가_예약_테스트_잔금.hwpx');
});
