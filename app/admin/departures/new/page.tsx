"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  title: string;
};

export default function NewDeparturePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

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
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("id,title")
      .order("sort");

    setProducts(data || []);
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

    setLoading(true);

    const { error } = await supabase
      .from("departures")
      .insert({
        product_id: form.product_id,
        departure_date: form.departure_date,
        price: Number(form.price),
        seat: Number(form.seat),
        airline: form.airline,
        status: form.status,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/admin/departures");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-3xl mx-auto p-8">

        <h1 className="text-3xl font-bold mb-8">
          출발일 등록
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
            required
          >
            <option value="">
              상품 선택
            </option>

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
            required
          />

          <input
            type="number"
            name="price"
            placeholder="가격"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="number"
            name="seat"
            placeholder="좌석수"
            value={form.seat}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            name="airline"
            placeholder="항공사"
            value={form.airline}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
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
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl"
          >
            {loading ? "등록중..." : "출발일 등록"}
          </button>

        </form>

      </div>

    </div>
  );
}