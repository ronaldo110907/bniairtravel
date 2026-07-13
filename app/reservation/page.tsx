"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReservationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const product = searchParams.get("product") || "";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitReservation(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.from("reservations").insert({
      name,
      phone,
      product,
      departure_date: departureDate,
      message,
      status: "대기",
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("예약 문의가 접수되었습니다.");
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-6 py-24">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-8 text-3xl font-bold">
          예약 문의
        </h1>

        <form onSubmit={submitReservation} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-500">
              상품명
            </label>
            <input
              value={product}
              readOnly
              className="w-full rounded-xl border bg-gray-100 p-4"
            />
          </div>

          <input
            placeholder="예약자명"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border p-4"
            required
          />

          <input
            placeholder="연락처"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border p-4"
            required
          />

          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full rounded-xl border p-4"
          />

          <textarea
            placeholder="문의사항"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-32 w-full rounded-xl border p-4"
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-black py-4 font-semibold text-white"
          >
            {loading ? "접수중..." : "예약 문의하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
