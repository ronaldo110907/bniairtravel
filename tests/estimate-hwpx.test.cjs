// Browser DOM + synthetic data only. Set NODE_PATH to bundled Playwright packages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const ts = require('typescript');
const { chromium } = require('playwright');
const JSZip = require('jszip');
const compiled = ts.transpileModule(fs.readFileSync('lib/estimateHwpx.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const bundle = `const module={exports:{}};new Function('require','module','exports',${JSON.stringify(compiled)})(()=>window.JSZip,module,module.exports);window.estimate=module.exports;`;
const server = http.createServer((req, res) => {
  if (req.url === '/generator.js') { res.setHeader('Content-Type', 'application/javascript'); res.end(bundle); }
  else if (req.url === '/jszip.js') { res.setHeader('Content-Type', 'application/javascript'); res.end(fs.readFileSync(require.resolve('jszip/dist/jszip.min.js'))); }
  else if (req.url === '/templates/invoice-master.hwpx') res.end(fs.readFileSync('public/templates/invoice-master.hwpx'));
  else { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end('<!DOCTYPE html><meta charset="utf-8"><script src="/jszip.js"></script><script src="/generator.js"></script>'); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => console.error(error));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const fixtures = await page.evaluate(async () => {
      const f = { recipient: '테스트 여행사', sender: '담당자', sentDate: '2026-11-18', productName: '하문고품격 테스트', travelPeriod: '2026-12-24 ~ 2026-12-28',
        includes: '✈ 왕복항공료\n호텔 / 식사 / 가이드', excludes: '개인경비 & <선택관광>', shopping: '쇼핑 2회', options: '선택관광 없음', remarks: '원문을 그대로 보존합니다.\n두 번째 줄',
        combinedPrice: '1299000', combinedCurrency: 'KRW', airfare: '500000', airfareCurrency: 'KRW', landCost: '400', landCurrency: 'USD' };
      const d = { region: '청주\n하문', transport: '이스타항공 ZE123\n전용차량', time: '09:00\n13:00', schedule: '✈ 청주공항 출발\n현지 도착 후 가이드 미팅\n▶ 관광 후 호텔 투숙', breakfast: '불포함', lunch: '기내식', dinner: '현지식', hotel: '테스트호텔 ★★★★ 또는 동급' };
      const result = [];
      for (const [name, priceMode, days] of [['combined', 'combined', [d, d, d]], ['split', 'split', [d]], ['compact-five-days', 'combined', Array.from({ length: 5 }, () => ({ ...d, schedule: ['호텔 조식 후 출발', '전용차량으로 이동', '오전 주요 관광지 방문', '현지식으로 중식', '오후 관광 및 자유시간', '석식 후 호텔 투숙'].join('\n') }))], ['long', 'combined', Array.from({ length: 8 }, (_, i) => ({ ...d, schedule: `DAY-${i + 1}-START\n` + '긴 일정 원문 보존 🚌 '.repeat(100) + `\nDAY-${i + 1}-END` }))]]) {
        const data = { form: f, priceMode, days };
        const blob = await window.estimate.generateEstimateHwpx(data);
        const zip = await window.JSZip.loadAsync(blob);
        const xml = await zip.file('Contents/section0.xml').async('string');
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        const headerDoc = new DOMParser().parseFromString(await zip.file('Contents/header.xml').async('string'), 'application/xml');
        for (const face of headerDoc.getElementsByTagNameNS('*', 'fontface')) {
          const lang = face.getAttribute('lang').toLowerCase();
          for (const ref of headerDoc.getElementsByTagNameNS('*', 'fontRef')) {
            const font = [...face.children].find(f => f.getAttribute('id') === ref.getAttribute(lang));
            if (font?.getAttribute('face') !== '맑은 고딕') throw Error(`Incorrect default font: ${lang}`);
          }
        }
        const all = name => [...doc.getElementsByTagNameNS('*', name)];
        result.push({name, bytes: Array.from(new Uint8Array(await blob.arrayBuffer())), text: all('t').map(t => t.textContent).join('\n'), errors: all('parsererror').length,
          tables: all('tbl').map(t => ({declared: Number(t.getAttribute('rowCnt')), actual: [...t.children].filter(c => c.localName === 'tr').length, inline: t.getElementsByTagNameNS('*', 'pos')[0].getAttribute('treatAsChar'), split: t.getAttribute('pageBreak')})),
          pics: all('pic').length, prices: window.estimate.estimatePriceRows(data), filename: window.estimate.estimateFilename(data),
          tableHeight: all('tbl').reduce((sum,t)=>sum+Number([...t.children].find(c=>c.localName==='sz').getAttribute('height')),0),
          pictureHeight: all('pic').reduce((sum,p)=>sum+Number([...p.children].find(c=>c.localName==='sz').getAttribute('height')),0),
          font: Number(new DOMParser().parseFromString(await zip.file('Contents/header.xml').async('string'),'application/xml').querySelector('charPr[id="38"]').getAttribute('height')) });
      }
      const sameCurrency = window.estimate.estimatePriceRows({form: {...f,landCost:'200000',landCurrency:'KRW'},priceMode:'split',days:[]});
      const original = '🚌特殊&<文字>'.repeat(400);
      if (window.estimate.estimateTextChunks(original).join('') !== original) throw Error('Truncated long text');
      if (sameCurrency[2][1] !== '700,000원') throw Error('Incorrect same-currency total');
      return result;
    });
    fs.mkdirSync('coverage/estimate-hwpx', { recursive: true });
    for (const f of fixtures) {
      assert.equal(f.errors, 0); assert.equal(f.pics, 1);
      for (const t of f.tables) { assert.equal(t.declared, t.actual); assert.equal(t.inline, '0'); assert.equal(t.split, 'CELL'); }
      for (const text of ['테스트 여행사', '하문고품격 테스트', '2026-12-24 ~ 2026-12-28', '개인경비 & <선택관광>', '테스트호텔 ★★★★ 또는 동급', '두 번째 줄']) assert.ok(f.text.includes(text), text);
      assert.ok(!f.text.includes('{{') && !f.text.includes('CANCELLATION POLICY'));
      if (f.name === 'combined') assert.deepEqual(f.prices, [['입금가', '1,299,000원']]);
      if (f.name === 'split') assert.deepEqual(f.prices, [['항공료','500,000원'],['지상비','$400']]);
      if (f.name === 'long') for (let i = 1; i <= 8; i++) { assert.ok(f.text.includes(`DAY-${i}-START`)); assert.ok(f.text.includes(`DAY-${i}-END`)); }
      assert.ok(f.font >= 800 && f.font <= 950);
      if (f.name !== 'long') assert.ok(f.tableHeight + f.pictureHeight + 9000 + f.tables.length * 180 <= 84188 - 3402, `${f.name} exceeds the one-page layout budget`);
      fs.writeFileSync(`coverage/estimate-hwpx/${f.name}.hwpx`, Buffer.from(f.bytes));
    }
    await page.route('**/templates/invoice-master.hwpx', route => route.fulfill({ status: 500, body: '' }));
    assert.equal(await page.evaluate(async () => { try { await window.estimate.generateEstimateHwpx({}); return false; } catch { return true; } }), true);
    console.log('PASS editable HWPX, header, all fields, emoji, combined/split currencies, long text flow, filenames and failed template handling');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
