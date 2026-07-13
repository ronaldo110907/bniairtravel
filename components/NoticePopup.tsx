"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Notice = {
  id: string;
  title: string;
  content: string;
  popup_image?: string;
  sort?: number;
};

export default function NoticePopup() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const closedDate = localStorage.getItem("notice_popup_closed");

    if (closedDate === new Date().toISOString().slice(0, 10)) return;

    loadNotice();
  }, []);

  async function loadNotice() {
    const today = new Date().toISOString().slice(0, 10);

    const { data } = await supabase
      .from("notices")
      .select("*")
      .eq("is_popup", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("sort", { ascending: true });

    if (data && data.length > 0) {
      setNotices(data);
      setVisible(true);
    }
  }

  function closeToday() {
    localStorage.setItem(
      "notice_popup_closed",
      new Date().toISOString().slice(0, 10)
    );
    setVisible(false);
  }

  function close() {
    setVisible(false);
  }

  if (!visible || notices.length === 0) return null;

  const notice = notices[index];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {notice.popup_image && (
          <img
            src={notice.popup_image}
            alt={notice.title}
            className="max-h-[420px] w-full object-cover"
          />
        )}

        <div className="p-6">
          <h2 className="text-xl font-bold md:text-2xl">
            {notice.title}
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 md:text-base">
            {notice.content}
          </p>

          {notices.length > 1 && (
            <div className="mt-4 text-center text-sm text-gray-400">
              {index + 1} / {notices.length}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {notices.length > 1 && index < notices.length - 1 && (
              <button
                onClick={() => setIndex(index + 1)}
                className="flex-1 rounded-xl border py-3"
              >
                다음
              </button>
            )}

            <button
              onClick={closeToday}
              className="flex-1 rounded-xl bg-gray-200 py-3"
            >
              오늘 하루 보지 않기
            </button>

            <button
              onClick={close}
              className="flex-1 rounded-xl bg-black py-3 text-white"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
