"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert("로그인 정보를 확인해주세요.");
      return;
    }

    document.cookie = "admin_user=true; path=/";

    setLoading(false);
    setPreparing(true);

    setTimeout(() => {
      window.location.href = "/admin";
    }, 100);
  }

  if (preparing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
          <div className="mb-4 text-5xl">✈️</div>

          <h2 className="text-2xl font-bold">로그인이 완료되었습니다.</h2>

          <p className="mt-5 text-gray-600">
            관리자 페이지를 준비하고 있습니다.
          </p>

          <p className="mt-2 text-sm text-gray-400">
            최초 접속 시 서버 준비로 인해
            <br />약 20~30초 정도 소요될 수 있습니다.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="mb-8 text-center text-3xl font-bold">관리자 로그인</h1>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border p-4"
          required
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border p-4"
          required
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black py-4 text-white"
        >
          {loading ? "로그인중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
