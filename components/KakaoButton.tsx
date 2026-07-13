"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function KakaoButton() {
  const [kakaoUrl, setKakaoUrl] = useState("");

  useEffect(() => {
    loadKakao();
  }, []);

  async function loadKakao() {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "kakao_url")
      .single();

    if (data?.value) {
      setKakaoUrl(data.value);
    }
  }

  return (
    <a
      href={kakaoUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed
        bottom-6
        right-6
        z-50
        rounded-full
        bg-yellow-400
        px-6
        py-4
        font-bold
        text-black
        shadow-xl
        transition
        hover:scale-105
      "
    >
      지금 문의하세요
    </a>
  );
}
