"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function GalleryPage() {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState("zhangjiajie");

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const { data } = await supabase.storage
      .from("gallery")
      .list("", {
        limit: 100,
      });

    if (!data) return;

    setImages(data.map((item) => item.name));
  }

  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    setUploading(true);

    const fileName =
      `${category}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("gallery")
      .upload(fileName, file);

    setUploading(false);

    if (error) {
      alert(error.message);
      return;
    }

    loadImages();
  }

  async function deleteImage(name: string) {
    if (!confirm("삭제하시겠습니까?")) return;

    await supabase.storage
      .from("gallery")
      .remove([name]);

    loadImages();
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto p-8">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-3xl font-bold">
            사진관리
          </h1>

          <div className="flex gap-4 items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border px-4 py-3"
            >
              <option value="zhangjiajie">장가계</option>
              <option value="baekdu">백두산</option>
              <option value="shanghai">상해·항주</option>
            </select>

            <label className="bg-black text-white px-6 py-3 rounded-xl cursor-pointer">

            {uploading ? "업로드중..." : "사진 업로드"}

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={uploadImage}
            />

            </label>
          </div>

        </div>

        <div className="grid grid-cols-5 gap-6">

          {images.map((image) => {

            const url =
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${image}`;

            return (

              <div
                key={image}
                className="bg-white rounded-xl shadow overflow-hidden"
              >

                <Image
                  src={url}
                  alt=""
                  width={300}
                  height={220}
                  className="w-full h-52 object-cover"
                />

                <button
                  onClick={() => deleteImage(image)}
                  className="w-full bg-red-500 text-white py-3"
                >
                  삭제
                </button>

              </div>

            );

          })}

        </div>

      </div>

    </div>
  );
}