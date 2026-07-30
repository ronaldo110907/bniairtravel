"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  departureId: string;
};

export default function RoomAssignment({ departureId }: Props) {
  const [showForm, setShowForm] = useState(false);

  const [roomName, setRoomName] = useState("");

  const [roomType, setRoomType] = useState("2인실");
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

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
    const { data } = await supabase
      .from("reservation_people")
      .select("id, reservation_id, name")
      .order("name");

    setPeople(data ?? []);
  }

  async function assignPerson(roomId: string, personId: string) {
    const { error } = await supabase.from("room_members").insert({
      room_id: roomId,
      reservation_person_id: personId,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await loadRoomMembers();

    setSelectedRoomId(null);
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
  }, []);

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

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">🛏 객실 배정</h2>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        >
          {showForm ? "취소" : "+ 객실 추가"}
        </button>
      </div>
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
                    onClick={() =>
                      setSelectedRoomId(
                        selectedRoomId === room.id ? null : room.id,
                      )
                    }
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
                            onClick={() => assignPerson(room.id, person.id)}
                            className="cursor-pointer rounded px-2 py-1 hover:bg-white"
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
