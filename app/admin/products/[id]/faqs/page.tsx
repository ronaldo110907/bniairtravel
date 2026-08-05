"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  link?: string;
};

export default function FAQsAdminPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    if (productId) loadFaqs();
  }, [productId]);

  async function loadFaqs() {
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .eq("product_id", productId)
      .order("sort");

    setFaqs(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">FAQ 관리</h1>

        <div className="rounded-2xl bg-white p-8 shadow">
          {faqs.length === 0 ? (
            <p className="text-gray-500">등록된 FAQ가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="rounded-xl border p-5">
                  <h3 className="font-bold">{faq.question}</h3>
                  <p className="mt-3 text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
