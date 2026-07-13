"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Package,
  CalendarDays,
  Image,
  Flame,
  MessageSquare,
  Bell,
  LogOut,
} from "lucide-react";

const menus = [
  { title: "상품관리", icon: Package, href: "/admin/products" },
  { title: "출발일관리", icon: CalendarDays, href: "/admin/departures" },
  { title: "긴급특가", icon: Flame, href: "/admin/special" },
  { title: "사진관리", icon: Image, href: "/admin/gallery" },
  { title: "공지사항", icon: Bell, href: "/admin/notices" },
  { title: "예약문의", icon: MessageSquare, href: "/admin/reservations" },
];

export default function AdminPage() {
  const [stats, setStats] = useState({
    products: 0,
    departures: 0,
    special: 0,
    reservations: 0,
    reviews: 0,
    notices: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const products = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const departures = await supabase
      .from("departures")
      .select("*", { count: "exact", head: true });

    const special = await supabase
      .from("special_offers")
      .select("*", { count: "exact", head: true });

    const reservations = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true });

    const reviews = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    const notices = await supabase
      .from("notices")
      .select("*", { count: "exact", head: true });

    setStats({
      products: products.count || 0,
      departures: departures.count || 0,
      special: special.count || 0,
      reservations: reservations.count || 0,
      reviews: reviews.count || 0,
      notices: notices.count || 0,
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <h1 className="text-2xl font-bold">BNI AIR TRAVEL CMS</h1>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              document.cookie = "admin_user=; path=/; max-age=0";
              window.location.href = "/admin/login";
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-10 grid grid-cols-4 gap-6">
          <Stat title="등록된 상품" value={stats.products} />
          <Stat title="출발일" value={stats.departures} />
          <Stat title="긴급특가" value={stats.special} />
          <Stat title="예약문의" value={stats.reservations} />
          <Stat title="후기" value={stats.reviews} />
          <Stat title="공지사항" value={stats.notices} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <Link
                key={menu.title}
                href={menu.href}
                className="flex flex-col items-center justify-center gap-5 rounded-xl bg-white p-8 shadow transition hover:shadow-xl"
              >
                <Icon size={46} />
                <span className="text-xl font-semibold">{menu.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <p className="mb-2 text-gray-500">{title}</p>
      <h2 className="text-4xl font-bold">{value}</h2>
    </div>
  );
}
