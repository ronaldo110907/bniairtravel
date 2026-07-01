"use client";

import { motion } from "framer-motion";

export default function BrandMessage() {
  return (
    <section className="bg-white py-32">
      <div className="mx-auto max-w-5xl px-6 text-center">

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
          className="text-4xl font-black leading-relaxed text-gray-900 md:text-6xl"
        >
          우리는 여행을 판매하지 않습니다.
          <br />
          당신의 기억에 오래 남을 순간을 준비합니다.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-lg tracking-[6px] text-yellow-600 uppercase"
        >
          Every Journey Begins With A Dream
        </motion.p>

      </div>
    </section>
  );
}