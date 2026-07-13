"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditDeparturePage() {
  const params = useParams<{ id: string; departureId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    departure_date: "",
    airline: "",
    price: "",
    seat: "",
    status: "예약가능",
  });

  useEffect(() => {
    if (params.departureId) {
      loadDeparture();
    }
  }, [params.departureId]);

  async function loadDeparture() {
    const { data, error } = await supabase
      .from("departures")
      .select("*")
      .eq("id", params.departureId)
      .single();

    if (!error && data) {
      setForm({
        departure_date: data.departure_date ?? "",
        airline: data.airline ?? "",
        price: String(data.price ?? ""),
        seat: String(data.seat ?? ""),
        status: data.status ?? "예약가능",
      });
    }

    setLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabase
      .from("departures")
      .update({
        departure_date: form.departure_date,
        airline: form.airline,
        price: Number(form.price),
        seat: Number(form.seat),
        status: form.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.departureId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("출발일이 수정되었습니다.");
    router.push(`/admin/products/${params.id}/departures`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="mb-8 text-3xl font-bold">출발일 수정</h1>

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
          />

          <input
            name="airline"
            value={form.airline}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            placeholder="항공사"
          />

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            placeholder="가격"
          />

          <input
            name="seat"
            type="number"
            value={form.seat}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3"
            placeholder="좌석"
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
            {saving ? "저장중..." : "수정 완료"}
          </button>
        </form>
      </div>
    </div>
  );
}
