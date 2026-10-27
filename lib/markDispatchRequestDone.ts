import { supabase } from "@/lib/supabase";

export async function markDispatchRequestDone(reservationId: string) {
  const { data, error } = await supabase.from("reservation_checklists")
    .select("reservation_id").eq("reservation_id", reservationId).maybeSingle();
  if (error) throw new Error("수배의뢰서 완료 기록을 확인하지 못했습니다.");
  const values = { request_done: true, updated_at: new Date().toISOString() };
  const update = () => supabase.from("reservation_checklists").update(values)
    .eq("reservation_id", reservationId).select("reservation_id").maybeSingle();
  if (data) {
    const result = await update();
    if (result.error || !result.data) throw new Error("수배의뢰서 완료 기록을 저장하지 못했습니다.");
  } else {
    const result = await supabase.from("reservation_checklists").insert({ reservation_id: reservationId, ...values });
    if (result.error?.code === "23505") {
      // Another checklist action may have created the row since our read.
      const retried = await update();
      if (retried.error || !retried.data) throw new Error("수배의뢰서 완료 기록을 저장하지 못했습니다.");
    } else if (result.error) throw new Error("수배의뢰서 완료 기록을 저장하지 못했습니다.");
  }
}
