const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = {};
function load(file) {
  if (cache[file]) return cache[file];
  const e = cache[file] = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', code)(name => name === './sheets' ? {} : name.startsWith('.') ? load(path.join(path.dirname(file), name + '.ts')) : require(name), e);
  return e;
}
const {XIAMEN_BLOCKS, buildXiamenSyncRequests: build, resolveXiamenLayout} = load('lib/google/xiamen-seat-sync.ts');
const {buildXiamenPriceLayout: migrate} = load('lib/google/xiamen-price-layout.ts');
const str = v => ({userEnteredValue:{stringValue:v}});
const departures = XIAMEN_BLOCKS.flatMap(b => b.dates.flatMap(date => b.variants.map((v,i) => ({id:date+v.name, departure_date:date, variant:v.name, seat:28, price:1299000+i*100000}))));
function fixture() {
  const rows=Array.from({length:26},()=>({values:[]}));
  for(const [n,b] of XIAMEN_BLOCKS.entries()){
    const h=n?13:3;
    rows[h].values=[str(b.course),str('출발일'),...b.dates.map(str),str('합계')];
    for(const [offset,label] of [[3,'보유좌석'],[4,'통합 모객석'],[5,'통합 잔여석'],...b.variants.map((v,i)=>[6+i,v.label])])rows[h+offset].values=[{},str(label)];
  }
  return {properties:{sheetId:0,title:'좌석현황'},data:[{rowData:rows}],conditionalFormats:[]};
}
function value(plan,row,col){const r=plan.requests.find(r=>r.updateCells?.range.startRowIndex===row&&r.updateCells.range.startColumnIndex===col);return r?.updateCells.rows[0].values.map(c=>Object.values(c.userEnteredValue)[0]);}
const res=(id,count,status='확정',actual=0)=>({departure_id:id,people_count:count,status,reservation_people:Array.from({length:actual},(_,i)=>({id:String(i)}))});
test('old and new layouts preserve seat totals; guides occupy seats and cancellation does not',()=>{
 const sheet=fixture();const revised=migrate(sheet).preview;
 const r=[res(departures[0].id,14,'확정',15),res(departures[1].id,14,'대기'),res(departures[0].id,99,'취소')];
 for(const s of [sheet,revised]){
   const p=build(departures,r,s);assert.equal(p.seatUsage.threeNight,29);assert.equal(value(p,6,2)[0],28);
   assert.equal(value(p,8,2)[0],'=IF(C7="","",C7-C8)');
 }
 assert.equal(value(build(departures,r,revised),7,2)[0],'=C10+C12');
 assert.equal(value(build(departures,r,revised),19,2)[0],'=C22+C24+C26');
});
test('prices are mapped by variant/date, handle special rates, null and zero, and are not summed',()=>{
 const s=migrate(fixture()).preview;const d=structuredClone(departures);d[0].price=1549000;d[1].price=0;d[2].price=null;
 const p=build(d.reverse(),[],s);
 assert.equal(value(p,10,2)[0],1549000);assert.equal(value(p,12,2)[0],0);assert.equal(value(p,10,2)[1],'미등록');assert.equal(p.warnings.length,1);
 for(const b of resolveXiamenLayout(s))for(const v of b.variants)assert.deepEqual(value(p,v.priceRow,b.totalColumn),['']);
});
test('reordered date columns still match the right price and people',()=>{
 const s=migrate(fixture()).preview;const cells=s.data[0].rowData[3].values;[cells[2],cells[3]]=[cells[3],cells[2]];
 const d=structuredClone(departures);d[0].price=111;d[2].price=222;
 const p=build(d,[res(d[0].id,7)],s);assert.deepEqual(value(p,10,2).slice(0,2),[222,111]);assert.deepEqual(value(p,9,2).slice(0,2),[0,7]);
});
test('partial price rows, shifted date headers, missing or duplicate departure abort before writes',()=>{
 const s=fixture();s.data[0].rowData[10].values[1]=str('↳ 1인 상품가');assert.throws(()=>build(departures,[],s));
 const bad=fixture();bad.data[0].rowData[3].values[2]=str('2028-01-01');assert.throws(()=>build(departures,[],bad),/출발일/);
 assert.throws(()=>build(departures.slice(1),[],fixture()),/출발일/);
 assert.throws(()=>build([...departures,departures[0]],[],fixture()),/중복/);
 const seats=structuredClone(departures);seats[0].seat=29;assert.throws(()=>build(seats,[],fixture()),/보유좌석/);
});
test('migration is idempotent, inserts five rows, preserves column widths and source',()=>{
 const s=fixture(),before=JSON.stringify(s),p=migrate(s);
 assert.equal(JSON.stringify(s),before);assert.equal(p.requests.filter(r=>r.insertDimension).length,5);assert.equal(migrate(p.preview).requests.length,0);
 assert.ok(p.requests.filter(r=>r.updateDimensionProperties).every(r=>r.updateDimensionProperties.range.dimension==='ROWS'));
 assert.deepEqual(resolveXiamenLayout(p.preview).flatMap(b=>b.variants.map(v=>v.priceRow)),[10,12,22,24,26]);
});
test('zero sheetId omitted by Google is deduplicated, unrelated conditions stay intact',()=>{
 const s=fixture();const rule={ranges:[{startRowIndex:8,endRowIndex:9,startColumnIndex:2,endColumnIndex:19}],booleanRule:{condition:{type:'CUSTOM_FORMULA',values:[{userEnteredValue:'=AND(ISNUMBER(C9),C9=0)'}]}}};
 s.conditionalFormats=[rule,rule,{ranges:rule.ranges,booleanRule:{condition:{type:'NUMBER_LESS',values:[{userEnteredValue:'0'}]}}}];
 const p=build(departures,[],s);assert.deepEqual(p.requests.filter(r=>r.deleteConditionalFormatRule).map(r=>r.deleteConditionalFormatRule.index),[1,0]);
 assert.equal(p.requests.filter(r=>r.addConditionalFormatRule).length,2);
});
test('legacy seats remain counted without treating product prices as occupancy',()=>{
 const d=[...departures,{id:'legacy',departure_date:'2026-12-03',variant:'하문실속',seat:28,price:999000}];
 const p=build(d,[res('legacy',3)],migrate(fixture()).preview);assert.equal(p.seatUsage.threeNight,3);assert.equal(value(p,7,2)[0],'=C10+C12+3');
});
