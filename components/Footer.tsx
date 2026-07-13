"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Footer() {
  const [contactText, setContactText] = useState("지금 문의하세요");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["contact_text", "phone"]);

    data?.forEach((item) => {
      if (item.key === "contact_text") {
        setContactText(item.value || "지금 문의하세요");
      }

      if (item.key === "phone") {
        setPhone(item.value || "");
      }
    });
  }

  return (
    <footer className="bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl font-bold">
          여행은 목적지가 아닌,
          <br />
          기억으로 남는 순간입니다.
        </h2>

        <p className="mt-6 text-white/60">
          {contactText}
        </p>

        {phone && (
          <p className="mt-3 text-lg font-semibold">
            {phone}
          </p>
        )}

        <div className="mt-10 border-t border-white/20 pt-6 text-sm text-white/40">
          특별한 여행의 시작을 함께합니다.
        </div>
      </div>
    </footer>
  );
}
