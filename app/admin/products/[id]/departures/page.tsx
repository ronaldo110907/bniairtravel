"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Departure = {
  id: string;
  departure_date: string;
  price: number | null;
  seat: number | null;
  airline: string | null;
  status: string | null;
};

export default function DeparturesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params?.id;

  const [items, setItems] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    departure_date: "",
    price: "",
    seat: "",
    airline: "",
    status: "예약가능",
  });

  useEffect(() => {
    if (productId) load();
  }, [productId]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("departures")
      .select("*")
      .eq("product_id", productId)
      .order("departure_date");

    if (!error) setItems(data || []);
    setLoading(false);
  }

  async function addDeparture(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("departures").insert({
      product_id: productId,
      departure_date: form.departure_date,
      price: Number(form.price) || null,
      seat: Number(form.seat) || null,
      airline: form.airline || null,
      status: form.status,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setForm({
      departure_date: "",
      price: "",
      seat: "",
      airline: "",
      status: "예약가능",
    });

    load();
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;

    await supabase.from("departures").delete().eq("id", id);
    load();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-5 rounded-lg border px-4 py-2"
        >
          뒤로가기
        </button>

        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="mb-6 text-3xl font-bold">출발일 관리</h1>

          <form
            onSubmit={addDeparture}
            className="mb-8 grid gap-3 md:grid-cols-5"
          >
            <input
              type="date"
              value={form.departure_date}
              min="1900-01-01"
              max="9999-12-31"
              onChange={(e) => {
                const value = e.target.value;
                const year = value.split("-")[0];

                if (year.length > 4) return;

                setForm({ ...form, departure_date: value });
              }}
              className="rounded border p-3"
              required
            />

            <input
              placeholder="가격"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded border p-3"
            />

            <input
              placeholder="좌석"
              value={form.seat}
              onChange={(e) => setForm({ ...form, seat: e.target.value })}
              className="rounded border p-3"
            />

            <input
              placeholder="항공사"
              value={form.airline}
              onChange={(e) => setForm({ ...form, airline: e.target.value })}
              className="rounded border p-3"
            />

            <button className="rounded bg-black text-white">추가</button>
          </form>

          {loading ? (
            <p>불러오는 중...</p>
          ) : (
            <table className="w-full">
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">{item.departure_date}</td>
                    <td>{item.price?.toLocaleString()}원</td>
                    <td>{item.seat}석</td>
                    <td>{item.airline}</td>
                    <td>{item.status}</td>
                    <td>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-red-600"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
