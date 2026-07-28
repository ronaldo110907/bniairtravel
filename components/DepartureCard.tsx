"use client";

type Departure = {
  id: string;
  product_id: string;
  departure_date: string;
  course: string;
  airline: string;
  price: number;
  seat: number;
  status: string;
};

type Props = {
  departure: Departure;
};

export default function DepartureCard({ departure }: Props) {
  return (
    <div className="border rounded-lg p-4 mb-3">
      <div>📅 {departure.departure_date}</div>
      <div>🛫 {departure.airline}</div>
      <div>🗓 {departure.course}</div>
      <div>💰 {departure.price.toLocaleString()}원</div>
      <div>💺 {departure.seat}석</div>
      <div>📌 {departure.status}</div>
    </div>
  );
}
