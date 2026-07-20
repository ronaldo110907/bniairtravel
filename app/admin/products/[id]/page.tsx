"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ImageField = "thumbnail" | "hero_image";

type ProductForm = {
  slug: string;
  title: string;
  subtitle: string;
  country: string;
  city: string;
  airline: string;
  nights: string;
  days: string;
  price: string;
  thumbnail: string;
  hero_image: string;
  is_best: boolean;
  is_visible: boolean;
  sort: string;
};

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<ImageField | null>(null);

  const [form, setForm] = useState<ProductForm>({
    slug: "",
    title: "",
    subtitle: "",
    country: "",
    city: "",
    airline: "",
    nights: "",
    days: "",
    price: "",
    thumbnail: "",
    hero_image: "",
    is_best: false,
    is_visible: true,
    sort: "0",
  });

  useEffect(() => {
    if (!id) return;

    async function loadProduct() {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert(error?.message || "상품을 불러오지 못했습니다.");
        router.push("/admin/products");
        return;
      }

      setForm({
        slug: data.slug ?? "",
        title: data.title ?? "",
        subtitle: data.subtitle ?? "",
        country: data.country ?? "",
        city: data.city ?? "",
        airline: data.airline ?? "",
        nights: String(data.nights ?? ""),
        days: String(data.days ?? ""),
        price: String(data.price ?? ""),
        thumbnail: data.thumbnail ?? "",
        hero_image: data.hero_image ?? "",
        is_best: Boolean(data.is_best),
        is_visible: Boolean(data.is_visible),
        sort: String(data.sort ?? 0),
      });

      setLoading(false);
    }

    loadProduct();
  }, [id, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function uploadImage(file: File, field: ImageField) {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("이미지 크기는 10MB 이하만 가능합니다.");
      return;
    }

    setUploading(field);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeSlug = form.slug.trim() || "product";
      const filePath = `products/${safeSlug}-${field}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);
        console.log("PUBLIC URL =", data.publicUrl);

      setForm((prev) => ({
        ...prev,
        [field]: data.publicUrl,
      }));
      console.log("SET FIELD =", field);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "이미지 업로드에 실패했습니다.",
      );
    } finally {
      setUploading(null);
    }
  }

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    field: ImageField,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadImage(file, field);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!id) {
      alert("상품 ID가 없습니다.");
      return;
    }

    if (!form.slug.trim() || !form.title.trim()) {
      alert("슬러그와 상품명을 입력해주세요.");
      return;
    }

    if (uploading) {
      alert("이미지 업로드가 끝날 때까지 기다려주세요.");
      return;
    }

    console.log("IMAGE SAVE CHECK", {
      thumbnail: form.thumbnail,
      hero_image: form.hero_image,
    });

    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({
        slug: form.slug.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        airline: form.airline.trim() || null,
        nights: form.nights ? Number(form.nights) : null,
        days: form.days ? Number(form.days) : null,
        price: form.price ? Number(form.price) : null,
        thumbnail: form.thumbnail || null,
        hero_image: form.hero_image || null,
        is_best: form.is_best,
        is_visible: form.is_visible,
        sort: form.sort ? Number(form.sort) : 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("상품이 수정되었습니다.");

    const { data: checkData } = await supabase
      .from("products")
      .select("thumbnail, hero_image")
      .eq("id", id)
      .single();

    console.log("DB IMAGE CHECK", checkData);

    router.push("/admin/products");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">상품 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">상품 수정</h1>
          <button
            type="button"
            onClick={() => router.push(`/admin/products/${id}/departures`)}
            className="rounded-xl bg-black px-5 py-3 text-white"
          >
            출발일 관리
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">슬러그</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="zhangjiajie"
                className="w-full rounded-lg border px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">상품명</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="장가계"
                className="w-full rounded-lg border px-4 py-3"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">부제목</label>
            <input
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold">국가</label>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">도시</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">항공사</label>
              <input
                name="airline"
                value={form.airline}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">숙박일수</label>
              <input
                type="number"
                min="0"
                name="nights"
                value={form.nights}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">여행일수</label>
              <input
                type="number"
                min="1"
                name="days"
                value={form.days}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">가격</label>
              <input
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">정렬순서</label>
              <input
                type="number"
                name="sort"
                value={form.sort}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-5">
              <label className="mb-3 block text-sm font-semibold">
                썸네일 이미지
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "thumbnail")}
                disabled={uploading !== null}
                className="w-full text-sm"
              />

              <p className="mt-2 text-xs text-gray-500">
                {uploading === "thumbnail"
                  ? "업로드 중..."
                  : "새 이미지를 선택하지 않으면 기존 이미지가 유지됩니다."}
              </p>

              {form.thumbnail && (
                <div className="mt-4 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.thumbnail}
                    alt="썸네일 미리보기"
                    className="h-56 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="rounded-xl border p-5">
              <label className="mb-3 block text-sm font-semibold">
                히어로 이미지
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "hero_image")}
                disabled={uploading !== null}
                className="w-full text-sm"
              />

              <p className="mt-2 text-xs text-gray-500">
                {uploading === "hero_image"
                  ? "업로드 중..."
                  : "새 이미지를 선택하지 않으면 기존 이미지가 유지됩니다."}
              </p>

              {form.hero_image && (
                <div className="mt-4 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.hero_image}
                    alt="히어로 이미지 미리보기"
                    className="h-56 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 rounded-xl bg-gray-50 p-5">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_best"
                checked={form.is_best}
                onChange={handleChange}
              />
              BEST 상품
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_visible"
                checked={form.is_visible}
                onChange={handleChange}
              />
              홈페이지 노출
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={saving || uploading !== null}
              className="w-1/3 rounded-xl border py-4 font-semibold"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={saving || uploading !== null}
              className="w-2/3 rounded-xl bg-black py-4 font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "수정 중..."
                : uploading
                  ? "이미지 업로드 중..."
                  : "수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
