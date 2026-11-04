import { supabaseAdmin } from "./supabaseAdmin";
import type { Departure } from "../components/DepartureCalendar";

type Booking = { departure_id: string | null; status: string | null; people_count: number | null; reservation_people: { id: string }[] | null };
export function countOccupiedSeats(bookings: Booking[]) {
  const counts = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.status === "취소" || !booking.departure_id) continue;
    const count = Math.max(Number(booking.people_count) || 0, booking.reservation_people?.length || 0, 1);
    counts.set(booking.departure_id, (counts.get(booking.departure_id) ?? 0) + count);
  }
  return counts;
}

// Server page only: return departure details and aggregate counts, never passenger data.
export async function getZhangjiajiePublicDepartures(productId: string): Promise<Departure[]> {
  const { data, error } = await supabaseAdmin.from("departures")
    .select("id,departure_date,course,variant,airline,price,seat,status,is_special")
    .eq("product_id", productId).order("departure_date");
  if (error) throw new Error("출발일을 불러오지 못했습니다.");
  if (!data?.length) return [];
  const bookings: Booking[] = [];
  for (let offset = 0; ; offset += 500) {
    const result = await supabaseAdmin.from("reservations")
      .select("id,departure_id,status,people_count,reservation_people(id)")
      .in("departure_id", data.map(d => d.id)).order("id").range(offset, offset + 499);
    if (result.error) throw new Error("좌석현황을 불러오지 못했습니다.");
    bookings.push(...result.data as Booking[]);
    if (result.data.length < 500) break;
  }
  const counts = countOccupiedSeats(bookings);
  return data.map(d => {
    const seats = Number(d.seat ?? 0) - (counts.get(d.id) ?? 0);
    return { id: d.id, date: d.departure_date, course: d.course, variant: d.variant,
      airline: d.airline, price: d.price, seats, is_special: Boolean(d.is_special),
      status: ["마감", "예약마감"].includes(d.status) || seats <= 0 ? "closed" : "available" };
  });
}
