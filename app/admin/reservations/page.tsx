"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx-js-style";
import PersonCard from "@/components/PersonCard";

type ReservationPeople = {
  id: string;
  reservation_id: string;
  name: string;
  passport_image: string | null;
  passport_name: string | null;
  passport_number: string | null;
  passport_birth: string | null;
  passport_expiry: string | null;
  passport_issue: string | null;
  passport_sex: string | null;
  passport_nationality: string | null;
  sort_order: number;
};

type Reservation = {
  id: string;
  name: string;
  phone: string;
  product: string;
  departure_date: string;
  message: string;
  status: string;
  memo: string | null;
  created_at: string;

  passport_image: string | null;
  passport_name: string | null;
  passport_number: string | null;
  passport_birth: string | null;
  passport_issue: string | null;
  passport_expiry: string | null;
  passport_country: string | null;

  ocr_status: string | null;
  ocr_raw_text: string | null;

  people?: ReservationPeople[];
};
const STATUS_OPTIONS = ["대기", "상담중", "예약완료", "취소"];
const PAGE_SIZE = 20;

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusClass(status: string) {
  switch (status) {
    case "상담중":
      return `
        border-orange-300
        bg-orange-100
        text-orange-800
        shadow-sm
      `;

    case "예약완료":
      return `
        border-emerald-300
        bg-emerald-100
        text-emerald-800
        shadow-sm
      `;

    case "취소":
      return `
        border-red-300
        bg-red-100
        text-red-800
        shadow-sm
      `;

    default:
      return `
        border-gray-300
        bg-gray-100
        text-gray-700
      `;
  }
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ReservationsPage() {
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [departureFrom, setDepartureFrom] = useState("");
  const [departureTo, setDepartureTo] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Reservation | null>(null);
  useEffect(() => {
    if (selected) {
      console.log("SELECTED DATA", selected);
    }
  }, [selected]);
  const [openPersonId, setOpenPersonId] = useState<string | null>(null);
  const [previewPassport, setPreviewPassport] = useState<string | null>(null);
  const [passportUploading, setPassportUploading] = useState(false);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [memoDraft, setMemoDraft] = useState("");
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [editPerson, setEditPerson] = useState<ReservationPeople | null>(null);
  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);
  const [personDraft, setPersonDraft] = useState({
    name: "",

    passport_name: "",
    passport_number: "",

    passport_birth: "",
    passport_issue: "",
    passport_expiry: "",

    passport_sex: "",
    passport_nationality: "",
  });

  useEffect(() => {
    void loadReservations();
  }, []);

  async function uploadPersonPassport(person: ReservationPeople, file: File) {
    if (!selected) return;

    setPassportUploading(true);
    const fileExt = file.name.split(".").pop() || "jpg";

    const filePath = `reservation-people/${person.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("passports")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      alert("여권 업로드 실패");
      setPassportUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("passports").getPublicUrl(filePath);
    const { error: updateError } = await supabase
      .from("reservation_people")
      .update({
        passport_image: publicUrl,
      })
      .eq("id", person.id);

    if (updateError) {
      console.error(updateError);
      alert("DB 저장 실패");
      setPassportUploading(false);
      return;
    }
    setPassportUploading(false);

    await loadPeople(selected.id);

    alert("여권이 등록되었습니다.");
  }
  async function savePerson() {
    if (!selected) return;

    if (!personDraft.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    const { data, error } = await supabase
      .from("reservation_people")
      .insert({
        reservation_id: selected.id,
        name: personDraft.name,

        sort_order: selected.people?.length || 0,

        passport_name: personDraft.passport_name || null,
        passport_number: personDraft.passport_number || null,

        passport_birth: personDraft.passport_birth || null,
        passport_issue: personDraft.passport_issue || null,
        passport_expiry: personDraft.passport_expiry || null,

        passport_sex: personDraft.passport_sex || null,
        passport_nationality: personDraft.passport_nationality || null,
      })
      .select()
      .single();

    if (error) {
      console.error("SAVE PERSON ERROR", error);
      alert(error.message);
      return;
    }

    console.log("SAVE PERSON RESULT", data);

    alert("예약자가 추가되었습니다.");

    setShowPersonForm(false);
    await loadPeople(selected.id);
    console.log("AFTER SAVE SELECTED", selected);
    setPersonDraft({
      name: "",

      passport_name: "",
      passport_number: "",

      passport_birth: "",
      passport_issue: "",
      passport_expiry: "",

      passport_sex: "",
      passport_nationality: "",
    });
  }
  async function deletePerson(personId: string) {
    const ok = confirm("예약자를 삭제하시겠습니까?");

    if (!ok) return;

    const { error } = await supabase
      .from("reservation_people")
      .delete()
      .eq("id", personId);

    if (error) {
      console.error("DELETE PERSON ERROR", error);
      alert(error.message);
      return;
    }

    if (selected) {
      await loadPeople(selected.id);
    }
  }
  async function updatePerson() {
    if (!editPerson) return;

    const { data, error } = await supabase
      .from("reservation_people")
      .update({
        name: editPerson.name,

        passport_name: editPerson.passport_name || null,
        passport_number: editPerson.passport_number || null,

        passport_birth: editPerson.passport_birth || null,
        passport_issue: editPerson.passport_issue || null,
        passport_expiry: editPerson.passport_expiry || null,

        passport_sex: editPerson.passport_sex || null,
        passport_nationality: editPerson.passport_nationality || null,
      })
      .eq("id", editPerson.id)
      .select()
      .single();

    if (error) {
      console.error("UPDATE PERSON ERROR", error);
      alert(error.message);
      return;
    }

    console.log("UPDATE PERSON RESULT", data);

    if (selected) {
      await loadPeople(selected.id);
    }

    setEditPerson(null);

    alert("예약자가 수정되었습니다.");
  }

  async function makePrimaryPerson(person: any) {
    if (!selected || !selected.people) return;

    // 현재 예약자들을 정렬
    const people = [...selected.people].sort(
      (a: any, b: any) => (a.sort_order ?? 999) - (b.sort_order ?? 999),
    );

    // 선택한 사람을 맨 앞으로 이동
    const reordered = [
      person,
      ...people.filter((p: any) => p.id !== person.id),
    ];

    // 순서를 0,1,2,3...으로 다시 저장
    for (let i = 0; i < reordered.length; i++) {
      const { error } = await supabase
        .from("reservation_people")
        .update({ sort_order: i })
        .eq("id", reordered[i].id);
      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }
    }
    await supabase
      .from("reservations")
      .update({
        name: person.name,
      })
      .eq("id", selected.id);
    await loadPeople(selected.id);
    await loadReservations();

    alert("대표예약자가 변경되었습니다.");
  }
  async function movePersonUp(person: any) {
    if (!selected?.people) return;

    const people = [...selected.people].sort(
      (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999),
    );

    const currentIndex = people.findIndex((p) => p.id === person.id);

    if (currentIndex <= 0) return;

    const prev = people[currentIndex - 1];

    const currentOrder = person.sort_order ?? currentIndex;
    const prevOrder = prev.sort_order ?? currentIndex - 1;

    await supabase
      .from("reservation_people")
      .update({ sort_order: prevOrder })
      .eq("id", person.id);

    await supabase
      .from("reservation_people")
      .update({ sort_order: currentOrder })
      .eq("id", prev.id);

    await loadPeople(selected.id);
  }

  async function movePersonDown(person: any) {
    if (!selected?.people) return;

    const people = [...selected.people].sort(
      (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999),
    );

    const currentIndex = people.findIndex((p) => p.id === person.id);

    if (currentIndex >= people.length - 1) return;

    const next = people[currentIndex + 1];

    const currentOrder = person.sort_order ?? currentIndex;
    const nextOrder = next.sort_order ?? currentIndex + 1;

    await supabase
      .from("reservation_people")
      .update({ sort_order: nextOrder })
      .eq("id", person.id);

    await supabase
      .from("reservation_people")
      .update({ sort_order: currentOrder })
      .eq("id", next.id);

    await loadPeople(selected.id);
  }
  async function downloadExcel() {
    if (!selected?.people || selected.people.length === 0) {
      alert("등록된 예약자가 없습니다.");
      return;
    }

    const sheetData = [
      ["상품명", selected.product, "", "출발일", selected.departure_date],
      [
        "대표예약자",
        selected.name,
        "",
        "예약인원",
        `${selected.people.length}명`,
      ],
      [],
      [
        "순번",
        "한글이름",
        "영문이름",
        "성별",
        "생년월일",
        "여권번호",
        "국적",
        "발급일",
        "만료일",
      ],
    ];

    selected.people.forEach((person, index) => {
      sheetData.push([
        String(index + 1),
        person.name ?? "",
        person.passport_name ?? "",
        person.passport_sex ?? "",
        person.passport_birth ?? "",
        person.passport_number ?? "",
        person.passport_nationality ?? "",
        person.passport_issue ?? "",
        person.passport_expiry ?? "",
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet["!cols"] = [
      { wch: 18 }, // 순번
      { wch: 28 }, // 이름
      { wch: 20 }, // 영문명
      { wch: 16 }, // 성별
      { wch: 18 }, // 생년월일
      { wch: 22 }, // 여권번호
      { wch: 18 }, // 국적
      { wch: 18 }, // 발급일
      { wch: 18 }, // 만료일
    ];
    worksheet["!rows"] = [
      { hpt: 24 }, // 상품명
      { hpt: 24 }, // 출발일
      { hpt: 24 }, // 대표예약자
      { hpt: 24 }, // 예약인원
      { hpt: 10 }, // 빈줄
      { hpt: 28 }, // 헤더
    ];

    Object.keys(worksheet).forEach((cell) => {
      if (!cell.startsWith("!")) {
        worksheet[cell].s = {
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: false,
          },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } },
          },
        };
      }
    });

    for (let i = 0; i < 9; i++) {
      const cell = XLSX.utils.encode_cell({
        r: 3,
        c: i,
      });
      ["A1", "A2", "A3", "A4"].forEach((cell) => {
        if (worksheet[cell]) {
          worksheet[cell].s = {
            ...worksheet[cell].s,
            font: {
              bold: true,
              color: { rgb: "FFFFFF" },
            },
            fill: {
              fgColor: { rgb: "4F81BD" },
            },
          };
        }
      });

      ["B1", "B2", "B3", "B4"].forEach((cell) => {
        if (worksheet[cell]) {
          worksheet[cell].s = {
            ...worksheet[cell].s,
            font: {
              bold: true,
            },
            fill: {
              fgColor: { rgb: "EAF2F8" },
            },
          };
        }
      });
      if (worksheet[cell]) {
        worksheet[cell].s = {
          ...worksheet[cell].s,
          font: {
            bold: true,
            color: { rgb: "FFFFFF" },
          },
          fill: {
            fgColor: { rgb: "1F4E78" },
          },
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: false,
          },
        };
      }
    }

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "예약자명단");

    XLSX.writeFile(
      workbook,
      `${selected.product}_${selected.departure_date}_예약자명단.xlsx`,
    );
  }
  async function loadPeople(reservationId: string) {
    const { data, error } = await supabase
      .from("reservation_people")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("LOAD PEOPLE ERROR", error);
      return;
    }

    setSelected((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        people: data || [],
      };
    });
  }
  async function loadReservations() {
    console.log("1. loadReservations 시작");

    setLoading(true);

    try {
      console.log("2. Supabase 요청 전");

      const { data, error } = await supabase.from("reservations").select("*");

      console.log("3. Supabase 응답 완료", { data, error });

      if (error) {
        console.error("RESERVATIONS ERROR", error);
        alert(error.message);
        setList([]);
        return;
      }

      setList((data as Reservation[]) || []);
    } catch (error) {
      console.error("LOAD RESERVATIONS CATCH", error);
      alert("예약 목록을 불러오지 못했습니다.");
    } finally {
      console.log("4. loading 종료");
      setLoading(false);
    }
  }

  function patchReservation(id: string, patch: Partial<Reservation>) {
    setList((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );

    setSelected((current) =>
      current?.id === id ? { ...current, ...patch } : current,
    );
  }

  async function updateStatus(id: string, status: string) {
    const previous = list.find((item) => item.id === id)?.status || "대기";

    patchReservation(id, { status });
    setSavingId(id);

    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);

    setSavingId(null);

    if (error) {
      patchReservation(id, { status: previous });
      alert(error.message);
    }
  }

  async function saveMemo() {
    if (!selected) return;

    setSavingId(selected.id);

    const { error } = await supabase
      .from("reservations")
      .update({ memo: memoDraft.trim() })
      .eq("id", selected.id);

    setSavingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    patchReservation(selected.id, { memo: memoDraft.trim() });
    alert("관리자 메모가 저장되었습니다.");
  }

  async function savePassportInfo() {
    if (!selected) return;

    console.log("SAVE DATA", {
      name: selected.passport_name,
      number: selected.passport_number,
      birth: selected.passport_birth,
      expiry: selected.passport_expiry,
    });

    const { data, error } = await supabase
      .from("reservations")
      .update({
        passport_name: selected.passport_name,
        passport_number: selected.passport_number,
        passport_birth: selected.passport_birth,
        passport_expiry: selected.passport_expiry,
      })
      .eq("id", selected.id)
      .select();
    console.log("SAVE RESULT", data);

    if (error) {
      console.error("SAVE ERROR DETAIL", JSON.stringify(error, null, 2));

      alert(error.message);
      return;
    }
    alert("여권 정보 저장 완료");
  }
  async function remove(id: string) {
    if (!confirm("예약 내역을 삭제하시겠습니까?")) return;

    setDeletingId(id);

    const { error } = await supabase.from("reservations").delete().eq("id", id);

    setDeletingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    setList((current) => current.filter((item) => item.id !== id));

    if (selected?.id === id) {
      setSelected(null);
    }
  }

  async function openDetail(item: Reservation) {
    setSelected(item);
    setMemoDraft(item.memo || "");
    await loadPeople(item.id);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("전체");
    setDepartureFrom("");
    setDepartureTo("");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(1);
  }

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return list.filter((item) => {
      const searchable = [
        item.name,
        item.phone,
        item.product,
        item.message,
        item.memo || "",
      ]
        .join(" ")
        .toLowerCase();

      if (keyword && !searchable.includes(keyword)) return false;
      if (statusFilter !== "전체" && item.status !== statusFilter) return false;

      const departureDate = toDateInputValue(item.departure_date);
      const createdDate = toDateInputValue(item.created_at);

      if (departureFrom && departureDate < departureFrom) return false;
      if (departureTo && departureDate > departureTo) return false;
      if (createdFrom && createdDate < createdFrom) return false;
      if (createdTo && createdDate > createdTo) return false;

      return true;
    });
  }, [
    list,
    search,
    statusFilter,
    departureFrom,
    departureTo,
    createdFrom,
    createdTo,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    departureFrom,
    departureTo,
    createdFrom,
    createdTo,
  ]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = toDateInputValue(now.toISOString());

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    return {
      total: list.length,
      today: list.filter((item) => toDateInputValue(item.created_at) === today)
        .length,
      week: list.filter(
        (item) => new Date(item.created_at).getTime() >= startOfWeek.getTime(),
      ).length,
      consulting: list.filter((item) => item.status === "상담중").length,
    };
  }, [list]);
  async function uploadPassport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !selected) return;

    try {
      setPassportUploading(true);

      const fileExt = file.name.split(".").pop();

      const fileName = `${selected.id}-${Date.now()}.${fileExt}`;

      const filePath = `passports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("passports")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("passports")
        .getPublicUrl(filePath);

      await supabase
        .from("reservations")
        .update({
          passport_image: data.publicUrl,

          ocr_status: "대기",
        })
        .eq("id", selected.id);

      setSelected({
        ...selected,

        passport_image: data.publicUrl,

        ocr_status: "대기",
      });

      alert("여권 이미지 업로드 완료");
    } catch (error) {
      console.error(error);

      alert("여권 업로드 실패");
    } finally {
      setPassportUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white px-8 py-6 text-gray-600 shadow">
          예약 내역을 불러오는 중입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="mx-auto max-w-[1600px] p-5 sm:p-7 lg:p-10">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f172a] text-xl text-white">
                ✈
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900">
                  예약 관리 센터
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  청주공항 출발 여행상품 예약 및 상담 관리 시스템
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void loadReservations()}
              className="
          rounded-xl border border-gray-200 
          bg-white px-5 py-3
          text-sm font-bold text-gray-700
          shadow-sm transition
          hover:bg-gray-50
          "
            >
              🔄 새로고침
            </button>
          </div>
        </div>

        <div className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="전체 예약" value={stats.total} />

          <StatCard label="오늘 신규 접수" value={stats.today} />

          <StatCard label="이번 주 접수" value={stats.week} />

          <StatCard label="상담 진행중" value={stats.consulting} />
        </div>

        <div className="mb-7 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900">예약 검색</h2>

              <p className="mt-1 text-sm text-gray-500">
                고객명, 상품명, 출발일 기준으로 검색할 수 있습니다.
              </p>
            </div>

            <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700">
              검색 결과 {filtered.length}건
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <label className="xl:col-span-2">
              <span className="mb-2 block text-sm font-bold text-gray-700">
                🔎 통합 검색
              </span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="예약자 / 연락처 / 상품 / 문의"
                className="
           w-full rounded-xl
           border border-gray-200
           bg-gray-50
           px-4 py-3
           outline-none
           transition
           focus:border-gray-900
           focus:bg-white
           "
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-gray-700">
                예약 상태
              </span>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="
           w-full rounded-xl
           border border-gray-200
           bg-gray-50
           px-4 py-3
           outline-none
           "
              >
                <option value="전체">전체</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-gray-700">
                출발 시작
              </span>

              <input
                type="date"
                value={departureFrom}
                onChange={(event) => setDepartureFrom(event.target.value)}
                className="
           w-full rounded-xl
           border border-gray-200
           bg-gray-50
           px-4 py-3
           "
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-gray-700">
                출발 종료
              </span>

              <input
                type="date"
                value={departureTo}
                onChange={(event) => setDepartureTo(event.target.value)}
                className="
           w-full rounded-xl
           border border-gray-200
           bg-gray-50
           px-4 py-3
           "
              />
            </label>
          </div>

          <div className="mt-4 flex justify-between">
            <div className="text-sm text-gray-500">
              접수일 필터와 출발일 필터를 함께 사용할 수 있습니다.
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="
          rounded-xl
          border border-gray-200
          bg-gray-50
          px-5 py-2.5
          text-sm font-bold
          text-gray-700
          hover:bg-gray-100
          "
            >
              초기화
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1450px] w-full">
              <thead className="bg-[#f8fafc] text-sm text-gray-600">
                <tr>
                  <th className="px-4 py-4 text-center">번호</th>
                  <th className="px-4 py-4 text-left">이름</th>
                  <th className="px-4 py-4 text-left">연락처</th>
                  <th className="px-4 py-4 text-left">상품</th>
                  <th className="px-4 py-4 text-left">출발일</th>
                  <th className="px-4 py-4 text-left">접수일</th>
                  <th className="px-4 py-4 text-left">문의내용</th>
                  <th className="px-4 py-4 text-left">상태</th>
                  <th className="px-4 py-4 text-center">관리</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((item) => (
                  <tr
                    key={item.id}
                    className="
                   border-t border-gray-100
                   text-sm
                   transition
                   hover:bg-blue-50/40
                   "
                  >
                    <td className="px-4 py-4 text-center text-gray-500">
                      #{item.id.slice(0, 6)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900">
                      {item.name || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <a
                        href={`tel:${item.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.phone || "-"}
                      </a>
                    </td>

                    <td className="max-w-[260px] px-4 py-4">
                      <div
                        className="
    font-bold
    text-gray-900
    truncate
    "
                        title={item.product}
                      >
                        ✈ {item.product || "-"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className="
    rounded-full
    bg-blue-50
    px-3
    py-1.5
    text-sm
    font-bold
    text-blue-700
    "
                      >
                        {formatDate(item.departure_date)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                      {formatDateTime(item.created_at)}
                    </td>

                    <td className="max-w-[300px] px-4 py-4">
                      <button
                        type="button"
                        onClick={() => void openDetail(item)}
                        className="block w-full truncate text-left text-gray-700 hover:text-black hover:underline"
                        title={item.message}
                      >
                        {item.message || "문의내용 없음"}
                      </button>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <select
                        value={item.status || "대기"}
                        disabled={savingId === item.id}
                        onChange={(event) =>
                          void updateStatus(item.id, event.target.value)
                        }
                        className={`rounded-full border px-3 py-2 text-sm font-semibold outline-none ${statusClass(
                          item.status || "대기",
                        )}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => void openDetail(item)}
                          className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                        >
                          상세
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => void remove(item.id)}
                          className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === item.id ? "삭제중" : "삭제"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-16 text-center text-gray-500"
                    >
                      조건에 맞는 예약 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              총 {filtered.length}건 · {safePage}/{totalPages} 페이지
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (pageNumber) =>
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - safePage) <= 2,
                )
                .map((pageNumber, index, visiblePages) => {
                  const previous = visiblePages[index - 1];
                  const showGap = previous && pageNumber - previous > 1;

                  return (
                    <span key={pageNumber} className="flex items-center gap-2">
                      {showGap && <span className="text-gray-400">...</span>}
                      <button
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${
                          safePage === pageNumber
                            ? "bg-gray-900 text-white"
                            : "border border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </span>
                  );
                })}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="
          fixed inset-0 z-50
          flex items-center justify-center
          bg-black/50
          p-4
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div
            className="
            max-h-[92vh]
            w-full
            max-w-3xl
            overflow-y-auto
            rounded-3xl
            bg-white
            shadow-2xl
            "
          >
            {/* HEADER */}

            <div
              className="
              flex items-center justify-between
              border-b
              px-7 py-6
              "
            >
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  ✈ 예약 상세
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  접수일 {formatDateTime(selected.created_at)}
                </p>
              </div>
            </div>

            <div className="space-y-6 p-7">
              {/* 고객 정보 */}
              <div
                className="
                rounded-2xl
                bg-gray-50
                p-6
                "
              >
                <h3 className="mb-5 font-black text-gray-900">👤 고객 정보</h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Detail label="예약자" value={selected.name} />

                  <Detail label="연락처" value={selected.phone} />
                </div>

                <div className="mt-5 flex gap-3">
                  <a
                    href={`tel:${selected.phone}`}
                    className="
                    rounded-xl
                    bg-green-600
                    px-5 py-3
                    text-sm
                    font-bold
                    text-white
                    "
                  >
                    📞 전화하기
                  </a>

                  <a
                    href="#"
                    className="
                    rounded-xl
                    bg-yellow-400
                    px-5 py-3
                    text-sm
                    font-bold
                    text-black
                    "
                  >
                    💬 카카오 상담
                  </a>
                </div>
              </div>
              <div className="mt-6 rounded-xl border p-5">
                <h3 className="mb-4 font-bold">👥 예약자 명단 관리</h3>

                <button
                  type="button"
                  onClick={() => setShowPersonForm(true)}
                  className="
    rounded-lg
    bg-blue-600
    px-4
    py-2
    text-white
    font-bold
    "
                >
                  + 예약자 추가
                </button>
                {selected.people && selected.people.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {selected.people.map((person, index) => (
                      <div
                        key={person.id}
                        className="
          rounded-xl
          border
          bg-white
          p-4
        "
                      >
                        <div
                          className="
    mb-3
    flex
    cursor-pointer
    items-center
    justify-between
    rounded-lg
    bg-gray-100
    p-3
  "
                          onClick={() =>
                            setOpenPersonId(
                              openPersonId === person.id ? null : person.id,
                            )
                          }
                        >
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                                대표예약자
                              </span>
                            )}

                            <div className="font-bold">{person.name}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => makePrimaryPerson(person)}
                                className="
        rounded-full
        bg-indigo-600
        px-2
        py-0.5
        text-xs
        font-bold
        text-white
      "
                              >
                                👑 대표로 변경
                              </button>
                            )}
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => void movePersonUp(person)}
                                className="
      rounded-full
      bg-gray-600
      px-2
      py-0.5
      text-xs
      font-bold
      text-white
    "
                              >
                                ▲
                              </button>
                            )}

                            {index < (selected.people?.length ?? 0) - 1 && (
                              <button
                                type="button"
                                onClick={() => void movePersonDown(person)}
                                className="
      rounded-full
      bg-gray-600
      px-2
      py-0.5
      text-xs
      font-bold
      text-white
    "
                              >
                                ▼
                              </button>
                            )}
                            <span
                              className={
                                person.passport_image
                                  ? "rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white"
                                  : "rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-white"
                              }
                            >
                              {person.passport_image ? "여권등록" : "미등록"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                          <div>
                            <div className="text-xs text-gray-500">
                              한글이름
                            </div>
                            <div className="font-semibold">
                              {person.name || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">
                              영문이름
                            </div>
                            <div className="font-semibold">
                              {person.passport_name || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">성별</div>
                            <div className="font-semibold">
                              {person.passport_sex || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">
                              생년월일
                            </div>
                            <div className="font-semibold">
                              {person.passport_birth || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">
                              여권번호
                            </div>
                            <div className="font-semibold">
                              {person.passport_number || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">국적</div>
                            <div className="font-semibold">
                              {person.passport_nationality || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">발급일</div>
                            <div className="font-semibold">
                              {person.passport_issue || "-"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">만료일</div>
                            <div className="font-semibold">
                              {person.passport_expiry || "-"}
                            </div>
                          </div>
                        </div>

                        {person.passport_image && (
                          <div className="mt-3">
                            <img
                              src={person.passport_image}
                              alt="여권"
                              className="w-48 rounded-lg border"
                            />
                          </div>
                        )}
                        <label
                          className="
    mt-3
    mr-2
    inline-block
    cursor-pointer
    rounded-lg
    bg-green-600
    px-3
    py-1
    text-sm
    font-bold
    text-white
  "
                        >
                          여권 등록
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];

                              if (!file) return;

                              void uploadPersonPassport(person, file);

                              e.target.value = "";
                            }}
                          />
                        </label>
                        {person.passport_image && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPassport(person.passport_image)
                            }
                            className="
      mt-3
      mr-2
      rounded-lg
      bg-indigo-600
      px-3
      py-1
      text-sm
      font-bold
      text-white
      hover:bg-indigo-700
    "
                          >
                            👁 여권보기
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditPerson(person);
                          }}
                          className="
    mt-3
    mr-2
    rounded-lg
    bg-blue-500
    px-3
    py-1
    text-sm
    font-bold
    text-white
  "
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (index === 0) {
                              alert(
                                "대표예약자는 삭제할 수 없습니다.\n\n다른 예약자를 대표예약자로 변경한 후 삭제해주세요.",
                              );

                              return;
                            }

                            deletePerson(person.id);
                          }}
                          className="
    mt-3
    rounded-lg
    bg-red-500
    px-3
    py-1
    text-sm
    font-bold
    text-white
  "
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-400">
                    등록된 예약자가 없습니다.
                  </div>
                )}
                {showPersonForm && (
                  <div className="mt-5 rounded-xl bg-gray-50 p-5">
                    <div className="mb-3">
                      <label className="block mb-1 font-bold">이름</label>

                      <input
                        className="
        w-full
        rounded-lg
        border
        px-3 py-2
        "
                        value={personDraft.name}
                        onChange={(e) =>
                          setPersonDraft({
                            ...personDraft,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-1 font-bold">영문명</label>

                      <input
                        className="
        w-full
        rounded-lg
        border
        px-3 py-2
        "
                        value={personDraft.passport_name}
                        onChange={(e) =>
                          setPersonDraft({
                            ...personDraft,
                            passport_name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-1 font-bold">여권번호</label>

                      <input
                        className="
        w-full
        rounded-lg
        border
        px-3 py-2
        "
                        value={personDraft.passport_number}
                        onChange={(e) =>
                          setPersonDraft({
                            ...personDraft,
                            passport_number: e.target.value,
                          })
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={savePerson}
                      className="
  mr-3
  rounded-lg
  bg-blue-600
  px-4 py-2
  text-white
  font-bold
  "
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPersonForm(false)}
                      className="
      rounded-lg
      border
      px-4 py-2
      "
                    >
                      취소
                    </button>
                  </div>
                )}
                {editPerson && (
                  <div className="mt-5 rounded-xl bg-blue-50 p-5">
                    <div className="mb-3 font-bold">예약자 수정</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                          한글 이름
                        </label>

                        <input
                          className="
      w-full
      rounded-lg
      border
      px-3
      py-2
      "
                          value={editPerson.name}
                          onChange={(e) =>
                            setEditPerson({
                              ...editPerson,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                          영문 이름
                        </label>

                        <input
                          className="
      w-full
      rounded-lg
      border
      px-3
      py-2
    "
                          value={editPerson.passport_name || ""}
                          onChange={(e) =>
                            setEditPerson({
                              ...editPerson,
                              passport_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                          성별
                        </label>

                        <input
                          className="
      w-full
      rounded-lg
      border
      px-3
      py-2
    "
                          value={editPerson.passport_sex || ""}
                          onChange={(e) =>
                            setEditPerson({
                              ...editPerson,
                              passport_sex: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                          생년월일
                        </label>

                        <input
                          type="date"
                          className="
      w-full
      rounded-lg
      border
      px-3
      py-2
    "
                          value={editPerson.passport_birth || ""}
                          onChange={(e) =>
                            setEditPerson({
                              ...editPerson,
                              passport_birth: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                          여권번호
                        </label>
                        <input
                          className="
      w-full
      rounded-lg
      border
      px-3
      py-2
      "
                          value={editPerson.passport_number || ""}
                          onChange={(e) =>
                            setEditPerson({
                              ...editPerson,
                              passport_number: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                          국적
                        </label>

                        <input
                          className="
      w-full
      rounded-lg
      border
      px-3
      py-2
    "
                          value={editPerson.passport_nationality || ""}
                          onChange={(e) =>
                            setEditPerson({
                              ...editPerson,
                              passport_nationality: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                          발급일
                        </label>

                        <input
                          type="date"
                          className="
      w-full
      rounded-lg
      border
      px-3
      py-2
    "
                          value={editPerson.passport_issue || ""}
                          onChange={(e) =>
                            setEditPerson({
                              ...editPerson,
                              passport_issue: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                          만료일
                        </label>

                        <input
                          type="date"
                          className="
      w-full
      rounded-lg
      border
      px-3
      py-2
    "
                          value={editPerson.passport_expiry || ""}
                          onChange={(e) =>
                            setEditPerson({
                              ...editPerson,
                              passport_expiry: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={updatePerson}
                        className="
        rounded-lg
        bg-blue-600
        px-4
        py-2
        font-bold
        text-white
        "
                      >
                        저장
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditPerson(null)}
                        className="
        rounded-lg
        border
        px-4
        py-2
        font-bold
        "
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* 여행 정보 */}

              <div
                className="
                rounded-2xl
                border
                p-6
                "
              >
                <h3 className="mb-5 font-black text-gray-900">✈ 여행 정보</h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Detail label="상품" value={selected.product} />

                  <Detail
                    label="출발일"
                    value={formatDate(selected.departure_date)}
                  />
                </div>

                <div className="mt-5">
                  <label
                    className="
                    mb-2 block
                    text-sm font-black
                    "
                  >
                    예약 상태
                  </label>

                  <select
                    value={selected.status || "대기"}
                    onChange={(event) =>
                      void updateStatus(selected.id, event.target.value)
                    }
                    className={`
                    rounded-full
                    border
                    px-5 py-2.5
                    font-bold
                    ${statusClass(selected.status || "대기")}
                   `}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 문의내용 */}

              <div>
                <h3 className="mb-3 font-black text-gray-900">📝 고객 문의</h3>

                <div
                  className="
                  min-h-32
                  rounded-2xl
                  border
                  p-5
                  text-sm
                  leading-7
                  text-gray-700
                  "
                >
                  {selected.message || "문의내용 없음"}
                </div>
              </div>

              {/* 메모 */}

              <div>
                <label
                  className="
                  mb-3 block
                  font-black
                  text-gray-900
                  "
                >
                  📌 상담 메모
                </label>

                <textarea
                  id="reservation-admin-memo"
                  value={memoDraft}
                  onChange={(event) => setMemoDraft(event.target.value)}
                  placeholder={`예)
07/14 전화 상담
- 여권 확인 완료
- 2명 예약 예정
- 입금 대기
- 고객 요청사항 입력`}
                  rows={8}
                  className="
w-full
resize-y
rounded-2xl
border
border-gray-200
bg-gray-50
p-5
text-sm
leading-7
outline-none
transition
focus:border-gray-900
focus:bg-white
"
                />
              </div>

              <div
                className="
                flex justify-end gap-3
                "
              >
                <button
                  type="button"
                  onClick={() => void savePassportInfo()}
                  className="
  rounded-xl
  bg-blue-600
  px-6 py-3
  text-white
  "
                >
                  여권 정보 저장
                </button>

                <button
                  type="button"
                  onClick={() => void saveMemo()}
                  disabled={savingId === selected.id}
                  className="
                  rounded-xl
                  bg-gray-900
                  px-6 py-3
                  text-white
                  font-bold
                  "
                >
                  {savingId === selected.id ? "저장중..." : "메모 저장"}
                </button>
                <button
                  type="button"
                  onClick={() => void downloadExcel()}
                  className="
    rounded-xl
    bg-emerald-600
    px-5
    py-3
    text-sm
    font-bold
    text-white
    hover:bg-emerald-700
  "
                >
                  📥 엑셀 다운로드
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="
                  rounded-xl
                  border
                  px-6 py-3
                  font-bold
                  "
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {previewPassport && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewPassport(null)}
        >
          <div
            className="relative max-h-[95vh] max-w-[95vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewPassport(null)}
              className="
          absolute
          -top-4
          -right-4
          rounded-full
          bg-white
          px-3
          py-2
          text-lg
          font-bold
          shadow-lg
        "
            >
              ✕
            </button>

            <img
              src={previewPassport}
              alt="여권"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="
      rounded-3xl
      bg-white
      p-6
      shadow-sm
      border border-gray-100
      transition
      hover:-translate-y-1
      hover:shadow-lg
      "
    >
      <p className="text-sm font-semibold text-gray-500">{label}</p>

      <div className="mt-4 flex items-end justify-between">
        <p className="text-4xl font-black text-gray-900">
          {value.toLocaleString()}
        </p>

        <div
          className="
          flex h-10 w-10
          items-center justify-center
          rounded-full
          bg-gray-100
          text-lg
          "
        >
          📌
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}
