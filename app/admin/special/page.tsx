"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Flame, Save } from "lucide-react";

type Product = {
  id: string;
  title: string;
  price_from: number | null;
  special_visible: boolean;
  special_order: number | null;
};

export default function SpecialPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("id,title,price_from,special_visible,special_order")
      .order("sort");

    if (error) {
      console.error("SPECIAL ERROR", error);
      alert(error.message);
      setProducts([]);
    } else {
      setProducts((data as Product[]) || []);
    }

    setLoading(false);
  }

  function updateProduct(
    id: string,
    field: "price_from" | "special_order",
    value: number | null,
  ) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              [field]: value,
            }
          : product,
      ),
    );
  }

  async function toggleSpecial(product: Product) {
    const nextValue = !product.special_visible;

    const { error } = await supabase
      .from("products")
      .update({
        special_visible: nextValue,
      })
      .eq("id", product.id);

    if (error) {
      console.error("SPECIAL TOGGLE ERROR", error);
      alert(error.message);
      return;
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              special_visible: nextValue,
            }
          : item,
      ),
    );
  }

  async function saveProduct(product: Product) {
    setSavingId(product.id);

    const { error } = await supabase
      .from("products")
      .update({
        price_from: product.price_from,
        special_order: product.special_order ?? 0,
      })
      .eq("id", product.id);

    setSavingId(null);

    if (error) {
      console.error("SPECIAL SAVE ERROR", error);
      alert(error.message);
      return;
    }

    alert(`${product.title} 긴급특가 설정이 저장되었습니다.`);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Flame className="text-red-500" />
            <h1 className="text-3xl font-bold">긴급특가 관리</h1>
          </div>

          <p className="mt-2 text-gray-500">
            메인 페이지에 노출할 긴급특가 상품을 관리합니다.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">상품명</th>
                <th className="px-6 py-4 text-left">특가금액</th>
                <th className="px-6 py-4 text-center">긴급특가 노출</th>
                <th className="px-6 py-4 text-center">노출순서</th>
                <th className="px-6 py-4 text-center">저장</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-6 py-5 font-semibold">{product.title}</td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={product.price_from ?? ""}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            "price_from",
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        placeholder="예: 799000"
                        className="w-40 rounded-lg border px-3 py-2"
                      />
                      <span className="text-sm text-gray-500">원~</span>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSpecial(product)}
                      className="inline-flex items-center gap-2"
                    >
                      {product.special_visible ? (
                        <>
                          <Eye className="text-green-600" />
                          <span className="font-bold text-green-600">ON</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="text-gray-400" />
                          <span className="text-gray-400">OFF</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <input
                      type="number"
                      min="0"
                      value={product.special_order ?? 0}
                      onChange={(e) =>
                        updateProduct(
                          product.id,
                          "special_order",
                          Number(e.target.value),
                        )
                      }
                      className="w-20 rounded-lg border px-3 py-2 text-center"
                    />
                  </td>

                  <td className="px-6 py-5 text-center">
                    <button
                      type="button"
                      onClick={() => saveProduct(product)}
                      disabled={savingId === product.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 font-bold text-white disabled:opacity-50"
                    >
                      <Save size={16} />
                      {savingId === product.id ? "저장중..." : "저장"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <p className="font-bold text-yellow-800">🔥 긴급특가 사용방법</p>
          <p className="mt-2 text-sm text-yellow-700">
            특가금액을 입력하고 저장한 뒤 긴급특가 노출을 ON으로 변경하면 메인
            페이지에 바로 노출됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
