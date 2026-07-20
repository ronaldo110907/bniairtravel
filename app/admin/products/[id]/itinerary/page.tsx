"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Duration = "3박4일" | "4박5일";

type Item = {
  id: string;
  product_id: string;
  duration: Duration;
  day: number;
  title: string | null;
  description: string | null;
  image: string | null;
  hotel: string | null;
  sort_order: number;
};

type FormState = {
  day: string;
  title: string;
  description: string;
  image: string;
  hotel: string;
};

const EMPTY_FORM: FormState = {
  day: "",
  title: "",
  description: "",
  image: "",
  hotel: "",
};

export default function ItineraryPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [duration, setDuration] = useState<Duration>("3박4일");
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("product_itineraries")
      .select("*")
      .eq("product_id", productId)
      .eq("duration", duration)
      .order("sort_order", { ascending: true })
      .order("day", { ascending: true });

    if (error) {
      alert(error.message);
      setItems([]);
    } else {
      setItems((data || []) as Item[]);
    }

    setLoading(false);
  }, [duration, productId]);

  useEffect(() => {
    void load();
  }, [load]);

  function changeItem(
    id: string,
    field: keyof Pick<Item, "day" | "title" | "description" | "image" | "hotel">,
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "day" ? Number(value) : value,
            }
          : item,
      ),
    );
  }

  async function addItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const day = Number(form.day);

    if (!Number.isInteger(day) || day < 1) {
      alert("DAY는 1 이상의 숫자로 입력해 주세요.");
      return;
    }

    setSaving(true);

    const nextSortOrder =
      items.length > 0
        ? Math.max(...items.map((item) => item.sort_order ?? item.day)) + 1
        : 1;

    const { error } = await supabase.from("product_itineraries").insert({
      product_id: productId,
      duration,
      day,
      title: form.title.trim() || null,
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      hotel: form.hotel.trim() || null,
      sort_order: nextSortOrder,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setForm(EMPTY_FORM);
    await load();
  }

  async function saveItem(item: Item) {
    setSaving(true);

    const { error } = await supabase
      .from("product_itineraries")
      .update({
        day: item.day,
        title: item.title?.trim() || null,
        description: item.description?.trim() || null,
        image: item.image?.trim() || null,
        hotel: item.hotel?.trim() || null,
        sort_order: item.sort_order,
      })
      .eq("id", item.id)
      .eq("product_id", productId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`DAY ${item.day} 일정이 저장되었습니다.`);
    await load();
  }

  async function remove(id: string) {
    const target = items.find((item) => item.id === id);

    if (!confirm(`DAY ${target?.day ?? ""} 일정을 삭제할까요?`)) return;

    const { error } = await supabase
      .from("product_itineraries")
      .delete()
      .eq("id", id)
      .eq("product_id", productId);

    if (error) {
      alert(error.message);
      return;
    }

    await load();
  }

  async function uploadImage(
    e: ChangeEvent<HTMLInputElement>,
    targetId?: string,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const path = `products/${productId}/itinerary/${duration}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setUploading(false);
      alert(uploadError.message);
      e.target.value = "";
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("gallery").getPublicUrl(path);

    if (targetId) {
      changeItem(targetId, "image", publicUrl);
    } else {
      setForm((current) => ({ ...current, image: publicUrl }));
    }

    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-5 shadow md:p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-gray-500">
            상품 일정 관리
          </p>
          <h1 className="text-3xl font-bold text-gray-900">여행 일정 관리</h1>
        </div>

        <div className="mb-8 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
          {(["3박4일", "4박5일"] as Duration[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDuration(value)}
              className={`rounded-lg px-4 py-3 font-bold transition ${
                duration === value
                  ? "bg-black text-white shadow"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <form
          onSubmit={addItem}
          className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">DAY 추가</h2>
              <p className="mt-1 text-sm text-gray-500">
                현재 선택된 일정: {duration}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">DAY</span>
              <input
                type="number"
                min={1}
                className="rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-black"
                placeholder="예: 1"
                value={form.day}
                onChange={(e) =>
                  setForm((current) => ({ ...current, day: e.target.value }))
                }
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">일정 제목</span>
              <input
                className="rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-black"
                placeholder="예: 청주 → 장가계"
                value={form.title}
                onChange={(e) =>
                  setForm((current) => ({ ...current, title: e.target.value }))
                }
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-semibold">상세 일정</span>
              <textarea
                className="min-h-32 rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-black"
                placeholder={"청주공항 출발\n장가계 도착\n호텔 체크인"}
                value={form.description}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">호텔</span>
              <input
                className="rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-black"
                placeholder="예: 장가계 풀만호텔 또는 동급"
                value={form.hotel}
                onChange={(e) =>
                  setForm((current) => ({ ...current, hotel: e.target.value }))
                }
              />
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-semibold">대표 이미지</span>
              <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-400 bg-white p-3 text-sm font-semibold hover:bg-gray-50">
                {uploading ? "업로드 중..." : "이미지 선택"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => void uploadImage(e)}
                />
              </label>
            </div>

            {form.image && (
              <div className="md:col-span-2">
                <img
                  src={form.image}
                  alt="일정 미리보기"
                  className="h-48 w-full rounded-xl object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="mt-5 w-full rounded-xl bg-black py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "저장 중..." : `${duration} DAY 추가`}
          </button>
        </form>

        <div className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold">{duration} 등록 일정</h2>
              <p className="mt-1 text-sm text-gray-500">
                각 DAY 내용을 수정한 뒤 개별 저장 버튼을 눌러주세요.
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-500">
              총 {items.length}개
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-200 p-10 text-center text-gray-500">
              일정 불러오는 중...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              {duration} 일정이 아직 등록되지 않았습니다.
            </div>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-200"
              >
                <div className="flex items-center justify-between bg-gray-900 px-5 py-4 text-white">
                  <strong className="text-lg">DAY {item.day}</strong>
                  <button
                    type="button"
                    onClick={() => void remove(item.id)}
                    className="text-sm font-semibold text-red-300 hover:text-red-200"
                  >
                    삭제
                  </button>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">DAY</span>
                    <input
                      type="number"
                      min={1}
                      className="rounded-lg border border-gray-300 p-3"
                      value={item.day}
                      onChange={(e) =>
                        changeItem(item.id, "day", e.target.value)
                      }
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">일정 제목</span>
                    <input
                      className="rounded-lg border border-gray-300 p-3"
                      value={item.title ?? ""}
                      onChange={(e) =>
                        changeItem(item.id, "title", e.target.value)
                      }
                    />
                  </label>

                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm font-semibold">상세 일정</span>
                    <textarea
                      className="min-h-32 rounded-lg border border-gray-300 p-3"
                      value={item.description ?? ""}
                      onChange={(e) =>
                        changeItem(item.id, "description", e.target.value)
                      }
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">호텔</span>
                    <input
                      className="rounded-lg border border-gray-300 p-3"
                      value={item.hotel ?? ""}
                      onChange={(e) =>
                        changeItem(item.id, "hotel", e.target.value)
                      }
                    />
                  </label>

                  <div className="grid gap-2">
                    <span className="text-sm font-semibold">대표 이미지</span>
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-400 p-3 text-sm font-semibold hover:bg-gray-50">
                      {uploading ? "업로드 중..." : "이미지 변경"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => void uploadImage(e, item.id)}
                      />
                    </label>
                  </div>

                  {item.image && (
                    <div className="md:col-span-2">
                      <img
                        src={item.image}
                        alt={`DAY ${item.day} 일정`}
                        className="h-56 w-full rounded-xl object-cover"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={saving || uploading}
                    onClick={() => void saveItem(item)}
                    className="rounded-xl bg-black py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
                  >
                    DAY {item.day} 저장
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
