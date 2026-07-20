"use client";

import { KeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ContentType = "inclusion" | "exclusion" | "preparation" | "tip";

type ProductContent = {
  id: string;
  product_id: string;
  type: ContentType;
  title: string;
  sort_order: number;
  created_at?: string;
};

const CONTENT_TABS: Array<{
  type: ContentType;
  label: string;
  description: string;
  placeholder: string;
}> = [
  {
    type: "inclusion",
    label: "포함사항",
    description: "상품 가격에 포함되는 내용을 관리합니다.",
    placeholder: "예: 왕복 항공권",
  },
  {
    type: "exclusion",
    label: "불포함사항",
    description: "상품 가격에 포함되지 않는 내용을 관리합니다.",
    placeholder: "예: 기사·가이드 경비",
  },
  {
    type: "preparation",
    label: "준비물",
    description: "여행 전 준비해야 할 내용을 관리합니다.",
    placeholder: "예: 유효기간 6개월 이상 여권",
  },
  {
    type: "tip",
    label: "여행 TIP",
    description: "여행에 도움이 되는 안내 내용을 관리합니다.",
    placeholder: "예: 편한 운동화를 준비해 주세요.",
  },
];

export default function PreparationsAdminPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [activeType, setActiveType] = useState<ContentType>("inclusion");
  const [items, setItems] = useState<ProductContent[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeTab = useMemo(
    () => CONTENT_TABS.find((tab) => tab.type === activeType) ?? CONTENT_TABS[0],
    [activeType],
  );

  const loadContents = useCallback(async () => {
    if (!productId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("product_contents")
      .select("*")
      .eq("product_id", productId)
      .eq("type", activeType)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      alert(error.message);
      setItems([]);
    } else {
      setItems((data ?? []) as ProductContent[]);
    }

    setLoading(false);
  }, [activeType, productId]);

  useEffect(() => {
    void loadContents();
  }, [loadContents]);

  async function addItem() {
    const title = newTitle.trim();

    if (!title) {
      alert("내용을 입력해 주세요.");
      return;
    }

    setSaving(true);

    const nextSortOrder =
      items.length > 0
        ? Math.max(...items.map((item) => item.sort_order ?? 0)) + 1
        : 1;

    const { error } = await supabase.from("product_contents").insert({
      product_id: productId,
      type: activeType,
      title,
      sort_order: nextSortOrder,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setNewTitle("");
    await loadContents();
  }

  async function updateItem(id: string) {
    const title = editingTitle.trim();

    if (!title) {
      alert("내용을 입력해 주세요.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("product_contents")
      .update({ title })
      .eq("id", id)
      .eq("product_id", productId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingId(null);
    setEditingTitle("");
    await loadContents();
  }

  async function removeItem(id: string) {
    if (!confirm("이 항목을 삭제할까요?")) return;

    setSaving(true);

    const { error } = await supabase
      .from("product_contents")
      .delete()
      .eq("id", id)
      .eq("product_id", productId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    await loadContents();
  }

  async function moveItem(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];

    setSaving(true);

    const { error: currentError } = await supabase
      .from("product_contents")
      .update({ sort_order: target.sort_order })
      .eq("id", current.id);

    if (currentError) {
      setSaving(false);
      alert(currentError.message);
      return;
    }

    const { error: targetError } = await supabase
      .from("product_contents")
      .update({ sort_order: current.sort_order })
      .eq("id", target.id);

    setSaving(false);

    if (targetError) {
      alert(targetError.message);
      return;
    }

    await loadContents();
  }

  function startEditing(item: ProductContent) {
    setEditingId(item.id);
    setEditingTitle(item.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  function handleNewItemKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void addItem();
    }
  }

  function handleEditKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    id: string,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      void updateItem(id);
    }

    if (event.key === "Escape") {
      cancelEditing();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-5 shadow md:p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-gray-500">
            상품 상세 콘텐츠
          </p>
          <h1 className="text-3xl font-bold text-gray-900">상품 내용 관리</h1>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-2 md:grid-cols-4">
          {CONTENT_TABS.map((tab) => (
            <button
              key={tab.type}
              type="button"
              onClick={() => {
                setActiveType(tab.type);
                cancelEditing();
                setNewTitle("");
              }}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition md:text-base ${
                activeType === tab.type
                  ? "bg-black text-white shadow"
                  : "text-gray-500 hover:bg-white hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 md:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab.label} 추가
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              onKeyDown={handleNewItemKeyDown}
              placeholder={activeTab.placeholder}
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void addItem()}
              className="rounded-xl bg-black px-8 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "처리 중..." : "추가"}
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                등록된 {activeTab.label}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                수정·삭제하거나 화살표로 표시 순서를 변경할 수 있습니다.
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-500">
              총 {items.length}개
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
              내용을 불러오는 중...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              등록된 {activeTab.label}이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  {editingId === item.id ? (
                    <div className="flex flex-col gap-3 md:flex-row">
                      <input
                        autoFocus
                        className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        onKeyDown={(event) =>
                          handleEditKeyDown(event, item.id)
                        }
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void updateItem(item.id)}
                          className="flex-1 rounded-xl bg-black px-5 py-3 font-bold text-white disabled:opacity-50 md:flex-none"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="flex-1 rounded-xl bg-gray-200 px-5 py-3 font-bold text-gray-700 md:flex-none"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <p className="min-w-0 pt-1.5 leading-relaxed text-gray-800">
                          {item.title}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <button
                          type="button"
                          disabled={index === 0 || saving}
                          onClick={() => void moveItem(index, "up")}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↑ 위로
                        </button>
                        <button
                          type="button"
                          disabled={index === items.length - 1 || saving}
                          onClick={() => void moveItem(index, "down")}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↓ 아래로
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => startEditing(item)}
                          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void removeItem(item.id)}
                          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
