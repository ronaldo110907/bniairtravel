"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const images = [
  "/images/hero/hero1.jpg",
  "/images/hero/hero2.jpg",
  "/images/hero/hero3.jpg",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

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
            current === index
              ? "opacity-100 scale-105"
              : "opacity-0 scale-100"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex h-full items-center justify-center px-6">

        <div className="max-w-5xl text-center text-white">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl font-black leading-tight md:text-8xl"
          >
            여행을 넘어,
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1,
              duration: 1,
            }}
            className="mt-3 text-6xl font-black md:text-8xl"
          >
            감동을 만나다.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 2,
              duration: 1,
            }}
            className="mt-10 text-xl text-gray-200"
          >
            당신의 특별한 여행이 시작됩니다.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 3,
              duration: 1,
            }}
            className="mt-14 rounded-full bg-yellow-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-yellow-400"
          >
            여행상품 보기 →
          </motion.button>

        </div>

      </div>

    </section>
  );
}