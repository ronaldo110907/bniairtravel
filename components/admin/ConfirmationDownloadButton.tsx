"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { confirmationProducts } from "@/lib/confirmation/products";
import { countPeople, matchProduct, courseDuration, summarizeRooms, safeFilename, type Departure, type Reservation, type Room, type RoomMember } from "@/lib/confirmation/model";

type Props = { departure: Departure; reservation: Reservation };
export default function ConfirmationDownloadButton({ departure, reservation }: Props) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false);
  const [productId, setProductId] = useState("");
  const [roomRows, setRoomRows] = useState<Room[]>([]), [members, setMembers] = useState<RoomMember[]>([]);
  const [roomLoading, setRoomLoading] = useState(false), [roomError, setRoomError] = useState("");
  const [error, setError] = useState("");
  const [fields, setFields] = useState({ groupName: "", pickupSign: "", guide: "", vehicle: "전용차량", meeting: "", meetingContact: "" });
  const [paxOverride, setPaxOverride] = useState<string | null>(null), [roomOverride, setRoomOverride] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const available = confirmationProducts.filter(p => p.productSlug === departure.products?.slug);
  const product = available.find(p => p.id === productId);
  const active = reservation.status === "취소" ? [] : [reservation];
  const people = countPeople(active), roomSummary = summarizeRooms(roomRows, members, active);
  const actualPax = paxOverride ?? (people.total ? `${people.total}명` : "");
  const actualRooms = roomOverride ?? roomSummary.text;
  const duration = courseDuration(departure.course ?? "");
  const wrongDuration = !!product && !!duration && (duration.days !== product.days.length || duration.nights !== product.nights);
  const mixedProduct = active.some(r => r.product !== departure.products?.title);
  const change = (key: keyof typeof fields, value: string) => setFields(f => ({ ...f, [key]: value }));
  function openDialog() {
    const matched = matchProduct(confirmationProducts, departure);
    setProductId(matched?.id ?? ""); setPaxOverride(null); setRoomOverride(null); setError("");
    setFields({ groupName: reservation.name ?? "", pickupSign: "", guide: "", vehicle: "전용차량", meeting: matched?.meeting ?? "", meetingContact: "" });
    setOpen(true);
  }
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setRoomLoading(true); setRoomError(""); setRoomRows([]); setMembers([]);
    void (async () => {
      try {
        const response = await supabase.from("rooms").select("id, reservation_id, room_name, room_type").eq("departure_id", departure.id);
        if (response.error) throw response.error;
        const rooms = (response.data ?? []) as Room[];
        const result = rooms.length ? await supabase.from("room_members").select("room_id, reservation_person_id").in("room_id", rooms.map(r => r.id)) : { data: [], error: null };
        if (result.error) throw result.error;
        if (!cancelled) { setRoomRows(rooms); setMembers((result.data ?? []) as RoomMember[]); }
      } catch {
        if (!cancelled) setRoomError("객실을 불러오지 못했습니다. 객실 칸에 직접 입력해주세요.");
      } finally { if (!cancelled) setRoomLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [open, departure.id]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [open]);
  async function download() {
    setError("");
    if (!product || !active.length || wrongDuration || mixedProduct) { setError("상품과 대상 예약을 확인해주세요."); return; }
    if (!actualPax.trim() || !fields.groupName.trim()) { setError("단체명과 인원을 입력해주세요."); return; }
    if (roomError && !actualRooms.trim()) { setError("객실 정보를 직접 입력해주세요. 미정인 경우 ‘미정’으로 입력할 수 있습니다."); return; }
    setBusy(true);
    try {
      const { generateHwpx } = await import("@/lib/confirmation/generateHwpx");
      const { bytes } = await generateHwpx({ product, departureDate: departure.departure_date, ...fields, people: actualPax, rooms: actualRooms });
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/hwp+zip" });
      const url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url; link.download = `${safeFilename(`${departure.departure_date}_${fields.groupName}_${product.label}_확정서`)}.hwpx`;
      document.body.append(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { setError(e instanceof Error ? e.message : "확정서 생성에 실패했습니다."); }
    finally { setBusy(false); }
  }
  const inputClass = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900";
  return <>
    <button type="button" onClick={openDialog} className="rounded-xl bg-indigo-700 px-6 py-3 font-bold text-white hover:bg-indigo-800">확정서 다운로드</button>
    {open && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="confirmation-heading" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-xl"
        onKeyDown={e => {
          if (e.key === "Escape" && !busy) setOpen(false);
          if (e.key === "Tab") {
            const nodes = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'));
            const first = nodes[0], last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
          }
        }}>
        <div className="flex items-start justify-between gap-3"><div><h2 id="confirmation-heading" className="text-xl font-bold">확정서 만들기</h2><p className="mt-1 text-sm text-gray-600">{departure.departure_date} 출발 · 다운로드 후 한글에서 수정할 수 있습니다.</p></div><button ref={closeRef} type="button" disabled={busy} onClick={() => setOpen(false)} className="rounded border px-3 py-1">닫기</button></div>
        {!available.length ? <p className="my-6 rounded bg-amber-50 p-4">이 상품의 확정서 일정은 아직 연결되지 않았습니다. 공통 양식에 상품 일정을 등록하면 사용할 수 있습니다.</p> : <>
          <label className="mt-5 block text-sm font-semibold">상품 일정<select className={inputClass} value={productId} disabled={busy} onChange={e => { setProductId(e.target.value); change("meeting", available.find(p => p.id === e.target.value)?.meeting ?? ""); }}><option value="">상품 일정을 선택해주세요</option>{available.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
          {wrongDuration && <p role="alert" className="text-sm text-red-700">출발일의 여행 기간과 선택한 상품의 기간이 다릅니다.</p>}
          <p className="mt-4 text-sm text-gray-600">대상 예약: {reservation.name || "예약"} · {reservation.product} · {reservation.status}</p>
          {reservation.status === "취소" && <p role="alert" className="text-sm text-red-700">취소된 예약은 확정서를 생성할 수 없습니다.</p>}
          <fieldset disabled={busy} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">단체명 / 거래처명<input className={inputClass} value={fields.groupName} onChange={e => change("groupName", e.target.value)} placeholder="예주여행사" maxLength={60} /></label>
            <label className="text-sm font-semibold">인원<input className={inputClass} value={actualPax} onChange={e => setPaxOverride(e.target.value)} maxLength={60} /></label>
            <label className="text-sm font-semibold">객실{roomLoading && " (조회 중)"}<input className={inputClass} value={actualRooms} onChange={e => setRoomOverride(e.target.value)} placeholder="미정 또는 트윈 5실" maxLength={120} /></label>
            <label className="text-sm font-semibold">차량<input className={inputClass} value={fields.vehicle} onChange={e => change("vehicle", e.target.value)} maxLength={80} /></label>
            <label className="text-sm font-semibold">미팅피켓<input className={inputClass} value={fields.pickupSign} onChange={e => change("pickupSign", e.target.value)} maxLength={100} /></label>
            <label className="text-sm font-semibold">현지가이드 / 연락처<input className={inputClass} value={fields.guide} onChange={e => change("guide", e.target.value)} maxLength={150} /></label>
            <label className="text-sm font-semibold sm:col-span-2">미팅 시간 / 장소<textarea rows={2} className={inputClass} value={fields.meeting} onChange={e => change("meeting", e.target.value)} maxLength={350} /></label>
            <label className="text-sm font-semibold sm:col-span-2">미팅 담당자 / 연락처<input className={inputClass} value={fields.meetingContact} onChange={e => change("meetingContact", e.target.value)} placeholder="이름 · 전화번호" maxLength={150} /></label>
          </fieldset>
          {[...people.warnings, ...roomSummary.warnings, roomError].filter(Boolean).map((w, i) => <p key={i} className="mt-2 text-sm text-amber-800">{w}</p>)}
          <p className="mt-4 text-xs text-gray-500">기본 일정은 홈페이지 상품 자료를 사용합니다. 수정한 입력값은 이번 확정서에만 반영되며 예약 정보는 바뀌지 않습니다.</p>
          {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
          <div className="mt-5 flex justify-end"><button type="button" onClick={() => void download()} disabled={busy || roomLoading || !product || !active.length || wrongDuration || mixedProduct} className="rounded-xl bg-indigo-700 px-6 py-3 font-bold text-white disabled:opacity-40">{busy ? "확정서 만드는 중…" : "HWPX 다운로드"}</button></div>
        </>}
      </section>
    </div>}
  </>;
}
