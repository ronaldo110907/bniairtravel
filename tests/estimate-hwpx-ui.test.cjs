// Synthetic browser integration: no production database reads or writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const ts = require('typescript');
const { chromium } = require('playwright');
const JSZip = require('jszip');
const graph = {}, root = process.cwd();
const mocks = {
  '@/lib/supabase': 'exports.supabase={from(){return {select(){return this},eq(){return this},order:async()=>({data:[]})}}};',
  '@/lib/importEstimatePdf': `exports.extractEstimateFromPdf=async()=>({form:{productName:'PDF 일정',includes:'PDF 포함',airfare:'999999',recipient:'덮어쓰면 안 됨'},priceMode:'combined',days:[{id:'pdf-1',region:'',transport:'ZE123',time:'09:00',schedule:'PDF 공항 미팅',breakfast:'',lunch:'',dinner:'',hotel:''}],warnings:[]});`,
  '@/lib/importEstimateExcel': 'exports.importEstimateExcel=async()=>{};',
  'jszip': 'module.exports=window.JSZip;',
  'react-to-print': 'exports.useReactToPrint=()=>()=>{window.printed=true};',
};
function add(file) {
  if (graph[file]) return file;
  let code = fs.readFileSync(file, 'utf8');
  if (/\.tsx?$/.test(file)) code = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  graph[file] = {code, deps:{}};
  for (const match of code.matchAll(/require\(["']([^"']+)["']\)/g)) {
    const name = match[1];
    if (mocks[name]) { graph[name] = {code:mocks[name],deps:{}}; graph[file].deps[name] = name; continue; }
    const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : name.startsWith('.') ? path.resolve(path.dirname(file), name) : null;
    const resolved = base ? ['', '.ts', '.tsx', '.js'].map(ext=>base+ext).find(fs.existsSync) : require.resolve(name,{paths:[path.dirname(file)]});
    graph[file].deps[name] = add(resolved);
  }
  return file;
}
const component = add(path.join(root,'app/admin/estimate/page.tsx'));
const react = add(require.resolve('react')), client = add(require.resolve('react-dom/client'));
const script = `const graph=${JSON.stringify(graph)},cache={};function load(id){if(cache[id])return cache[id];const m={exports:{}};cache[id]=m.exports;new Function('require','module','exports','process',graph[id].code)(n=>load(graph[id].deps[n]),m,m.exports,{env:{NODE_ENV:'production'}});return cache[id]=m.exports;}load(${JSON.stringify(client)}).createRoot(document.getElementById('root')).render(load(${JSON.stringify(react)}).createElement(load(${JSON.stringify(component)}).default));`;
const server = http.createServer((req,res)=>{
  if(req.url==='/bundle.js'){res.setHeader('Content-Type','application/javascript');res.end(script);}
  else if(req.url==='/jszip.js'){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(require.resolve('jszip/dist/jszip.min.js')));}
  else if(req.url==='/templates/invoice-master.hwpx')res.end(fs.readFileSync('public/templates/invoice-master.hwpx'));
  else {res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!DOCTYPE html><meta charset="utf-8"><div id="root"></div><script src="/jszip.js"></script><script src="/bundle.js"></script>');}
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page=await browser.newPage();
    const errors=[],dialogs=[];
    page.on('pageerror',e=>errors.push(e.message));
    let acceptImports=true;
    page.on('dialog',async d=>{dialogs.push(d.message());if(d.type()==='confirm'&&acceptImports)await d.accept();else await d.dismiss();});
    for(const mode of ['등록 상품 불러오기','자유 견적 작성']){
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.getByRole('button',{name:new RegExp(mode)}).click();
      await page.getByPlaceholder('예: [노팁/노옵션/품격] 연길/백두산 5일').fill(`${mode} & 수정 견적`);
      await page.getByPlaceholder('예: 금수학호텔 ★★★★☆ 또는 동급').fill('수정된 호텔 ★★★★');
      await page.getByPlaceholder(/연길 국제공항 도착 후 가이드 미팅/).fill('✈ 공항 미팅\n관광 후 호텔');
      const event=page.waitForEvent('download');
      await page.getByRole('button',{name:'한글 다운로드',exact:true}).click();
      const file=await event;
      assert.ok(file.suggestedFilename().includes(mode));
      const zip=await JSZip.loadAsync(fs.readFileSync(await file.path()));
      const text=await zip.file('Preview/PrvText.txt').async('string');
      assert.ok(text.includes(`${mode} & 수정 견적`));assert.ok(text.includes('수정된 호텔 ★★★★'));
      await page.getByPlaceholder('항공 별도인 경우 비워두세요').fill('888000');
      await page.getByPlaceholder('거래처명 검색 또는 직접 입력').fill('유지할 수신처');
      await page.getByPlaceholder('예: 금수학호텔 ★★★★☆ 또는 동급').fill('교체 전 호텔');
      const inputName=mode==='등록 상품 불러오기'?'기존 견적서 PDF 또는 한글 선택':'자유 견적서 한글 선택';
      const upload={name:file.suggestedFilename(),mimeType:'application/hwp+zip',buffer:fs.readFileSync(await file.path())};
      await page.getByLabel(inputName).setInputFiles(upload);
      await page.waitForFunction(()=>document.querySelector('input[placeholder="예: 금수학호텔 ★★★★☆ 또는 동급"]').value==='수정된 호텔 ★★★★');
      assert.equal(await page.getByPlaceholder('항공 별도인 경우 비워두세요').inputValue(),'888000');
      assert.equal(await page.getByPlaceholder('거래처명 검색 또는 직접 입력').inputValue(),'유지할 수신처');
      acceptImports=false;
      await page.getByPlaceholder('예: 금수학호텔 ★★★★☆ 또는 동급').fill('취소 시 유지 호텔');
      await page.getByLabel('자유 견적서 한글 선택').setInputFiles(upload);
      await page.waitForFunction(()=>![...document.querySelectorAll('button')].some(b=>/읽는 중/.test(b.textContent)));
      assert.equal(await page.getByPlaceholder('예: 금수학호텔 ★★★★☆ 또는 동급').inputValue(),'취소 시 유지 호텔');
      acceptImports=true;
      await page.getByRole('button',{name:'📄 A4 견적서 미리보기',exact:true}).click();
      assert.equal(await page.getByRole('button',{name:'한글 다운로드',exact:true}).count(),2);
      assert.equal(await page.getByRole('button',{name:'🖨️ 인쇄 / PDF 테스트',exact:true}).count(),1);
    }
    await page.route('**/templates/invoice-master.hwpx',route=>route.fulfill({status:500,body:''}));
    await page.getByRole('button',{name:'한글 다운로드',exact:true}).last().click();
    await page.waitForFunction(()=>![...document.querySelectorAll('button')].some(b=>b.textContent.includes('한글 파일 생성 중')));
    assert.ok(dialogs.some(text=>text.includes('양식을 불러오지 못했습니다')));
    assert.equal(await page.getByPlaceholder('예: [노팁/노옵션/품격] 연길/백두산 5일').inputValue(),'자유 견적 작성 & 수정 견적');
    await page.getByLabel('기존 견적서 PDF 또는 한글 선택').setInputFiles({name:'existing.pdf',mimeType:'application/pdf',buffer:Buffer.from('synthetic')});
    await page.waitForFunction(()=>document.querySelector('input[placeholder="예: [노팁/노옵션/품격] 연길/백두산 5일"]').value==='PDF 일정');
    assert.equal(await page.getByPlaceholder('항공 별도인 경우 비워두세요').inputValue(),'888000');
    assert.equal(await page.getByPlaceholder('거래처명 검색 또는 직접 입력').inputValue(),'유지할 수신처');
    assert.deepEqual(errors,[]);
    console.log('PASS product/free download buttons, edited values, preview/PDF preservation and failure recovery');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
