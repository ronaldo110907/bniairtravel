"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function ReservationForm() {
  const searchParams = useSearchParams();
  const departureId = searchParams.get("departure_id");
  const router = useRouter();

  const product = searchParams.get("product") || "";
  const departure = searchParams.get("departure") || "";
  useEffect(() => {
    if (departure) {
      setDepartureDate(departure);
    }
  }, [departure]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("product :", product);
  console.log("departureId :", departureId);

  async function submitReservation(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert("예약자명과 연락처를 입력해주세요.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("reservations").insert({
      name,
      phone,
      product: product || "상담문의",
      departure_date: departureDate,
      departure_id: departureId || null,
      message,
      status: "대기",
    });

    console.log("INSERT ERROR :", error);
    console.log("departureId :", departureId);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }
    await fetch("/api/discord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `
🔔 신규 예약 접수

🧳 상품 : ${product}

👤 예약자 : ${name}

📞 연락처 : ${phone}

📅 출발일 : ${departureDate}

📝 문의사항 :
${message || "없음"}
`,
      }),
    });

    alert("예약 문의가 접수되었습니다.");
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-6 py-24">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-8 text-3xl font-bold">예약 문의</h1>

        <form onSubmit={submitReservation} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-500">상품명</label>
            <input
              value={product}
              readOnly
              className="w-full rounded-xl border bg-gray-100 p-4"
            />
          </div>
          <input
            placeholder="예약자명"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border p-4"
            required
          />
          <input
            placeholder="연락처"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border p-4"
            required
          />
          <input
            type="date"
            value={departureDate}
            min="1900-01-01"
            max="9999-12-31"
            onChange={(e) => {
              const value = e.target.value;
              const year = value.split("-")[0];

              if (year.length > 4) return;

              setDepartureDate(value);
            }}
            className="w-full rounded-xl border p-4"
          />
          <textarea
            placeholder="문의사항"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-32 w-full rounded-xl border p-4"
          />
          <button
            disabled={loading}
            className="w-full rounded-xl bg-black py-4 font-semibold text-white"
          >
            {loading ? "접수중..." : "예약 문의하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
export default function ReservationPage() {
  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <ReservationForm />
    </Suspense>
  );
}
