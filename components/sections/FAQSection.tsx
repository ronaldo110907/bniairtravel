"use client";

import { useState } from "react";
import { faqs } from "@/data/zhangjiajie";

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <section className="bg-[#f7f3eb] py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 tracking-[0.35em] text-[#c8a15a]">FAQ</p>

          <h2 className="text-5xl font-bold text-gray-900">자주 묻는 질문</h2>

          <p className="mt-5 text-gray-500">
            예약 전 가장 많이 문의하시는 내용을 모았습니다.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const open = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => setOpenId(open ? null : faq.id)}
                  className="flex w-full items-center justify-between px-7 py-6 text-left transition hover:bg-gray-50"
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </span>

                  <span
                    className={`text-2xl text-[#c8a15a] transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {open && (
                  <div className="border-t bg-[#faf8f4] px-7 py-6 leading-8 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
