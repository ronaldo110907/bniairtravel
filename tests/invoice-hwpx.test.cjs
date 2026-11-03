// Run with Playwright installed (or NODE_PATH pointing at the desktop bundled packages).
// All data and API calls are synthetic; this never connects to Supabase.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const ts = require('typescript');
const { chromium } = require('playwright');
const JSZip = require('jszip');
const root = process.cwd(), graph = {};
const mocks = {
  '@/lib/auth/client': 'exports.assertAdminSession=async()=>{if(window.failAuth)throw Error("인증 실패")};',
  '@/lib/supabase': `exports.supabase={from(){return {insert:async row=>{if(window.failInsert)return {error:{message:'test'}};window.fixtureRows.push({...row,id:String(window.fixtureRows.length+1),created_at:new Date().toISOString()});window.inserts++;return {error:null}}}}};`,
  'jszip': 'module.exports=window.JSZip;',
  'react-to-print': `exports.useReactToPrint=opts=>()=>{opts.onBeforePrint().then(()=>{window.prints.push({text:opts.contentRef.current.innerText,values:[...opts.contentRef.current.querySelectorAll('input')].map(e=>e.value)});opts.onAfterPrint();}).catch(e=>opts.onPrintError('onBeforePrint',e))};`,
};
function add(file) {
  if (graph[file]) return file;
  let code = fs.readFileSync(file, 'utf8');
  if (/\.tsx?$/.test(file)) code = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  graph[file] = { code, deps: {} };
  for (const m of code.matchAll(/require\(["']([^"']+)["']\)/g)) {
    const name = m[1];
    if (mocks[name]) { graph[name] = { code: mocks[name], deps: {} }; graph[file].deps[name] = name; continue; }
    const q = path.join(root, name.slice(2));
    const resolved = name.startsWith('@/') ? ['.ts', '.tsx', ''].map(e => q + e).find(fs.existsSync) : require.resolve(name, { paths: [path.dirname(file)] });
    graph[file].deps[name] = add(resolved);
  }
  return file;
}
const modal = add(path.join(root, 'components/InvoiceModal.tsx'));
const generator = add(path.join(root, 'lib/invoiceHwpx.ts'));
const react = add(require.resolve('react')), client = add(require.resolve('react-dom/client'));
let script = 'const graph=' + JSON.stringify(graph) + ';const cache={};function load(id){if(cache[id])return cache[id];const m={exports:{}};cache[id]=m.exports;new Function("require","module","exports","process",graph[id].code)(n=>load(graph[id].deps[n]),m,m.exports,{env:{NODE_ENV:"production"}});return cache[id]=m.exports;}';
script += `window.inserts=0;window.prints=[];window.fixtureRows=[{id:'old',reservation_id:'demo',invoice_type:'deposit',amount:100000,created_at:'2026-10-01T00:00:00Z'}];
const realFetch=window.fetch;window.fetch=async(url,options={})=>{if(String(url).includes('/templates/'))return window.failTemplate?new Response('',{status:500}):realFetch(url,options);return Response.json({invoices:window.fixtureRows})};
window.hwpx=load(${JSON.stringify(generator)});const React=load(${JSON.stringify(react)}),DOM=load(${JSON.stringify(client)}),Modal=load(${JSON.stringify(modal)}).default;
function App(){const[open,setOpen]=React.useState(true);return React.createElement('main',null,React.createElement('button',{onClick:()=>setOpen(true)},'다시 열기'),React.createElement(Modal,{open,onClose:()=>setOpen(false),reservation:{id:'demo',name:'가상단체',product:'테스트 상품',departure_date:'2027-01-17',departure_id:'demo',departure_price:999000,people:[{id:'1',name:'샘플 가'},{id:'2',name:'샘플 나'},{id:'3',name:'샘플 인솔자',is_guide:true}]}}))}DOM.createRoot(document.getElementById('root')).render(React.createElement(App));`;
const server = http.createServer((req, res) => {
  if (req.url === '/bundle.js') { res.setHeader('Content-Type', 'application/javascript'); res.end(script); }
  else if (req.url === '/jszip.js') { res.setHeader('Content-Type', 'application/javascript'); res.end(fs.readFileSync(require.resolve('jszip/dist/jszip.min.js'))); }
  else if (req.url === '/templates/invoice-master.hwpx') res.end(fs.readFileSync('public/templates/invoice-master.hwpx'));
  else res.end('<!DOCTYPE html><meta charset="utf-8"><style>img{display:none}table{width:100%}td{padding:3px}button,input{margin:3px}</style><div id="root"></div><script src="/jszip.js"></script><script src="/bundle.js"></script>');
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
  try {
    const page = await browser.newPage();
    const dialogs = []; page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const url = `http://127.0.0.1:${server.address().port}`;
    const charge = () => page.getByRole('textbox', { name: '이번 청구금액', exact: true });
    const submit = () => page.getByRole('button', { name: 'HWPX 다운로드&저장', exact: true });
    async function ready() { await page.goto(url); await submit().waitFor(); await page.waitForFunction(() => !document.querySelector('button.bg-emerald-600').disabled); }
    async function download(button) { const promise = page.waitForEvent('download'); await button.click(); const d = await promise; return fs.readFileSync(await d.path()); }
    async function inspect(bytes) { const zip = await JSZip.loadAsync(bytes); return zip.file('Contents/section0.xml').async('string'); }
    await ready();
    await charge().fill('400000');
    const bytes = await download(submit());
    const xml = await inspect(bytes);
    assert.match(xml, /청구 2명/); assert.match(xml, /1,998,000/); assert.match(xml, /1,498,000/);
    assert.match(xml, /100,000/); assert.match(xml, /400,000/);
    assert.equal((xml.match(/binaryItemIDRef="invoiceStamp"/g) || []).length, 1);
    assert.equal((xml.match(/binaryItemIDRef="invoiceHeader"/g) || []).length, 3);
    assert.ok(!xml.includes('샘플고객') && !xml.includes('{{invoiceSubtitle}}'));
    await page.waitForFunction(() => window.inserts === 1);
    assert.equal(await charge().inputValue(), '');
    const again = await download(page.getByRole('button', { name: 'HWPX 다시 받기' }));
    assert.equal(await inspect(again), xml);
    await page.getByRole('button', { name: '다시 인쇄', exact: true }).click();
    await page.waitForFunction(() => window.prints.length === 1);
    assert.equal(await page.evaluate(() => window.inserts), 1);
    assert.ok((await page.evaluate(() => window.prints[0].values)).includes('400,000'));
    console.log('PASS HWPX save, guide FREE, original amounts, repeat download and print without duplicate charge');

    await ready(); await charge().fill('300000');
    await page.getByRole('button', { name: '인쇄&저장', exact: true }).click();
    await page.waitForFunction(() => window.prints.length === 1);
    const printThenHwpx = await download(page.getByRole('button', { name: 'HWPX 다시 받기' }));
    assert.match(await inspect(printThenHwpx), /300,000/);
    assert.equal(await page.evaluate(() => window.inserts), 1);
    console.log('PASS print then HWPX uses saved snapshot without duplicate charge');

    for (const flag of ['failTemplate', 'failInsert', 'failAuth']) {
      await ready(); await charge().fill('400000'); await page.evaluate(f => window[f] = true, flag);
      const before = dialogs.length; await submit().click();
      await page.waitForFunction(() => !document.querySelector('button.bg-emerald-600').disabled);
      assert.equal(await page.evaluate(() => window.inserts), 0);
      assert.ok(dialogs.length > before); assert.equal(await charge().inputValue(), '400,000');
    }
    await ready(); await charge().fill('400000');
    await page.evaluate(() => window.fixtureRows.push({id:'external',invoice_type:'deposit',amount:100000}));
    await submit().click(); await page.waitForFunction(() => !document.querySelector('button.bg-emerald-600').disabled);
    assert.equal(await page.evaluate(() => window.inserts), 0);
    console.log('PASS generation/auth/save failures and changed history prevent charges');

    const fixtures = await page.evaluate(async () => {
      const result = [];
      for (const count of [0, 3, 15, 60]) {
        const data = {reservationId:'demo',name:'가상 & <단체>',product:'관지산',departureDate:'2027-01-17',people:Array.from({length:count},(_,i)=>({name:`테스트 ${i+1}`,passport_name:'SAMPLE PERSON',is_guide:i===count-1})),sender:'담당자',receiver:'테스트 수신',date:'2026-11-03',invoiceType:'deposit',customerType:'agency',unitPrice:999000,total:1998000,previous:100000,current:400000,commission:0,dueDate:'2026-11-06',notice:'첫째 줄\n둘째 줄\n셋째 줄',account:{name:'테스트은행',number:'000-000',owner:'샘플'}};
        const blob = await window.hwpx.generateInvoiceHwpx(data);
        const zip = await window.JSZip.loadAsync(blob);
        const xml = await zip.file('Contents/section0.xml').async('string');
        const doc = new DOMParser().parseFromString(xml,'application/xml');
        const tables=[...doc.getElementsByTagNameNS('*','tbl')];
        const list=tables[5];
        result.push({count,rows:list.getElementsByTagNameNS('*','tr').length,inline:list.getElementsByTagNameNS('*','pos')[0].getAttribute('treatAsChar'),split:list.getAttribute('pageBreak'),errors:doc.getElementsByTagName('parsererror').length,bytes:Array.from(new Uint8Array(await blob.arrayBuffer()))});
      }
      return result;
    });
    fs.mkdirSync('coverage/invoice-hwpx', {recursive:true});
    for(const f of fixtures){ assert.equal(f.rows, f.count+1);assert.equal(f.errors,0);assert.equal(f.inline,'0');assert.equal(f.split,'CELL');fs.writeFileSync(`coverage/invoice-hwpx/flow-${f.count}.hwpx`,Buffer.from(f.bytes)); }
    assert.deepEqual(errors, []);
    console.log('PASS native editable XML, escaped text, 0/3/15/60 people with exact row counts');
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); server.close(); process.exitCode = 1; });
