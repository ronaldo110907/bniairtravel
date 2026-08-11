"use client";

type Props = {
  departures: any[];
  onEdit: (departure: any) => void;
  onDelete: (departure: any) => void;
  onView: (departure: any) => void;
  onManage: (departure: any) => void;
  passengerCounts: Record<string, number>;
  settlementCompleted: Record<string, boolean>;
};

export default function DepartureTable({
  departures,
  passengerCounts,
  settlementCompleted,
  onEdit,
  onDelete,
  onView,
  onManage,
}: Props) {
  const groupedDepartures = departures.reduce(
    (acc: Record<string, any[]>, departure) => {
      const product = departure.product?.title ?? "기타";

      if (!acc[product]) {
        acc[product] = [];
      }

      acc[product].push(departure);

      return acc;
    },
    {},
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-center font-semibold">출발일</th>
            <th className="px-4 py-3 text-center font-semibold">일정</th>
            <th className="px-4 py-3 text-center font-semibold">가격</th>
            <th className="px-4 py-3 text-center font-semibold">항공사</th>
            <th className="px-4 py-3 text-center font-semibold">총좌석</th>
            <th className="px-4 py-3 text-center font-semibold">모객</th>
            <th className="px-4 py-3 text-center font-semibold">잔여</th>
            <th className="px-4 py-3 text-center font-semibold">상태</th>
            <th className="px-4 py-3 text-center font-semibold">관리</th>
            <th className="px-4 py-3 text-center font-semibold">예약자</th>
            <th className="px-4 py-3 text-center font-semibold">객실&정산</th>
          </tr>
        </thead>

        <tbody>
          {departures.map((departure) => (
            <tr key={departure.id} className="border-t">
              <td className="px-4 py-3 text-center">
                {departure.departure_date}
              </td>

              <td className="px-4 py-3 text-center">
                {departure.course ?? "-"}
              </td>

              <td className="px-4 py-3 text-center">
                {departure.price_note
                  ? departure.price_note
                  : `${departure.price.toLocaleString()}원`}
              </td>

              <td className="px-4 py-3 text-center">{departure.airline}</td>

              <td className="px-4 py-3 text-center">{departure.seat}</td>

              <td className="px-4 py-3 text-center">
                {passengerCounts[departure.id] ?? 0}
              </td>

              <td className="px-4 py-3 text-center">
                {departure.seat - (passengerCounts[departure.id] ?? 0)}
              </td>

              <td className="px-4 py-3 text-center">
                {departure.status === "마감" ||
                departure.seat - (passengerCounts[departure.id] ?? 0) <= 0 ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    마감
                  </span>
                ) : departure.status === "마감임박" ? (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                    마감임박
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    예약가능
                  </span>
                )}
                {departure.is_special && (
                  <div className="mt-2">
                    <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                      🔥 특가
                    </span>
                  </div>
                )}
              </td>

              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onEdit(departure)}
                  className="mr-2 text-blue-600 hover:underline"
                >
                  수정
                </button>

                <button
                  onClick={() => {
                    console.log("삭제 클릭");
                    onDelete(departure);
                  }}
                  className="text-red-600 hover:underline"
                >
                  삭제
                </button>
              </td>

              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onView(departure)}
                  className="text-indigo-600 hover:underline"
                >
                  보기
                </button>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => onManage(departure)}
                    className="text-purple-600 hover:underline"
                  >
                    관리
                  </button>

                  {settlementCompleted[departure.id] && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      정산완료
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
