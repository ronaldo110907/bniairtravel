"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Partner = {
  id: string;
  name: string;
  phone: string | null;
  mobile: string | null;
  memo: string | null;
  is_active: boolean;
  created_at: string;
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [memo, setMemo] = useState("");

  const [showExistingPartners, setShowExistingPartners] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  async function loadPartners() {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      alert("거래처 목록을 불러오지 못했습니다.");
      return;
    }

    setPartners(data ?? []);
  }

  function resetForm() {
    setName("");
    setPhone("");
    setMobile("");
    setMemo("");
    setEditingId(null);
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("거래처명을 입력해주세요.");
      return;
    }

    const duplicatePartner = partners.find(
      (partner) =>
        partner.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        partner.id !== editingId,
    );

    if (duplicatePartner) {
      alert(
        `"${duplicatePartner.name}" 거래처가 이미 등록되어 있습니다.\n기존 거래처를 확인해주세요.`,
      );
      return;
    }

    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from("partners")
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          mobile: mobile.trim() || null,
          memo: memo.trim() || null,
        })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("거래처 수정 중 오류가 발생했습니다.");
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("partners").insert({
        name: name.trim(),
        phone: phone.trim() || null,
        mobile: mobile.trim() || null,
        memo: memo.trim() || null,
      });

      if (error) {
        console.error(error);
        alert("거래처 등록 중 오류가 발생했습니다.");
        setLoading(false);
        return;
      }
    }

    resetForm();
    await loadPartners();

    setLoading(false);
  }

  function handleEdit(partner: Partner) {
    setEditingId(partner.id);
    setName(partner.name);
    setPhone(partner.phone ?? "");
    setMobile(partner.mobile ?? "");
    setMemo(partner.memo ?? "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleToggleActive(partner: Partner) {
    const { error } = await supabase
      .from("partners")
      .update({
        is_active: !partner.is_active,
      })
      .eq("id", partner.id);

    if (error) {
      console.error(error);
      alert("사용여부 변경 중 오류가 발생했습니다.");
      return;
    }

    loadPartners();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        {/* 상단 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🏢 거래처 관리</h1>

            <p className="mt-2 text-sm text-gray-500">
              자주 사용하는 거래처의 이름과 연락처를 미리 등록합니다.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            ← 관리자 메인
          </Link>
        </div>

        {/* 등록 / 수정 */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-bold">
            {editingId ? "✏️ 거래처 수정" : "➕ 거래처 등록"}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                거래처명 *
              </label>

              <input
                value={name}
                onFocus={() => {
                  if (name.trim()) {
                    setShowExistingPartners(true);
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;

                  setName(value);
                  setShowExistingPartners(value.trim().length > 0);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowExistingPartners(false);
                  }, 150);
                }}
                placeholder="예: 하나투어 청주점"
                autoComplete="off"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />

              {showExistingPartners &&
                name.trim() &&
                partners.filter((partner) =>
                  partner.name
                    .toLowerCase()
                    .includes(name.trim().toLowerCase()),
                ).length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border bg-white shadow-xl">
                    <div className="border-b bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
                      ⚠ 이미 등록된 거래처인지 확인해주세요.
                    </div>

                    {partners
                      .filter((partner) =>
                        partner.name
                          .toLowerCase()
                          .includes(name.trim().toLowerCase()),
                      )
                      .slice(0, 10)
                      .map((partner) => (
                        <button
                          key={partner.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();

                            handleEdit(partner);
                            setShowExistingPartners(false);
                          }}
                          className="flex w-full items-center justify-between border-b px-4 py-3 text-left last:border-b-0 hover:bg-blue-50"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">
                              🏢 {partner.name}
                            </div>

                            <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                              {partner.phone && <div>☎ {partner.phone}</div>}
                              {partner.mobile && <div>📱 {partner.mobile}</div>}
                              {partner.memo && <div>메모 : {partner.memo}</div>}
                            </div>
                          </div>

                          <span className="text-xs font-bold text-blue-600">
                            기존 거래처
                          </span>
                        </button>
                      ))}
                  </div>
                )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                연락처
              </label>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="예: 010-1234-5678"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                휴대폰
              </label>

              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="예: 010-1234-5678"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                메모
              </label>

              <input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="담당자명 또는 참고사항"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "저장중..." : editingId ? "수정 저장" : "거래처 등록"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50"
              >
                수정 취소
              </button>
            )}
          </div>
        </div>

        {/* 거래처 목록 */}
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-bold">
              📋 거래처 목록
              <span className="ml-2 text-sm font-normal text-gray-400">
                {partners.length}개
              </span>
            </h2>
          </div>

          {partners.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              등록된 거래처가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-sm text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">거래처명</th>
                    <th className="px-5 py-3 text-left">연락처</th>
                    <th className="px-5 py-3 text-left">메모</th>
                    <th className="px-5 py-3 text-center">상태</th>
                    <th className="px-5 py-3 text-center">관리</th>
                  </tr>
                </thead>

                <tbody>
                  {partners.map((partner) => (
                    <tr
                      key={partner.id}
                      className={`border-t ${
                        !partner.is_active ? "bg-gray-50 opacity-60" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold">
                        {partner.name}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        <div className="space-y-1">
                          {partner.phone && <div>☎ {partner.phone}</div>}

                          {partner.mobile && <div>📱 {partner.mobile}</div>}

                          {!partner.phone && !partner.mobile && (
                            <div className="text-gray-300">-</div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-500">
                        {partner.memo || "-"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {partner.is_active ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            사용
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-500">
                            미사용
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(partner)}
                            className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                          >
                            수정
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(partner)}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${
                              partner.is_active
                                ? "bg-gray-500 hover:bg-gray-600"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {partner.is_active ? "사용안함" : "사용"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
