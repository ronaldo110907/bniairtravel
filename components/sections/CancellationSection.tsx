"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Rule = {
  id: string;
  period: string;
  fee: string;
  sort: number | null;
};

type CancellationSectionProps = {
  productId?: string;
};

export default function CancellationSection({
  productId,
}: CancellationSectionProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadRules();
  }, [productId]);

  async function loadRules() {
    setLoading(true);

    let targetProductId = productId;

    if (!targetProductId) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id")
        .eq("slug", "zhangjiajie")
        .single();

      if (productError || !product) {
        setRules([]);
        setLoading(false);
        return;
      }

      targetProductId = product.id;
    }

    const { data, error } = await supabase
      .from("cancellation_rules")
      .select("id, period, fee, sort")
      .eq("product_id", targetProductId)
      .order("sort", { ascending: true });

    if (error) {
      setRules([]);
    } else {
      setRules((data || []) as Rule[]);
    }

    setLoading(false);
  }

  if (!loading && rules.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14 text-center">
        <p className="text-sm tracking-[0.35em] text-[#B88A44]">
          CANCELLATION POLICY
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          전세기 특별약관 및 취소규정
        </h2>
      </div>

      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-8">
        <h3 className="text-2xl font-bold text-amber-900">
          전세기 특별약관
        </h3>

        <p className="mt-4 leading-8 text-gray-700">
          본 상품은 전세기 상품으로 국외여행 표준약관이 아닌 전세기 특별약관이 적용됩니다.
          취소 시 일반 상품보다 높은 취소수수료가 발생할 수 있습니다.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border bg-white p-8">
        <h3 className="text-xl font-bold">계약금 안내</h3>

        <ul className="mt-5 list-disc space-y-2 pl-5 leading-7 text-gray-600">
          <li>예약일 기준 3일 이내 1인당 계약금 200,000원 입금</li>
          <li>기한 내 미입금 시 예약이 자동 취소될 수 있습니다.</li>
          <li>
            취소규정 적용기간 예약 시 계약금보다 취소료가 큰 경우 해당
            취소료가 적용됩니다.
          </li>
        </ul>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border bg-white">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            취소규정을 불러오는 중...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-[#C8A15A] text-white">
                <tr>
                  <th className="p-4 text-left">취소 시점</th>
                  <th className="p-4 text-left">취소 수수료</th>
                </tr>
              </thead>

              <tbody>
                {rules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="border-t even:bg-[#FCFAF7]"
                  >
                    <td className="p-4 font-medium">{rule.period}</td>
                    <td className="p-4">{rule.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="font-bold text-red-700">※ 중요 안내</p>

        <p className="mt-3 leading-7 text-gray-700">
          항공 좌석 및 호텔 객실을 사전 확보한 전세기 상품으로 취소 시 위
          특별약관이 적용됩니다. 예약 전 반드시 취소규정을 확인해 주시기
          바랍니다.
        </p>
      </div>
    </section>
  );
}
