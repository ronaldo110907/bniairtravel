"use client";

import { useState } from "react";

export default function ItineraryEmailButton() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const sendEmail = async () => {
    if (!email.trim()) {
      setMessage("이메일 주소를 입력해주세요.");
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
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-3 font-bold">📧 일정표 메일 보내기</div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="받는 분 이메일"
          className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={sendEmail}
          disabled={sending}
          className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-50"
        >
          {sending ? "발송 중..." : "메일 보내기"}
        </button>
      </div>

      {message && <div className="mt-3 text-sm text-gray-600">{message}</div>}
    </div>
  );
}
