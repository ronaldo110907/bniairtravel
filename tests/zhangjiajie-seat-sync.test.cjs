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
const planSync = exportsObject.buildZhangjiajieSyncRequests;
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

function sheetFixture() {
  const values = (date, course, price, note) => [
    {userEnteredValue:{numberValue:1}},
    {formattedValue:date,userEnteredValue:{numberValue:1},userEnteredFormat:{numberFormat:{type:'DATE',pattern:'yyyy-mm-dd'}}},
    {userEnteredValue:{formulaValue:'=CHOOSE(WEEKDAY(B4),"일","월","화","수","목","금","토")'}},
    {userEnteredValue:{stringValue:course}},
    {userEnteredValue:{numberValue:price},userEnteredFormat:{backgroundColor:{red:1,green:1,blue:0}}},
    {userEnteredValue:{numberValue:16}},
    {userEnteredValue:{numberValue:0}},
    {userEnteredValue:{numberValue:0}},
    {userEnteredValue:{formulaValue:'=IF(F4="","",F4-G4-H4)'},userEnteredFormat:{numberFormat:{type:'NUMBER',pattern:'0;-0;"마감"'}}},
    {userEnteredValue:{stringValue:note},note:'keep note',userEnteredFormat:{wrapStrategy:'CLIP'}},
  ];
  return {
    properties:{sheetId:123,title:'좌석현황',gridProperties:{rowCount:5,columnCount:10}},
    basicFilter:{range:{sheetId:123,startRowIndex:2,endRowIndex:5,startColumnIndex:0,endColumnIndex:10}},
    conditionalFormats:[{ranges:[{sheetId:123,startRowIndex:3,endRowIndex:5,startColumnIndex:8,endColumnIndex:9}],
      booleanRule:{condition:{type:'CUSTOM_FORMULA',values:[{userEnteredValue:'=I4<0'}]},format:{textFormat:{bold:true}}}}],
    data:[{rowMetadata:[{},{},{},{pixelSize:34}],rowData:[
      {values:[{userEnteredValue:{stringValue:'title'}}]}, {values:[]},
      {values:[{}, {userEnteredValue:{stringValue:'날짜'}},{},{userEnteredValue:{stringValue:'패턴'}}]},
      {values:values('2027-03-03','4박5일',1550000,'later date')},
      {values:values('2027-03-02','3박4일',1330000,'earlier date')},
    ]}],
  };
}
const detailedDepartures = departures.map(d=>({...d,price:1400000,seat:20}));
const addedDeparture = {id:'c',departure_date:'2027-03-26',course:'4박5일',price:1430000,seat:20};

function table(plan) {
  return plan.requests.find(r=>r.updateCells?.fields.includes('userEnteredValue')).updateCells.rows;
}
// Model atomic table snapshots, including clearing the previous tail, to catch
// retry/concurrent append duplication rather than just checking request counts.
function applyPlan(sheet, plan) {
  for (const request of plan.requests) {
    if (request.appendDimension) sheet.properties.gridProperties.rowCount += request.appendDimension.length;
    if (request.repeatCell) sheet.data[0].rowData = sheet.data[0].rowData.slice(0,request.repeatCell.range.startRowIndex);
    if (request.updateCells?.fields.includes('userEnteredValue')) {
      sheet.data[0].rowData.push(...structuredClone(request.updateCells.rows));
    }
  }
  for (const row of sheet.data[0].rowData.slice(3)) {
    const serial=row.values[1].userEnteredValue.numberValue;
    row.values[1].formattedValue=new Date((serial-25569)*86400000).toISOString().slice(0,10);
  }
}
test('new March 26 is added, sorted, uses website seats, and keeps existing price/notes/styles', () => {
  const sheet=sheetFixture();
  const before=structuredClone(sheet);
  const result=planSync([...detailedDepartures,addedDeparture],[
    {departure_id:'c',people_count:14,status:'확정',reservation_people:Array.from({length:15},(_,i)=>({id:String(i)}))},
    {departure_id:'c',people_count:6,status:'대기'},
  ],sheet);
  assert.deepEqual(sheet,before);
  assert.equal(result.addedCount,1);
  assert.deepEqual(result.seatUsage,{hold:6,confirmed:15,total:21});
  const output=table(result).map(r=>r.values);
  assert.deepEqual(output.map(r=>r[0].userEnteredValue.numberValue),[1,2,3]);
  assert.deepEqual(output.map(r=>r[5].userEnteredValue.numberValue),[20,20,20]);
  assert.equal(output[1][4].userEnteredValue.numberValue,1550000);
  assert.deepEqual(output[1][4].userEnteredFormat,before.data[0].rowData[3].values[4].userEnteredFormat);
  assert.equal(output[1][9].userEnteredValue.stringValue,'later date');
  assert.equal(output[1][9].note,'keep note');
  assert.equal(output[2][4].userEnteredValue.numberValue,1430000);
  assert.equal(output[2][9].userEnteredValue,undefined);
  assert.equal(output[2][8].userEnteredValue.formulaValue,'=IF(F6="","",F6-G6-H6)');
  assert.equal(output[0][2].userEnteredValue.formulaValue,'=CHOOSE(WEEKDAY(B4),"일","월","화","수","목","금","토")');
  assert.equal(result.requests.find(r=>r.appendDimension).appendDimension.length,1);
  assert.equal(result.requests.find(r=>r.updateDimensionProperties).updateDimensionProperties.properties.pixelSize,34);
  assert.equal(result.requests.find(r=>r.updateConditionalFormatRule).updateConditionalFormatRule.rule.ranges[0].endRowIndex,undefined);
  assert.equal(result.requests.find(r=>r.setBasicFilter).setBasicFilter.filter.range.endRowIndex,undefined);
});
test('repeat sync and two plans made from same snapshot never duplicate dates', () => {
  const sheet=sheetFixture();
  const all=[...detailedDepartures,addedDeparture];
  const first=planSync(all,[],sheet);
  const concurrent=planSync(all,[],sheet);
  applyPlan(sheet,first);
  applyPlan(sheet,concurrent);
  assert.equal(sheet.data[0].rowData.length,6);
  const next=planSync(all,[],sheet);
  assert.equal(next.addedCount,0);
  assert.equal(next.requests.some(r=>r.appendDimension),false);
  assert.equal(JSON.stringify(table(next)),JSON.stringify(table(first)));
});
test('zero seats remain zero and unset seats stay blank, never defaulting to sixteen', () => {
  const result=planSync([{...detailedDepartures[0],seat:0},{...detailedDepartures[1],seat:null}],[],sheetFixture());
  assert.deepEqual(table(result).map(r=>r.values[5].userEnteredValue),[{numberValue:0},{}]);
});
test('invalid seats, extra sheet dates and duplicate DB dates stop before any mutation', () => {
  assert.throws(()=>planSync([{...detailedDepartures[0],seat:-1},detailedDepartures[1]],[],sheetFixture()),/총좌석/);
  assert.throws(()=>planSync([detailedDepartures[0]],[],sheetFixture()),/시트와 출발일/);
  assert.throws(()=>planSync([...detailedDepartures,detailedDepartures[0]],[],sheetFixture()),/중복/);
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
