"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const destinations = [
  {
    title: "장가계",
    subtitle: "DISCOVER CHINA",
    period: "2026.09.02 ~ 2026.11.27",
    description: "자연이 선물한 가장 아름다운 절경 속으로 당신을 초대합니다.",
    image: "/images/zhangjiajie/cover.jpg",
    href: "/zhangjiajie",
  },
  {
    title: "백두산",
    subtitle: "DISCOVER CHINA",
    period: "2026.06.02 ~ 2026.10.24",
    description: "천지를 마주하는 평생의 감동.",
    image: "/images/baekdu/cover.jpg",
    href: "/baekdu",
  },
  {
    title: "푸꾸옥",
    subtitle: "DISCOVER VIETNAM",
    period: "2026.12.24 ~ 2027.02.18",
    description:
      "에메랄드빛 바다와 아름다운 석양을 품은 선셋 타운까지. 낭만이 가득한 곳으로 당신을 초대합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/phuquoc1.jpg",
    href: "/phuquoc",
  },
  {
    title: "말레이시아 골프",
    subtitle: "DISCOVER MALAYSIA",
    period: "상시 문의",
    description:
      "품격 있는 라운딩과 여유로운 휴식을 함께 즐기는 말레이시아 VVIP 골프 여행.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/malaysia.jpg",
    href: "/malaysia",
  },
  {
    title: "상해",
    subtitle: "DISCOVER CHINA",
    period: "2026.08.09 ~ 2026.10.20",
    description: "과거와 미래가 공존하는 도시.",
    image: "/images/shanghai/cover.jpg",
    href: "/shanghai",
  },
];

export default function Discover() {
  return (
    <section className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-24 text-center">
          <p className="tracking-[8px] uppercase text-yellow-600">
            Discover World
          </p>
          <h2 className="mt-5 text-5xl font-black">
            여행은 항상 우리를 설레게 합니다.
          </h2>
          <p className="mt-6 text-lg text-gray-500">
            청주공항 출발로 만나는 새로운 여행!!
            <br />
            장가계, 백두산, 상해, 푸꾸옥등 다양한 여행지를 만나보세요.
          </p>
        </div>

        {destinations.map((item, index) => (
          <div
            key={item.title}
            className={`mb-32 grid items-center gap-14 lg:grid-cols-2 ${
              index % 2 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-3xl shadow-2xl"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={900}
                height={650}
                className="h-[500px] w-full object-cover transition duration-700 hover:scale-105"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="tracking-[6px] uppercase text-yellow-600">
                {item.subtitle}
              </p>

              <h3 className="mt-5 text-5xl font-black">{item.title}</h3>

              <p className="mt-8 text-xl leading-9 text-gray-600">
                {item.description}
              </p>

              <p className="mt-3 text-lg font-semibold text-yellow-600">
                {item.period}
              </p>

              <a
                href={item.href}
                className="mt-10 inline-flex rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-yellow-600"
              >
                자세히 보기 →
              </a>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
