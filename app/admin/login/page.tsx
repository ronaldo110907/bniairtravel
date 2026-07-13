"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("로그인 정보를 확인해주세요.");
      return;
    }

    document.cookie = "admin_user=true; path=/";

    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="mb-8 text-center text-3xl font-bold">
          관리자 로그인
        </h1>

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
