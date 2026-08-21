"use client";

import { useState } from "react";

type Course = "3박4일" | "4박5일";

export default function ItineraryEmailButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState<Course>("3박4일");

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const sendEmail = async () => {
    if (!email.trim()) {
      setMessage("받는 분 이메일을 입력해주세요.");
      return;
    }

    if (!companyName.trim()) {
      setMessage("보내는 회사명을 입력해주세요.");
      return;
    }

    if (!managerName.trim()) {
      setMessage("담당자명을 입력해주세요.");
      return;
    }

    if (!phone.trim()) {
      setMessage("연락처를 입력해주세요.");
      return;
    }

    try {
      setSending(true);
      setMessage("");

      const response = await fetch("/api/send-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          companyName: companyName.trim(),
          managerName: managerName.trim(),
          phone: phone.trim(),
          course,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "메일 발송에 실패했습니다.");
      }

      setMessage("메일을 발송했습니다. 📧");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error ? error.message : "메일 발송에 실패했습니다.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="w-full rounded-2xl border bg-white px-5 py-4 font-bold shadow-sm transition hover:bg-gray-50"
      >
        📧 일정표 메일로 보내기
        <span className="ml-2 text-gray-400">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="mt-3 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="font-bold">📧 일정표 메일 보내기</div>

            <p className="mt-1 text-sm text-gray-500">
              고객에게 여행 일정표를 이메일로 보내세요.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="받는 분 이메일"
              className="rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="보내는 회사명"
              className="rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="담당자명"
              className="rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="연락처"
              className="rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-5">
            <div className="mb-3 text-sm font-bold text-gray-700">
              보내실 일정을 선택해주세요.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCourse("3박4일")}
                className={`flex-1 rounded-xl border px-4 py-3 font-bold transition ${
                  course === "3박4일"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                3박4일
              </button>

              <button
                type="button"
                onClick={() => setCourse("4박5일")}
                className={`flex-1 rounded-xl border px-4 py-3 font-bold transition ${
                  course === "4박5일"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                4박5일
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={sendEmail}
            disabled={sending}
            className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? "발송 중..." : "📧 일정표 메일 보내기"}
          </button>

          {message && (
            <div className="mt-3 text-center text-sm text-gray-600">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
