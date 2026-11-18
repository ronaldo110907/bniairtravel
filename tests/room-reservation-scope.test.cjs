const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const exported = {};
new Function('exports', ts.transpileModule(fs.readFileSync('lib/roomReservationScope.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText)(exported);
const { roomsForReservation, roomHasOtherReservation } = exported;
const rooms = [
  { id: 'legacy-a' }, { id: 'legacy-b' }, { id: 'empty' }, { id: 'mixed' },
  { id: 'owned-a', reservation_id: 'a' }, { id: 'owned-b', reservation_id: 'b' },
];
const member = (room_id, reservation_id) => ({ room_id, reservation_people: { reservation_id } });
const members = [member('legacy-a', 'a'), member('legacy-b', 'b'), member('mixed', 'a'), member('mixed', 'b')];
test('reservation sees its legacy/new rooms and shared empty rooms, not another company rooms', () => {
  assert.deepEqual(roomsForReservation(rooms, members, 'a').map(r => r.id), ['legacy-a', 'empty', 'mixed', 'owned-a']);
  assert.deepEqual(roomsForReservation(rooms, members, 'b').map(r => r.id), ['legacy-b', 'empty', 'mixed', 'owned-b']);
});
test('departure-wide view retains all rooms', () => {
  assert.deepEqual(roomsForReservation(rooms, members), rooms);
});
test('mixed rooms and unknown occupants are protected from reservation-scoped deletion', () => {
  assert.equal(roomHasOtherReservation('mixed', members, 'a'), true);
  assert.equal(roomHasOtherReservation('legacy-a', members, 'a'), false);
  assert.equal(roomHasOtherReservation('mixed', members), false);
  assert.equal(roomHasOtherReservation('unknown', [{ room_id: 'unknown' }], 'a'), true);
});
test('existing occupants remain visible even in a room owned by another reservation', () => {
  assert.deepEqual(roomsForReservation([rooms[5]], [member('owned-b', 'a')], 'a'), [rooms[5]]);
});
