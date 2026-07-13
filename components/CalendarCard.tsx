"use client";

import { Departure } from "@/data/zhangjiajie";

interface Props {
  departure?: Departure;
  selected: boolean;
  onClick: () => void;
}

export default function CalendarCard({
  departure,
  selected,
  onClick,
}: Props) {
  if (!departure) {
    return <div className="aspect-square rounded-3xl" />;
  }

  const day = Number(departure.date.split("-")[2]);

  const getStatus = () => {
    switch (departure.status) {
      case "hot":
        return {
          text: "🔥 긴급특가",
          color: "bg-red-500 text-white",
        };

      case "closed":
        return {
          text: "예약마감",
          color: "bg-gray-400 text-white",
        };

      default:
        return {
          text: "예약가능",
          color: "bg-emerald-600 text-white",
        };
    }
  };

  const status = getStatus();

  return (
    <button
      onClick={onClick}
      disabled={departure.status === "closed"}
      className={`
        relative
        aspect-square
        overflow-hidden
        rounded-3xl
        border
        p-4
        text-left
        transition-all
        duration-300

        ${
          selected
            ? "border-[#C8A15A] bg-[#FFF9F0] shadow-2xl scale-[1.04]"
            : "border-[#ece7df] bg-white hover:-translate-y-1 hover:border-[#C8A15A] hover:shadow-xl"
        }

        ${
          departure.status === "closed"
            ? "opacity-60"
            : ""
        }
      `}
    >
      <div className="absolute right-4 top-4">
        <span
          className={`
            rounded-full
            px-3
            py-1
            text-[10px]
            font-bold
            ${status.color}
          `}
        >
          {status.text}
        </span>
      </div>

      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="text-4xl font-bold text-[#222]">
            {day}
          </div>

          <div className="mt-3 inline-block rounded-full bg-[#C8A15A]/10 px-3 py-1 text-xs font-semibold text-[#A37A33]">
            {departure.course}
          </div>
        </div>

        <div>
          <div className="text-lg font-bold text-[#C8A15A]">
            ₩{departure.price.toLocaleString()}
          </div>

          <div className="mt-1 text-xs text-gray-500">
            {departure.airline}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              잔여석
            </span>

            <span
              className={`
                text-sm
                font-bold

                ${
                  departure.seats <= 5
                    ? "text-red-500"
                    : "text-emerald-600"
                }
              `}
            >
              {departure.seats}석
            </span>
          </div>
        </div>
      </div>

      {selected && (
        <div className="absolute inset-0 rounded-3xl ring-2 ring-[#C8A15A]/40" />
      )}
    </button>
  );
}