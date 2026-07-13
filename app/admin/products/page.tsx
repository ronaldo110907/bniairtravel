"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  title: string;
  country?: string;
  city?: string;
  airline?: string;
  price?: number | string;
  is_visible?: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort", { ascending: true });

    if (error) {
      console.error("PRODUCT ERROR", error);
      alert(error.message);
    } else {
      console.log("PRODUCT DATA", data);
      setProducts(data || []);
    }

    setLoading(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm("상품을 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchProducts();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">상품관리</h1>
            <p className="mt-2 text-gray-500">
              여행상품을 등록하고 관리합니다.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white"
          >
            <Plus size={18} />
            상품등록
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">상품명</th>
                <th className="px-6 py-4 text-left">국가</th>
                <th className="px-6 py-4 text-left">도시</th>
                <th className="px-6 py-4 text-left">항공사</th>
                <th className="px-6 py-4 text-left">가격</th>
                <th className="px-6 py-4 text-center">노출</th>
                <th className="px-6 py-4 text-center">관리</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    불러오는 중...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-5 font-semibold">{product.title}</td>
                    <td className="px-6">{product.country}</td>
                    <td className="px-6">{product.city}</td>
                    <td className="px-6">{product.airline}</td>
                    <td className="px-6">
                      {typeof product.price === "number"
                        ? product.price.toLocaleString()
                        : product.price}
                    </td>
                    <td className="text-center">
                      {product.is_visible ? "노출" : "숨김"}
                    </td>
                    <td>
                      <div className="flex justify-center gap-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-blue-600"
                        >
                          <Pencil size={18} />
                        </Link>

                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
