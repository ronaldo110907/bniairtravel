"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const images = [
  "/images/hero/hero1.jpg",
  "/images/hero/hero2.jpg",
  "/images/hero/hero3.jpg",
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/phuquoc1.jpg",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [heroTitle, setHeroTitle] = useState("여행을 넘어,");
  const [heroSubTitle, setHeroSubTitle] = useState("감동을 만나다.");
  const [heroText, setHeroText] = useState("당신의 특별한 여행이 시작됩니다.");

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installable, setInstallable] = useState(false);
  const [isKakaoBrowser, setIsKakaoBrowser] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);

    loadSettings();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();

      setDeferredPrompt(e);
      setInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("kakaotalk")) {
      setIsKakaoBrowser(true);
    }
  }, []);

  async function installApp() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("앱 설치 완료");
    }

    setDeferredPrompt(null);
    setInstallable(false);
  }

  async function loadSettings() {
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["hero_title"]);

    const setting = data?.find((item) => item.key === "hero_title");

    if (setting?.value) {
      const parts = setting.value.split(",");
      setHeroTitle(parts[0] || "여행을 넘어,");
      setHeroSubTitle(parts[1] || "감동을 만나다.");
    }
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {images.map((image, index) => (
        <Image
          key={image}
          src={image}
          alt=""
          fill
          priority
          className={`absolute inset-0 object-cover transition-all duration-[3000ms]
          ${
            current === index ? "opacity-100 scale-105" : "opacity-0 scale-100"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="max-w-5xl text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 40, scale: 1 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [1, 1.02, 1],
            }}
            transition={{
              opacity: { duration: 1 },
              y: { duration: 1 },
              scale: {
                delay: 1,
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="text-6xl font-black leading-tight md:text-8xl"
          >
            {heroTitle}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 30, scale: 1 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [1, 1.02, 1],
            }}
            transition={{
              opacity: {
                delay: 0.3,
                duration: 1,
              },
              y: {
                delay: 0.3,
                duration: 1,
              },
              scale: {
                delay: 1.3,
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="mt-3 text-6xl font-black md:text-8xl"
          >
            {heroSubTitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.8,
              duration: 1,
            }}
            className="mt-10 text-xl text-gray-200"
          >
            {heroText}
          </motion.p>
          {installable && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.2,
                duration: 0.8,
              }}
              onClick={installApp}
              className="
      mt-8
      rounded-full
      border
      border-white/40
      bg-white/10
      px-8
      py-4
      text-lg
      font-semibold
      text-white
      backdrop-blur-md
      transition
      hover:bg-white
      hover:text-black
    "
            >
              📱 앱 설치
            </motion.button>
          )}
          {isKakaoBrowser && !installable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.2,
                duration: 0.8,
              }}
              className="mt-8 text-center"
            >
              <div
                className="
        rounded-2xl
        border
        border-white/40
        bg-black/30
        px-6
        py-4
        text-white
        backdrop-blur-md
      "
              >
                <div className="text-lg font-bold">📱 앱 설치</div>

                <div className="mt-2 text-sm leading-6 text-white/90">
                  카카오톡에서는 앱 설치가 지원되지 않습니다.
                  <br />
                  우측 하단 ⋮ 메뉴에서
                  <br />
                  <strong>Chrome(크롬)으로 열기</strong>를 선택해주세요.
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
