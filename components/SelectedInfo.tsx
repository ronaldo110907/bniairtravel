"use client";

type Departure = {
  date: string;
  airline: string;
  course: string;
  price: number;
  seats: number;
  status: "hot" | "closed" | "available";
};

interface Props {
  departure: Departure | null;
}

export default function SelectedInfo({ departure }: Props) {
  if (!departure) {
    return (
      <div className="sticky top-24 overflow-hidden rounded-[32px] bg-[#1d1d1d] text-white shadow-2xl">
        <div className="flex h-[620px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-6xl">🗓️</div>
            <h3 className="text-2xl font-bold">출발일을 선택하세요</h3>
            <p className="mt-4 text-sm leading-7 text-white/60">
              달력에서 원하는 출발일을 선택하면
              <br />
              상품 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const status =
    departure.status === "hot"
      ? "🔥 긴급특가"
      : departure.status === "closed"
      ? "예약마감"
      : "예약가능";

  return (
    <div className="sticky top-24 overflow-hidden rounded-[32px] bg-[#1d1d1d] text-white shadow-2xl">
      <div className="bg-gradient-to-r from-[#C8A15A] to-[#B78B3F] px-8 py-10">
        <p className="text-xs tracking-[0.35em] text-white/70">
          SELECTED TOUR
        </p>
        <h2 className="mt-3 text-3xl font-bold">선택한 여행상품</h2>
        <p className="mt-2 text-white/80">
          {departure.date.replaceAll("-", ".")}
        </p>
      </div>

      <div className="space-y-6 p-8">
        <Item icon="🛫" title="항공사" value={departure.airline} />
        <Item icon="🗓️" title="여행일정" value={departure.course} />
        <Item
          icon="💰"
          title="상품가"
          value={`₩ ${departure.price.toLocaleString()}`}
        />
        <Item
          icon="👥"
          title="잔여석"
          value={departure.status === "closed" ? "예약마감" : `${departure.seats}석`}
        />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-sm text-white/50">예약상태</div>
          <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
            {status}
          </span>
        </div>

        <button className="w-full rounded-2xl bg-[#C8A15A] py-5 text-lg font-bold transition hover:bg-[#B78B3F]">
          예약 문의하기
        </button>
      </div>
    </div>
  );
}

function Item({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C8A15A]/20 text-2xl">
        {icon}
      </div>
      <div>
        <div className="text-sm text-white/50">{title}</div>
        <div className="mt-1 text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}
