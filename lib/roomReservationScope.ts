type Room = { id: string; reservation_id?: string | null };
type Member = { room_id: string; reservation_people?: { reservation_id?: string | null } | null };

export function roomHasOtherReservation(roomId: string, members: Member[], reservationId?: string) {
  return !!reservationId && members.some(member => member.room_id === roomId && member.reservation_people?.reservation_id !== reservationId);
}

export function roomsForReservation<T extends Room>(rooms: T[], members: Member[], reservationId?: string): T[] {
  if (!reservationId) return rooms;
  return rooms.filter(room => {
    const occupants = members.filter(member => member.room_id === room.id);
    if (occupants.some(member => member.reservation_people?.reservation_id === reservationId)) return true;
    if (room.reservation_id) return room.reservation_id === reservationId;
    // Legacy departure rooms have no reservation owner. Reuse empty rooms or
    // rooms already containing this reservation, without exposing other groups.
    return occupants.length === 0;
  });
}
