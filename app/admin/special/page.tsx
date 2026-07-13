"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Flame, Eye, EyeOff } from "lucide-react";

type Product = {
  id: string;
  title: string;
  price: number | null;
  is_best: boolean;
  is_visible: boolean;
};

export default function SpecialPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,price,is_best,is_visible")
      .order("sort");

    if (error) {
      console.error("SPECIAL ERROR", error);
      alert(error.message);
      setProducts([]);
    } else {
      console.log("SPECIAL DATA", data);
      setProducts((data as Product[]) || []);
    }

    setLoading(false);
  }

  async function toggleBest(product: Product) {
    await supabase
      .from("products")
      .update({ is_best: !product.is_best })
      .eq("id", product.id);

    loadProducts();
  }

  async function toggleVisible(product: Product) {
    await supabase
      .from("products")
      .update({ is_visible: !product.is_visible })
      .eq("id", product.id);

    loadProducts();
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
          <h1 className="text-3xl font-bold">긴급특가 관리</h1>
          <p className="mt-2 text-gray-500">
            메인 페이지 노출 및 BEST 상품 관리
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">상품명</th>
                <th className="px-6 py-4 text-left">가격</th>
                <th className="px-6 py-4 text-center">BEST</th>
                <th className="px-6 py-4 text-center">노출</th>
                <th className="px-6 py-4 text-center">수정</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-6 py-5 font-semibold">{product.title}</td>
                  <td className="px-6">
                    {product.price?.toLocaleString()}원
                  </td>

                  <td className="text-center">
                    <button onClick={() => toggleBest(product)}>
                      <Flame
                        className={product.is_best ? "text-red-500" : "text-gray-300"}
                      />
                    </button>
                  </td>

                  <td className="text-center">
                    <button onClick={() => toggleVisible(product)}>
                      {product.is_visible ? (
                        <Eye className="text-green-600" />
                      ) : (
                        <EyeOff className="text-gray-400" />
                      )}
                    </button>
                  </td>

                  <td className="text-center">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg bg-black px-4 py-2 text-white"
                    >
                      수정
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
