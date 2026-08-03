"use client";

type Props = {
  departures: any[];
  onEdit: (departure: any) => void;
  onDelete: (departure: any) => void;
  onView: (departure: any) => void;
  onManage: (departure: any) => void;
  passengerCounts: Record<string, number>;
};

export default function DepartureTable({
  departures,
  passengerCounts,
  onEdit,
  onDelete,
  onView,
  onManage,
}: Props) {
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
                {departure.price.toLocaleString()}원
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
                {departure.seat - (passengerCounts[departure.id] ?? 0) <= 0 ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    마감
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    예약가능
                  </span>
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
                <button
                  onClick={() => onManage(departure)}
                  className="text-purple-600 hover:underline"
                >
                  관리
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
