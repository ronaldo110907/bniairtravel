export type ConfirmationDay = {
  region: string; transport: string; time: string; schedule: string;
  meals: string; hotel: string | null;
};
export type ConfirmationProduct = {
  id: string; productSlug: string; label: string; title: string;
  nights: number; variants: string[]; meeting: string;
  included: string; excluded: string; shopping: string; options: string;
  notice: string; days: ConfirmationDay[];
};
export type Departure = {
  id: string; departure_date: string; course?: string | null; variant?: string | null;
  products?: { title?: string; slug?: string } | null;
};
export type Reservation = {
  id: string; name?: string; product?: string; status?: string;
  people_count?: number | null; people?: { id: string }[];
};
export type Room = { id: string; reservation_id?: string | null; room_name?: string; room_type?: string };
export type RoomMember = { room_id: string; reservation_person_id: string };
export type ConfirmationInput = {
  product: ConfirmationProduct; departureDate: string; groupName: string;
  people: string; rooms: string; pickupSign: string; guide: string; vehicle: string;
  meeting: string; meetingContact: string;
};

export function calendarDate(value: string, offset = 0): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("출발일을 확인해주세요.");
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new Error("올바른 출발일이 아닙니다.");
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}
export function displayDate(date: Date) {
  return `${date.toISOString().slice(0, 10).replaceAll("-", ".")}(${"일월화수목금토"[date.getUTCDay()]})`;
}
export function courseDuration(course = "") {
  const match = course.replace(/\s/g, "").toUpperCase().match(/^(\d+)(?:N|박)(\d+)(?:D|일)$/);
  return match ? { nights: Number(match[1]), days: Number(match[2]) } : null;
}
export function matchProduct(products: ConfirmationProduct[], departure: Departure) {
  const duration = courseDuration(departure.course ?? "");
  const variant = (departure.variant ?? "").replace(/\s/g, "");
  const matches = products.filter(p => p.productSlug === departure.products?.slug &&
    duration?.days === p.days.length && duration.nights === p.nights &&
    p.variants.some(v => v.replace(/\s/g, "") === variant));
  return matches.length === 1 ? matches[0] : undefined;
}
export function countPeople(reservations: Reservation[]) {
  let total = 0; const warnings: string[] = [];
  for (const r of reservations.filter(r => r.status !== "취소")) {
    const saved = Number(r.people_count); const listed = r.people?.length ?? 0;
    const valid = Number.isInteger(saved) && saved > 0;
    total += valid ? saved : listed;
    if ((valid && listed > 0 && saved !== listed) || (!valid && !listed))
      warnings.push(`${r.name || "예약"}: 예약 인원과 명단을 확인해주세요.`);
  }
  return { total, warnings };
}
export function summarizeRooms(rooms: Room[], members: RoomMember[], selected: Reservation[]) {
  const reservationIds = new Set(selected.map(r => String(r.id)));
  const people = new Set(selected.flatMap(r => r.people ?? []).map(p => String(p.id)));
  const counts = new Map<string, number>(); const warnings: string[] = [];
  const assigned = new Set<string>();
  for (const room of rooms) {
    const occupants = members.filter(m => String(m.room_id) === String(room.id));
    const ours = occupants.filter(m => people.has(String(m.reservation_person_id)));
    const direct = !!room.reservation_id && reservationIds.has(String(room.reservation_id));
    if (!ours.length && !direct) continue;
    if (occupants.length !== ours.length) {
      warnings.push("선택하지 않은 예약과 함께 배정된 객실이 있습니다. 객실 수를 직접 확인해주세요.");
      continue;
    }
    ours.forEach(m => assigned.add(String(m.reservation_person_id)));
    const label = room.room_name?.startsWith("트윈") ? "트윈" : room.room_type || "객실";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  if (assigned.size < people.size) warnings.push("일부 인원의 객실 배정이 없거나 확인되지 않았습니다.");
  return { text: [...counts].map(([type, n]) => `${type} ${n}실`).join(" / "), warnings: [...new Set(warnings)] };
}
export function safeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").replace(/[. ]+$/g, "").slice(0, 140) || "확정서";
}
