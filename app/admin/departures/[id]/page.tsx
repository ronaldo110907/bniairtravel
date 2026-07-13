"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  title: string;
};

export default function EditDeparturePage() {
  const { id } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    departure_date: "",
    price: "",
    seat: "",
    airline: "",
    status: "예약가능",
  });

  useEffect(() => {
    loadProducts();
    loadDeparture();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("id,title")
      .order("sort");

    setProducts(data || []);
  }

  async function loadDeparture() {
    const { data } = await supabase
      .from("departures")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) return;

    setForm({
      product_id: data.product_id,
      departure_date: data.departure_date,
      price: String(data.price),
      seat: String(data.seat),
      airline: data.airline,
      status: data.status,
    });

    setLoading(false);
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabase
      .from("departures")
      .update({
        product_id: form.product_id,
        departure_date: form.departure_date,
        price: Number(form.price),
        seat: Number(form.seat),
        airline: form.airline,
        status: form.status,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("수정 완료");

    router.push("/admin/departures");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-3xl mx-auto p-8">

        <h1 className="text-3xl font-bold mb-8">
          출발일 수정
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-8 space-y-5"
        >

          <select
            name="product_id"
            value={form.product_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.title}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="departure_date"
            value={form.departure_date}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="number"
            name="seat"
            value={form.seat}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            name="airline"
            value={form.airline}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option>예약가능</option>
            <option>마감임박</option>
            <option>예약마감</option>
          </select>

          <button
            disabled={saving}
            className="w-full bg-black text-white py-4 rounded-xl"
          >
            {saving ? "저장중..." : "수정하기"}
          </button>

        </form>

      </div>

    </div>
  );
}