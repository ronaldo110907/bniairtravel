"use client";

import { excludes, includes } from "@/data/zhangjiajie";

type DisplayItem = {
  id: number;
  text: unknown;
};

function Card({
  title,
  items,
  icon,
}: {
  title: string;
  items: DisplayItem[];
  icon: string;
}) {
  return (
    <div className="rounded-[32px] border border-[#ece7df] bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f6f1e8] text-2xl">
          {icon}
        </div>

        <div>
          <p className="text-sm tracking-[0.3em] text-[#b88a44]">
            INFORMATION
          </p>
          <h3 className="mt-1 text-3xl font-bold">{title}</h3>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 rounded-2xl border border-[#f1ece4] p-4"
          >
            <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#b88a44]" />
            <span className="text-[15px] leading-7 text-gray-700">
              {String(item.text)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IncludedCard() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14">
        <p className="mb-3 text-sm tracking-[0.35em] text-[#b88a44]">
          TRAVEL INFORMATION
        </p>

        <h2 className="text-4xl font-bold md:text-5xl">
          포함 / 불포함 사항
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="포함사항" items={includes} icon="✅" />
        <Card title="불포함사항" items={excludes} icon="❗" />
      </div>
    </section>
  );
}
