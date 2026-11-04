const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const exportsObject = {};
const code = ts.transpileModule(fs.readFileSync('lib/google/zhangjiajie-seat-sync.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
new Function('require', 'exports', code)(() => ({}), exportsObject);
const build = exportsObject.buildZhangjiajieSeatUpdates;
const departures = [
  {id:'a',departure_date:'2027-03-02',course:'3박4일'},
  {id:'b',departure_date:'2027-03-03',course:'4박5일'},
];
const rows = [['2027-03-02','화','3박4일'],['2027-03-03','수','4박5일']];
test('hold/waiting occupy seats, confirmed only in confirmed, cancelled excluded, guides included', () => {
  const result = build(departures, [
    {departure_id:'a',people_count:3,status:'대기'},
    {departure_id:'a',people_count:2,status:'홀드'},
    {departure_id:'a',people_count:14,status:'확정',reservation_people:Array.from({length:15},(_,i)=>({id:String(i)}))},
    {departure_id:'a',people_count:99,status:'취소'},
    {departure_id:'b',people_count:0,status:null},
  ], rows);
  assert.deepEqual(result, [
    {range:"'좌석현황'!G2:H2",values:[[5,15]]},
    {range:"'좌석현황'!G3:H3",values:[[1,0]]},
  ]);
});
test('status transition moves hold to confirmed without doubling occupancy; cancellation restores seats', () => {
  for (const [status,expected] of [['대기',[7,0]],['확정',[0,7]],['취소',[0,0]]]) {
    assert.deepEqual(build(departures,[{departure_id:'a',people_count:7,status}],rows)[0].values[0],expected);
  }
});
test('sorting sheet rows still targets correct departure; only G:H are written', () => {
  const result=build(departures,[{departure_id:'a',people_count:2,status:'확정'}],[rows[1],[],rows[0]]);
  assert.deepEqual(result,[{range:"'좌석현황'!G2:H2",values:[[0,0]]},{range:"'좌석현황'!G4:H4",values:[[0,2]]}]);
});
test('title rows shift data without overwriting header or title', () => {
  const result=build(departures,[{departure_id:'a',people_count:3,status:'확정'}],rows,4);
  assert.deepEqual(result,[{range:"'좌석현황'!G4:H4",values:[[0,3]]},{range:"'좌석현황'!G5:H5",values:[[0,0]]}]);
});
test('missing/extra/duplicate dates and wrong patterns abort instead of writing partial counts', () => {
  assert.throws(()=>build(departures,[],rows.slice(0,1)),/시트에 없는/);
  assert.throws(()=>build(departures,[],[...rows,['2027-03-26','금','4박5일']]),/확인/);
  assert.throws(()=>build(departures,[],[rows[0],rows[0]]),/확인/);
  assert.throws(()=>build([...departures,departures[0]],[],rows),/중복/);
  assert.throws(()=>build(departures,[],[['2027-03-02','화','4박5일'],rows[1]]),/확인/);
  assert.throws(()=>build(departures,[{departure_id:'a',people_count:1,status:'알수없음'}],rows),/예약 상태/);
});

function loadRoute(path, authenticated) {
  const exports = {};
  let calls = 0;
  const code = ts.transpileModule(fs.readFileSync(path,'utf8'), {
    compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},
  }).outputText;
  new Function('require','exports',code)(id => {
    if(id==='next/server') return {NextResponse:{json:(body,options)=>({body,status:options?.status??200})}};
    if(id==='@/lib/auth/server') return {getAdminUser:async()=>authenticated,unauthorized:()=>({status:401})};
    if(id==='@supabase/supabase-js') return {createClient:()=>({})};
    if(id.endsWith('zhangjiajie-seat-sync')) return {syncZhangjiajieSeats:async()=>{calls++;return {success:true}}};
    throw Error(id);
  },exports);
  return {exports,calls:()=>calls};
}
test('manual and cron routes reject unauthorized requests before reading DB or writing Sheets', async()=>{
  const manual=loadRoute('app/api/admin/zhangjiajie/sync-google-sheet/route.ts',false);
  assert.equal((await manual.exports.POST(new Request('https://example.test'))).status,401);
  assert.equal(manual.calls(),0);
  const oldSecret=process.env.CRON_SECRET;
  process.env.CRON_SECRET='test-only-secret';
  try {
    const cron=loadRoute('app/api/cron/zhangjiajie-seat-sync/route.ts');
    assert.equal((await cron.exports.GET(new Request('https://example.test'))).status,401);
    assert.equal(cron.calls(),0);
  } finally {if(oldSecret===undefined)delete process.env.CRON_SECRET;else process.env.CRON_SECRET=oldSecret;}
});
