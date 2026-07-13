"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewDeparturePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    departure_date: "",
    airline: "",
    price: "",
    seat: "",
    status: "예약가능",
  });

  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!params.id) return;

    setSaving(true);

    const { error } = await supabase.from("departures").insert({
      product_id: params.id,
      departure_date: form.departure_date,
      airline: form.airline,
      price: Number(form.price),
      seat: Number(form.seat),
      status: form.status,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("출발일이 등록되었습니다.");
    router.push(`/admin/products/${params.id}/departures`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="mb-8 text-3xl font-bold">출발일 등록</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow"
        >
          <input
            type="date"
            name="departure_date"
            value={form.departure_date}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            required
          />

          <input
            name="airline"
            placeholder="항공사"
            value={form.airline}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            required
          />

          <input
            name="price"
            type="number"
            placeholder="가격"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            required
          />

          <input
            name="seat"
            type="number"
            placeholder="좌석수"
            value={form.seat}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
          >
            <option value="예약가능">예약가능</option>
            <option value="마감">마감</option>
          </select>

          <button
            disabled={saving}
            className="w-full rounded-xl bg-black py-4 text-white"
          >
            {saving ? "저장중..." : "등록"}
          </button>
        </form>
      </div>
    </div>
  );
}
