"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  departureId: string;
};

export default function RoomAssignment({ departureId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);

  const [bulkSingle, setBulkSingle] = useState(0);
  const [bulkTwin, setBulkTwin] = useState(0);
  const [bulkTriple, setBulkTriple] = useState(0);

  const [roomName, setRoomName] = useState("");

  const [roomType, setRoomType] = useState("2인실");
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isAssignmentCollapsed, setIsAssignmentCollapsed] = useState(false);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);

  const [people, setPeople] = useState<any[]>([]);

  const [memo, setMemo] = useState("");

  async function saveRoom() {
    if (!roomName.trim()) {
      alert("객실명을 입력해주세요.");
      return;
    }

    let error;

    if (editRoomId) {
      const result = await supabase
        .from("rooms")
        .update({
          room_name: roomName,
          room_type: roomType,
          memo,
        })
        .eq("id", editRoomId)
        .select();

      console.log(result);

      error = result.error;
    } else {
      const result = await supabase.from("rooms").insert({
        departure_id: departureId,
        room_name: roomName,
        room_type: roomType,
        memo,
      });

      error = result.error;
    }

    if (error) {
      alert(error.message);
      return;
    }

    alert("객실이 등록되었습니다.");
    await loadRooms();

    setEditRoomId(null);

    setRoomName("");
    setRoomType("2인실");
    setMemo("");
    setShowForm(false);
  }

  function getNextRoomNumber(prefix: string) {
    const numbers = rooms
      .map((room) => {
        const name = String(room.room_name ?? "");

        if (!name.startsWith(prefix)) return NaN;

        return Number(name.slice(prefix.length));
      })
      .filter((number) => Number.isFinite(number));

    if (numbers.length === 0) return 1;

    return Math.max(...numbers) + 1;
  }

  async function saveBulkRooms() {
    const singleCount = Math.max(0, Number(bulkSingle) || 0);
    const twinCount = Math.max(0, Number(bulkTwin) || 0);
    const tripleCount = Math.max(0, Number(bulkTriple) || 0);

    if (singleCount + twinCount + tripleCount === 0) {
      alert("생성할 객실 수를 입력해주세요.");
      return;
    }

    const newRooms = [];

    const singleStart = getNextRoomNumber("싱글");
    const twinStart = getNextRoomNumber("트윈");
    const tripleStart = getNextRoomNumber("트리플");

    for (let i = 0; i < singleCount; i++) {
      newRooms.push({
        departure_id: departureId,
        room_name: `싱글${singleStart + i}`,
        room_type: "1인실",
        memo: null,
      });
    }

    for (let i = 0; i < twinCount; i++) {
      newRooms.push({
        departure_id: departureId,
        room_name: `트윈${twinStart + i}`,
        room_type: "2인실",
        memo: null,
      });
    }

    for (let i = 0; i < tripleCount; i++) {
      newRooms.push({
        departure_id: departureId,
        room_name: `트리플${tripleStart + i}`,
        room_type: "3인실",
        memo: null,
      });
    }

    const { error } = await supabase.from("rooms").insert(newRooms);

    if (error) {
      alert(error.message);
      return;
    }

    await loadRooms();

    setBulkSingle(0);
    setBulkTwin(0);
    setBulkTriple(0);
    setShowBulkForm(false);

    alert(`${newRooms.length}개 객실이 생성되었습니다.`);
  }
  async function loadRooms() {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("departure_id", departureId)
      .order("created_at");

    setRooms(data ?? []);
  }

  async function loadRoomMembers() {
    const { data } = await supabase.from("room_members").select(`
      *,
      reservation_people (
        id,
        name
      )
    `);

    setRoomMembers(data ?? []);
  }

  async function loadPeople() {
    // 현재 출발일에 속한 예약만 조회
    const { data: reservations, error: reservationError } = await supabase
      .from("reservations")
      .select("id")
      .eq("departure_id", departureId);

    if (reservationError) {
      console.error("LOAD DEPARTURE RESERVATIONS ERROR", reservationError);
      setPeople([]);
      return;
    }

    const reservationIds = (reservations ?? []).map(
      (reservation) => reservation.id,
    );

    // 현재 출발일에 예약이 없으면 예약자도 없음
    if (reservationIds.length === 0) {
      setPeople([]);
      return;
    }

    // 위 예약들에 소속된 예약자만 조회
    const { data, error } = await supabase
      .from("reservation_people")
      .select("id, reservation_id, name")
      .in("reservation_id", reservationIds)
      .order("name");

    if (error) {
      console.error("LOAD DEPARTURE PEOPLE ERROR", error);
      setPeople([]);
      return;
    }

    setPeople(data ?? []);
  }

  function getRoomCapacity(roomType: string) {
    if (roomType === "1인실") return 1;
    if (roomType === "3인실") return 3;

    return 2;
  }

  async function selectPersonForRoom(room: any, personId: string) {
    const capacity = getRoomCapacity(room.room_type);

    const assignedCount = roomMembers.filter(
      (member) => member.room_id === room.id,
    ).length;

    const remainingCapacity = capacity - assignedCount;

    if (remainingCapacity <= 0) {
      alert("이미 객실 정원이 모두 배정되었습니다.");
      setSelectedRoomId(null);
      setSelectedPersonIds([]);
      return;
    }

    const isSelected = selectedPersonIds.includes(personId);

    let nextSelected: string[];

    if (isSelected) {
      nextSelected = selectedPersonIds.filter((id) => id !== personId);
    } else {
      if (selectedPersonIds.length >= remainingCapacity) {
        return;
      }

      nextSelected = [...selectedPersonIds, personId];
    }

    setSelectedPersonIds(nextSelected);

    // 객실에 필요한 인원이 모두 선택되면 한 번에 저장
    if (nextSelected.length === remainingCapacity) {
      const rows = nextSelected.map((id) => ({
        room_id: room.id,
        reservation_person_id: id,
      }));

      const { error } = await supabase.from("room_members").insert(rows);

      if (error) {
        alert(error.message);
        return;
      }

      await loadRoomMembers();

      setSelectedPersonIds([]);
      setSelectedRoomId(null);
    }
  }
  async function removePerson(roomMemberId: string) {
    const { error } = await supabase
      .from("room_members")
      .delete()
      .eq("id", roomMemberId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadRoomMembers();
  }

  useEffect(() => {
    loadRooms();
    loadRoomMembers();
    loadPeople();
  }, [departureId]);

  const currentRoomIds = new Set(rooms.map((room) => room.id));

  const assignedPersonIds = new Set(
    roomMembers
      .filter((member) => currentRoomIds.has(member.room_id))
      .map((member) => member.reservation_person_id),
  );

  const assignedCount = people.filter((person) =>
    assignedPersonIds.has(person.id),
  ).length;

  const assignmentComplete =
    people.length > 0 &&
    people.every((person) => assignedPersonIds.has(person.id));

  useEffect(() => {
    if (assignmentComplete) {
      setIsAssignmentCollapsed(true);
    }
  }, [assignmentComplete]);

  async function deleteRoom(id: string) {
    const ok = confirm("이 객실을 삭제하시겠습니까?");

    if (!ok) return;

    const { error } = await supabase.from("rooms").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadRooms();
  }

  async function editRoom(room: any) {
    setEditRoomId(room.id);

    setRoomName(room.room_name);
    setRoomType(room.room_type);
    setMemo(room.memo ?? "");

    setShowForm(true);
  }

  if (isAssignmentCollapsed && assignmentComplete) {
    return (
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="font-bold">🛏 객실 배정</div>

          <button
            type="button"
            onClick={() => setIsAssignmentCollapsed(false)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
          >
            ✅ 객실 배정완료 · {assignedCount}명
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">🛏 객실 배정</h2>

        <button
          onClick={() => setShowBulkForm(!showBulkForm)}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        >
          {showBulkForm ? "취소" : "+ 일괄 객실추가"}
        </button>
      </div>
      {showBulkForm && (
        <div className="mb-4 rounded-lg border bg-blue-50 p-4">
          <div className="mb-4 font-bold">🛏 객실 일괄 생성</div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                싱글룸 (1인실)
              </label>

              <input
                type="number"
                min="0"
                value={bulkSingle}
                onChange={(e) => setBulkSingle(Number(e.target.value))}
                className="w-full rounded-lg border bg-white px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                트윈룸 (2인실)
              </label>

              <input
                type="number"
                min="0"
                value={bulkTwin}
                onChange={(e) => setBulkTwin(Number(e.target.value))}
                className="w-full rounded-lg border bg-white px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                트리플룸 (3인실)
              </label>

              <input
                type="number"
                min="0"
                value={bulkTriple}
                onChange={(e) => setBulkTriple(Number(e.target.value))}
                className="w-full rounded-lg border bg-white px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            자동 생성: 싱글1 · 트윈1 · 트리플1 형식으로 객실번호가 지정됩니다.
          </div>

          <button
            onClick={saveBulkRooms}
            className="mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
          >
            객실 일괄 생성
          </button>
        </div>
      )}
      {showForm && (
        <div className="mb-4 rounded-lg border bg-gray-50 p-4">
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium">객실번호</label>

            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="예 : ROOM1"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">객실유형</label>

            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option>1인실</option>
              <option>2인실</option>
              <option>3인실</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">메모</label>

            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예 : 부부 / 가족 / 인솔자"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <button
            onClick={saveRoom}
            className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
          >
            저장
          </button>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-gray-500">
          아직 등록된 객실이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="font-bold">{room.room_name}</div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editRoom(room)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    수정
                  </button>

                  <button
                    onClick={() => deleteRoom(room.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">{room.room_type}</div>

              {room.memo && <div className="mt-2 text-sm">📝 {room.memo}</div>}
              <div className="mt-3 border-t pt-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-gray-700">
                    예약자
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPersonIds([]);

                      setSelectedRoomId(
                        selectedRoomId === room.id ? null : room.id,
                      );
                    }}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                  >
                    + 객실배정
                  </button>
                  {selectedRoomId === room.id && (
                    <div className="mt-3 rounded border bg-gray-50 p-2">
                      {people
                        .filter(
                          (person) =>
                            !roomMembers.some(
                              (member) =>
                                member.reservation_person_id === person.id,
                            ),
                        )
                        .map((person) => (
                          <div
                            key={person.id}
                            onClick={() => selectPersonForRoom(room, person.id)}
                            className={`cursor-pointer rounded px-2 py-1 ${
                              selectedPersonIds.includes(person.id)
                                ? "bg-blue-100 font-semibold text-blue-700"
                                : "hover:bg-white"
                            }`}
                          >
                            👤 {person.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {roomMembers.filter((member) => member.room_id === room.id)
                  .length === 0 ? (
                  <div className="mt-2 text-sm text-gray-500">예약자 없음</div>
                ) : (
                  <div className="mt-2 space-y-1">
                    {roomMembers
                      .filter((member) => member.room_id === room.id)
                      .map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span>👤 {member.reservation_people?.name}</span>

                          <button
                            onClick={() => removePerson(member.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
