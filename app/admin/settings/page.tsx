"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Setting = {
  id: string;
  key: string;
  value: string;
};

const fields = [
  {
    key: "kakao_url",
    label: "카카오톡 링크",
    placeholder: "https://pf.kakao.com/...",
  },
  {
    key: "contact_text",
    label: "상담 문구",
    placeholder: "지금 문의하세요",
  },
  {
    key: "phone",
    label: "연락처",
    placeholder: "010-0000-0000",
  },
  {
    key: "hero_title",
    label: "메인 문구",
    placeholder: "여행을 넘어, 감동을 만나다",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*");

    if (error) {
      alert(error.message);
      return;
    }

    const values: Record<string, string> = {};

    (data as Setting[]).forEach((item) => {
      values[item.key] = item.value || "";
    });

    setSettings(values);
  }

  async function save() {
    setLoading(true);

    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, {
        onConflict: "key",
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("사이트 설정이 저장되었습니다.");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">
          사이트 설정
        </h1>

        <div className="space-y-5 rounded-2xl bg-white p-8 shadow">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-2 block font-semibold">
                {field.label}
              </label>

              <input
                value={settings[field.key] || ""}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    [field.key]: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-4"
              />
            </div>
          ))}

          <button
            onClick={save}
            disabled={loading}
            className="rounded-xl bg-black px-8 py-4 text-white"
          >
            {loading ? "저장중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
