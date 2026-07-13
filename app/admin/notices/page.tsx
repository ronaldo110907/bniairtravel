"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Notice = {
  id: string;
  title: string;
  content: string;
  is_popup: boolean;
  popup_image?: string;
  start_date?: string;
  end_date?: string;
  sort?: number;
  created_at: string;
};

export default function NoticesPage() {
  const [list, setList] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [popupImage, setPopupImage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState("0");
  const [isPopup, setIsPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("sort", { ascending: true });

    if (error) {
      console.error("NOTICE ERROR", error);
      alert(error.message);
      setList([]);
      return;
    }

    console.log("NOTICE DATA", data);
    setList((data as Notice[]) || []);
  }


  async function uploadPopupImage(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setUploading(true);

    const path = `notices/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("gallery")
      .upload(path, file, { upsert: false });

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("gallery")
      .getPublicUrl(path);

    setPopupImage(data.publicUrl);
    setUploading(false);
  }

  async function save() {
    if (!title.trim()) return alert("제목을 입력하세요.");

    setLoading(true);

    const { error } = await supabase.from("notices").insert({
      title,
      content,
      is_popup: isPopup,
      popup_image: popupImage || null,
      start_date: startDate || null,
      end_date: endDate || null,
      sort: Number(sort),
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    setContent("");
    setPopupImage("");
    setStartDate("");
    setEndDate("");
    setSort("0");
    setIsPopup(false);

    load();
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;

    await supabase.from("notices").delete().eq("id", id);
    load();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-8">
        <h1 className="mb-8 text-3xl font-bold">공지사항 관리</h1>

        <div className="mb-8 space-y-4 rounded-xl bg-white p-6 shadow">
          <input className="w-full rounded-lg border p-3" placeholder="제목" value={title} onChange={(e)=>setTitle(e.target.value)} />

          <textarea className="h-40 w-full rounded-lg border p-3" placeholder="내용" value={content} onChange={(e)=>setContent(e.target.value)} />

          <input
            type="file"
            accept="image/*"
            className="w-full rounded-lg border p-3"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadPopupImage(file);
            }}
          />

          {popupImage && (
            <img
              src={popupImage}
              alt="팝업 미리보기"
              className="h-40 w-full rounded-lg object-cover"
            />
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <input type="date" className="rounded-lg border p-3" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
            <input type="date" className="rounded-lg border p-3" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
            <input type="number" className="rounded-lg border p-3" value={sort} onChange={(e)=>setSort(e.target.value)} />
          </div>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={isPopup} onChange={(e)=>setIsPopup(e.target.checked)} />
            팝업 표시
          </label>

          <button onClick={save} disabled={loading} className="rounded-xl bg-black px-6 py-3 text-white">
            {loading ? "저장중..." : "공지 등록"}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">제목</th>
                <th className="p-4">팝업</th>
                <th className="p-4">작성일</th>
                <th className="p-4">삭제</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item)=>(
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.title}</td>
                  <td className="p-4 text-center">{item.is_popup ? "사용" : "-"}</td>
                  <td className="p-4">{new Date(item.created_at).toLocaleDateString("ko-KR")}</td>
                  <td className="p-4 text-center">
                    <button onClick={()=>remove(item.id)} className="rounded bg-red-500 px-4 py-2 text-white">
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
