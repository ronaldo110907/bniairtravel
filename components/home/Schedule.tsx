"use client";

import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Schedule() {
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
   const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      departures (
        departure_date,
        airline,
        status,
        price,
        seat
      )
    `)
    .eq("is_visible", true)
    .order("sort");

   if (error) {
    console.error(error);
    return;
   }

   setSchedules(data || []);
   }
  return (
    <section className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <p className="tracking-[8px] uppercase text-yellow-600">
            Flight Schedule
          </p>

          <h2 className="mt-5 text-5xl font-black">
            청주공항 직항 스케줄
          </h2>

          <p className="mt-6 text-lg text-gray-500">
            가장 편안한 직항 노선으로
            <br />
            특별한 여행을 시작하세요.
          </p>
        </motion.div>

        <div className="overflow-hidden rounded-[32px] border border-gray-200">
          {schedules.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className={`grid gap-8 px-8 py-8 transition hover:bg-stone-50 md:grid-cols-[360px_1fr] ${
                index !== schedules.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <div className="flex items-center gap-7">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                  <Plane size={24} />
                </div>

                <div>
                  <h3 className="text-4xl font-black leading-tight">
                    {item.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <Image
                      src={item.logo || "/images/kogo.png"}
                      alt={item.title}
                      width={100}
                      height={40}
                      className="h-auto w-28 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/images/kogo.png";
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {item.departures?.map((departure: any, index: number) => (
                 <div
                  key={departure.id ?? index}
                  className={`grid items-center gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] ${
                   index !== item.departures.length - 1
                    ? "border-b border-gray-200 pb-6"
                    : ""
                  }`}
              >
              <div>
               <p className="text-xs uppercase tracking-[4px] text-gray-400">
                Departure
               </p>
               <p className="mt-2 text-2xl font-bold">
                {departure.departure_date}
               </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[4px] text-gray-400">
                 Airline
                </p>
                <p className="mt-2 text-xl font-bold">
                 {departure.airline}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[4px] text-gray-400">
                 Price
                </p>
                <p className="mt-2 text-xl font-bold">
                 ₩{departure.price?.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[4px] text-gray-400">
                 Seat
                </p>
                <p className="mt-2 text-xl font-bold">
                 {departure.seat}석
                </p>
              </div>

              <div className="text-right">
               <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                {departure.status}
               </span>
              </div>
          </div>
       ))}
      </div>
    </motion.div>
  ))}
</div>
</div>
</section>
);
}