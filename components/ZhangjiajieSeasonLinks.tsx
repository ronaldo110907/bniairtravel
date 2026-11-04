import Link from "next/link";

export default function ZhangjiajieSeasonLinks({ year }: { year: 2026 | 2027 }) {
  return (
    <nav aria-label="장가계 시즌 선택" className="flex flex-wrap items-center justify-center gap-2 bg-[#193449] px-4 py-4 text-sm text-white">
      <Link href="/" className="mr-2 px-2 py-2 text-white/80">홈</Link>
      {([2027, 2026] as const).map(season => (
        <Link key={season} href={season === 2027 ? "/zhangjiajie-2027" : "/zhangjiajie"}
          aria-current={year === season ? "page" : undefined}
          className={`rounded-full px-4 py-2 font-bold ${year === season ? "bg-white text-[#193449]" : "border border-white/40 hover:bg-white/10"}`}>
          {season === 2027 ? "2027 상반기 장가계" : "2026 가을 장가계"}
        </Link>
      ))}
    </nav>
  );
}
