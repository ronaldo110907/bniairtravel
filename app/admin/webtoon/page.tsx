"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type WebtoonImage = {
  name: string;
  url: string;
};

export default function AdminWebtoonPage() {
  const [images, setImages] = useState<WebtoonImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebtoons();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        goPrev();
      }

      if (event.key === "ArrowRight") {
        goNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, currentIndex]);

  async function loadWebtoons() {
    setLoading(true);

    const { data, error } = await supabase.storage
      .from("gallery")
      .list("webtoon", {
        limit: 200,
      });

    if (error) {
      console.error("웹툰 불러오기 오류:", error);
      setLoading(false);
      return;
    }

    const files = (data ?? [])
      .filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file.name))
      .sort((a, b) => {
        const getOrder = (name: string) => {
          const fileName = name.replace(/\.[^.]+$/, "");

          const match = fileName.match(/^webtoon(?:(\d+)(?:-(\d+))?)?$/i);

          if (!match) {
            return {
              main: Number.MAX_SAFE_INTEGER,
              sub: Number.MAX_SAFE_INTEGER,
            };
          }

          return {
            main: match[1] ? Number(match[1]) : 0,
            sub: match[2] ? Number(match[2]) : 0,
          };
        };

        const orderA = getOrder(a.name);
        const orderB = getOrder(b.name);

        if (orderA.main !== orderB.main) {
          return orderA.main - orderB.main;
        }

        return orderA.sub - orderB.sub;
      })
      .map((file) => {
        const { data: publicUrlData } = supabase.storage
          .from("gallery")
          .getPublicUrl(`webtoon/${file.name}`);

        return {
          name: file.name,
          url: publicUrlData.publicUrl,
        };
      });

    setImages(files);
    setLoading(false);
  }

  function goPrev() {
    setCurrentIndex((prev) => {
      if (images.length === 0) return 0;

      return prev === 0 ? images.length - 1 : prev - 1;
    });
  }

  function goNext() {
    setCurrentIndex((prev) => {
      if (images.length === 0) return 0;

      return prev === images.length - 1 ? 0 : prev + 1;
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111] text-white">
        <p className="text-lg font-bold">📚 개발작전일지 불러오는 중...</p>
      </main>
    );
  }

  if (images.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#111] text-white">
        <p className="text-lg font-bold">웹툰 이미지가 없습니다.</p>
      </main>
    );
  }

  const current = images[currentIndex];

  return (
    <main className="min-h-screen bg-[#111] px-4 py-8 text-white md:px-8">
      {/* 제목 */}
      <div className="mx-auto mb-8 max-w-7xl text-center">
        <p className="text-sm font-bold tracking-[0.3em] text-[#C8A15A]">
          BNI DEVELOPMENT STORY
        </p>

        <h1 className="mt-3 text-3xl font-black md:text-5xl">
          📚 홈페이지 개발 웹툰 비하인드
        </h1>

        <p className="mt-4 text-sm text-white/50 md:text-base">
          실제 개발 중 벌어진 사건들을 기록한 BNI 개발작전일지입니다. ㅋㅋㅋ
        </p>
      </div>

      {/* 페이지 표시 */}
      <div className="mx-auto mb-5 flex max-w-7xl items-center justify-between">
        <span className="text-sm text-white/50">{current.name}</span>

        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* 웹툰 */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-white p-2 shadow-2xl md:p-4">
        <img
          src={current.url}
          alt={current.name}
          className="mx-auto h-auto w-full"
        />
      </div>

      {/* 이전 / 다음 */}
      <div className="mx-auto mt-8 flex max-w-7xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={goPrev}
          className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 font-bold transition hover:bg-white/20"
        >
          ← 이전 작전
        </button>

        <button
          type="button"
          onClick={goNext}
          className="flex-1 rounded-2xl bg-[#C8A15A] px-6 py-4 font-bold text-black transition hover:brightness-110"
        >
          다음 작전 →
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-white/30">
        키보드 ← → 방향키로도 넘길 수 있습니다.
      </p>
    </main>
  );
}
