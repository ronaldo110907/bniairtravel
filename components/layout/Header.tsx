"use client";

import Link from "next/link";

const menus = [
  { name: "HOME", href: "/" },
  { name: "장가계", href: "/zhangjiajie" },
  { name: "백두산", href: "/baekdu" },
  { name: "푸꾸옥", href: "/phuquoc" },
  { name: "말레이시아", href: "/malaysia" },
  { name: "상해·항주·주가각", href: "/shanghai" },
  { name: "여행갤러리", href: "/gallery" },
  { name: "예약문의", href: "/contact" },
  { name: "관리자", href: "/admin" },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-transparent">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <div className="text-white text-xl tracking-[8px]">{/* Logo */}</div>

        <nav className="hidden gap-10 lg:flex">
          {menus.map((menu) => (
            <Link
              key={menu.name}
              href={menu.href}
              className="text-sm font-medium tracking-widest text-white hover:text-yellow-400 transition"
            >
              {menu.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
