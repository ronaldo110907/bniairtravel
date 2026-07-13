"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  open: boolean;
  image: string;
  title?: string;
  onClose: () => void;
}

export default function ImageLightbox({
  open,
  image,
  title = "확대 이미지",
  onClose,
}: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    setLoaded(false);
    setScale(1);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();

      if (event.key === "+" || event.key === "=") {
        setScale((value) => Math.min(2.5, value + 0.25));
      }

      if (event.key === "-") {
        setScale((value) => Math.max(0.75, value - 0.25));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open || !image) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-8"
      onMouseDown={onClose}
    >
      <div
        className="relative flex h-full w-full items-center justify-center"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {!loaded && (
          <div className="absolute flex flex-col items-center gap-3 text-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-white" />
            <p className="text-sm text-white/70">이미지를 불러오는 중입니다.</p>
          </div>
        )}

        <img
          src={image}
          alt={title}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={[
            "max-h-[82vh] max-w-[92vw] select-none rounded-2xl object-contain shadow-2xl",
            "transition-all duration-300 ease-out",
            loaded ? "scale-100 opacity-100" : "scale-95 opacity-0",
          ].join(" ")}
          style={{ transform: `scale(${scale})` }}
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white hover:text-black md:right-3 md:top-3"
        >
          ×
        </button>

        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/55 p-2 text-white backdrop-blur-md md:bottom-4">
          <button
            type="button"
            onClick={() => setScale((value) => Math.max(0.75, value - 0.25))}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15"
            aria-label="축소"
          >
            −
          </button>

          <span className="min-w-14 text-center text-xs font-semibold">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setScale((value) => Math.min(2.5, value + 0.25))}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/15"
            aria-label="확대"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => setScale(1)}
            className="rounded-full px-4 py-2 text-xs font-semibold transition hover:bg-white/15"
          >
            원본
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
