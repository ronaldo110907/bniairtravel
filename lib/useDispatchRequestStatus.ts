"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "loading" | "done" | "missing" | "error";

export function useDispatchRequestStatus(reservationId?: string) {
  const [result, setResult] = useState<{ id?: string; status: Status }>({ status: "loading" });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    if (!reservationId) return;
    let cancelled = false;
    setResult({ id: reservationId, status: "loading" });
    void (async () => {
      try {
        const { data, error } = await supabase.from("reservation_checklists")
          .select("request_done").eq("reservation_id", reservationId).maybeSingle();
        if (!cancelled) setResult({ id: reservationId, status: error ? "error" : data?.request_done === true ? "done" : "missing" });
      } catch {
        if (!cancelled) setResult({ id: reservationId, status: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, [reservationId, revision]);

  useEffect(() => {
    if (!reservationId) return;
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [reservationId, refresh]);

  // Never expose the previous reservation's completion during a fast switch.
  return { status: result.id === reservationId ? result.status : "loading" as Status, refresh };
}
