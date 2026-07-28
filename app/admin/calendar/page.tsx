import Calendar from "@/components/calendar/Calendar";

export default function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">📅 출발일 달력 (V2)</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* 왼쪽 : 달력 */}
        <div className="col-span-7 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">달력</h2>
          <Calendar />
        </div>

        {/* 오른쪽 : 선택한 날짜 */}
        <div className="col-span-5 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">선택한 날짜</h2>

          <div className="flex h-[600px] items-center justify-center rounded-lg border-2 border-dashed text-gray-400">
            날짜를 선택하세요.
          </div>
        </div>
      </div>
    </div>
  );
}
