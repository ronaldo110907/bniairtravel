"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx-js-style";

type DepartureGroup = {
  key: string;
  departureId: string | null;
  departureDate: string;
  product: string;
  reservationCount: number;
  peopleCount: number;
};

type NameTagPerson = {
  id: string;
  name: string;
  passportLastName: string;
  passportFirstName: string;
};

const ITEMS_PER_PAGE = 10;

export default function XiamenNameTagButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<DepartureGroup[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<DepartureGroup | null>(
    null,
  );

  const [people, setPeople] = useState<NameTagPerson[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const totalPages = Math.max(1, Math.ceil(people.length / ITEMS_PER_PAGE));

  const previewPeople = useMemo(() => {
    const start = (previewPage - 1) * ITEMS_PER_PAGE;
    return people.slice(start, start + ITEMS_PER_PAGE);
  }, [people, previewPage]);

  function formatEnglishName(person: NameTagPerson) {
    const last = person.passportLastName.trim();
    const first = person.passportFirstName.trim();

    if (!last && !first) return "";

    if (last && first) {
      return `${last}/${first}`.toUpperCase();
    }

    return (last || first).toUpperCase();
  }
  function makeSafeFileName(value: string) {
    return value
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "_")
      .trim();
  }

  function getNameStyle(text: string) {
    const length = text.replace(/\s/g, "").length;

    if (length >= 18) {
      return {
        className: "text-[11px]",
        warning: true,
      };
    }

    if (length >= 14) {
      return {
        className: "text-xs",
        warning: true,
      };
    }

    if (length >= 10) {
      return {
        className: "text-sm",
        warning: false,
      };
    }

    return {
      className: "text-base",
      warning: false,
    };
  }

  async function openModal() {
    setOpen(true);
    setLoading(true);
    setSelectedGroup(null);
    setPeople([]);
    setPreviewPage(1);

    try {
      const today = new Date();
      const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      const { data: reservations, error: reservationError } = await supabase
        .from("reservations")
        .select("id, product, departure_id, departure_date, status")
        .neq("status", "취소")
        .gte("departure_date", todayString)
        .order("departure_date", { ascending: true });

      if (reservationError) {
        throw reservationError;
      }

      const reservationIds = (reservations ?? []).map((item) => item.id);

      let peopleData: {
        id: string;
        reservation_id: string;
        is_guide: boolean;
      }[] = [];

      if (reservationIds.length > 0) {
        const { data, error: peopleError } = await supabase
          .from("reservation_people")
          .select("id, reservation_id, is_guide")
          .in("reservation_id", reservationIds);

        if (peopleError) {
          throw peopleError;
        }

        peopleData = data ?? [];
      }

      const map = new Map<string, DepartureGroup>();

      for (const reservation of reservations ?? []) {
        const departureDate = reservation.departure_date ?? "";
        const product = reservation.product ?? "상품명 없음";

        const key = reservation.departure_id || `${departureDate}__${product}`;

        const peopleCount = peopleData.filter(
          (person) =>
            String(person.reservation_id) === String(reservation.id) &&
            !person.is_guide,
        ).length;

        const existing = map.get(key);

        if (existing) {
          existing.reservationCount += 1;
          existing.peopleCount += peopleCount;
        } else {
          map.set(key, {
            key,
            departureId: reservation.departure_id ?? null,
            departureDate,
            product,
            reservationCount: 1,
            peopleCount,
          });
        }
      }

      const result = Array.from(map.values()).sort((a, b) =>
        a.departureDate.localeCompare(b.departureDate),
      );

      setGroups(result);
    } catch (error) {
      console.error("NAMETAG DEPARTURE LOAD ERROR", error);
      alert("네임택 출발일 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function selectDeparture(group: DepartureGroup) {
    setSelectedGroup(group);
    setPeopleLoading(true);
    setPeople([]);
    setPreviewPage(1);

    try {
      let reservationQuery = supabase
        .from("reservations")
        .select("id")
        .neq("status", "취소");

      if (group.departureId) {
        reservationQuery = reservationQuery.eq(
          "departure_id",
          group.departureId,
        );
      } else {
        reservationQuery = reservationQuery
          .eq("departure_date", group.departureDate)
          .eq("product", group.product);
      }

      const { data: reservations, error: reservationError } =
        await reservationQuery;

      if (reservationError) {
        throw reservationError;
      }

      const reservationIds = (reservations ?? []).map((item) => item.id);

      if (reservationIds.length === 0) {
        setPeople([]);
        return;
      }

      const { data, error: peopleError } = await supabase
        .from("reservation_people")
        .select(
          `
          id,
          reservation_id,
          name,
          passport_last_name,
          passport_first_name,
          sort_order,
          is_guide
        `,
        )
        .in("reservation_id", reservationIds)
        .eq("is_guide", false)
        .order("sort_order", { ascending: true });

      if (peopleError) {
        throw peopleError;
      }

      const cleaned = (data ?? [])
        .filter((person) => {
          const name = person.name?.trim() ?? "";

          if (!name) return false;

          if (/^예약자\s*\d+$/i.test(name)) {
            return false;
          }

          return true;
        })
        .map((person) => ({
          id: person.id,
          name: person.name ?? "",
          passportLastName: person.passport_last_name ?? "",
          passportFirstName: person.passport_first_name ?? "",
        }));

      setPeople(cleaned);
    } catch (error) {
      console.error("NAMETAG PEOPLE LOAD ERROR", error);
      alert("네임택 명단을 불러오지 못했습니다.");
    } finally {
      setPeopleLoading(false);
    }
  }

  async function generatePdf() {
    if (!selectedGroup) {
      alert("출발일을 먼저 선택해주세요.");
      return;
    }

    if (people.length === 0) {
      alert("출력할 예약자가 없습니다.");
      return;
    }

    if (pdfGenerating) return;

    setPdfGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pages = Math.ceil(people.length / ITEMS_PER_PAGE);

      for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage("a4", "portrait");
        }

        const pagePeople = people.slice(
          pageIndex * ITEMS_PER_PAGE,
          pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
        );

        const printPage = document.createElement("div");

        printPage.style.position = "fixed";
        printPage.style.left = "-10000px";
        printPage.style.top = "0";
        printPage.style.width = "210mm";
        printPage.style.height = "297mm";
        printPage.style.background = "#ffffff";
        printPage.style.fontFamily =
          '"Malgun Gothic", "맑은 고딕", Arial, sans-serif';

        document.body.appendChild(printPage);

        for (let index = 0; index < 10; index++) {
          const person = pagePeople[index];

          const row = Math.floor(index / 2);
          const column = index % 2;

          const label = document.createElement("div");

          label.style.position = "absolute";
          label.style.width = "88.9mm";
          label.style.height = "52mm";

          label.style.left = column === 0 ? "12mm" : "109.1mm";

          label.style.top = `${18.5 + row * 52}mm`;

          label.style.display = "flex";
          label.style.flexDirection = "column";
          label.style.alignItems = "center";
          label.style.justifyContent = "center";

          label.style.boxSizing = "border-box";
          label.style.overflow = "hidden";
          label.style.whiteSpace = "nowrap";

          if (person) {
            const koreanName = document.createElement("div");

            koreanName.textContent = person.name;
            koreanName.style.fontWeight = "800";
            koreanName.style.lineHeight = "1.15";
            koreanName.style.textAlign = "center";

            if (person.name.length >= 8) {
              koreanName.style.fontSize = "22px";
            } else if (person.name.length >= 6) {
              koreanName.style.fontSize = "26px";
            } else {
              koreanName.style.fontSize = "32px";
            }

            const englishName = formatEnglishName(person);

            const english = document.createElement("div");

            english.textContent = englishName || "영문명 미등록";

            english.style.marginTop = "8px";
            english.style.fontWeight = "700";
            english.style.lineHeight = "1.1";
            english.style.textAlign = "center";
            english.style.letterSpacing = "0.5px";

            const englishLength = englishName.replace(/\s/g, "").length;

            if (englishLength >= 20) {
              english.style.fontSize = "14px";
            } else if (englishLength >= 16) {
              english.style.fontSize = "16px";
            } else if (englishLength >= 12) {
              english.style.fontSize = "18px";
            } else {
              english.style.fontSize = "21px";
            }

            label.appendChild(koreanName);
            label.appendChild(english);
          }

          printPage.appendChild(label);
        }

        const canvas = await html2canvas(printPage, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
        });

        const imageData = canvas.toDataURL("image/jpeg", 0.98);

        pdf.addImage(imageData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

        document.body.removeChild(printPage);
      }

      const safeProductName = makeSafeFileName(selectedGroup.product);

      const fileName =
        `${selectedGroup.departureDate}_` + `${safeProductName}_네임택.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("NAMETAG PDF ERROR", error);

      alert("네임택 PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setPdfGenerating(false);
    }
  }

  function generateExcel() {
    if (!selectedGroup) {
      alert("출발일을 먼저 선택해주세요.");
      return;
    }

    if (people.length === 0) {
      alert("출력할 예약자가 없습니다.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    const totalPages = Math.ceil(people.length / ITEMS_PER_PAGE);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pagePeople = people.slice(
        pageIndex * ITEMS_PER_PAGE,
        pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
      );

      const sheetData: string[][] = [];

      for (let row = 0; row < 5; row++) {
        const leftPerson = pagePeople[row * 2];
        const rightPerson = pagePeople[row * 2 + 1];

        const leftText = leftPerson
          ? `${leftPerson.name}\n${formatEnglishName(leftPerson)}`
          : "";

        const rightText = rightPerson
          ? `${rightPerson.name}\n${formatEnglishName(rightPerson)}`
          : "";

        sheetData.push([leftText, "", rightText]);
      }

      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // V3250 : 좌측 라벨 / 중앙 간격 / 우측 라벨
      worksheet["!cols"] = [{ wch: 47 }, { wch: 4.5 }, { wch: 47 }];

      // 52mm ≒ 147.4pt
      worksheet["!rows"] = Array.from({ length: 5 }, () => ({
        hpt: 147.4,
      }));

      for (let row = 0; row < 5; row++) {
        for (const col of [0, 2]) {
          const address = XLSX.utils.encode_cell({
            r: row,
            c: col,
          });

          if (!worksheet[address]) continue;

          const value = String(worksheet[address].v || "");

          const englishName = value.split("\n")[1] || "";

          let fontSize = 22;

          if (englishName.length >= 20) {
            fontSize = 14;
          } else if (englishName.length >= 16) {
            fontSize = 16;
          } else if (englishName.length >= 12) {
            fontSize = 18;
          }

          worksheet[address].s = {
            font: {
              name: "맑은 고딕",
              sz: fontSize,
              bold: true,
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            },
          };
        }
      }

      worksheet["!margins"] = {
        left: 12 / 25.4,
        right: 12 / 25.4,
        top: 18.5 / 25.4,
        bottom: 18.5 / 25.4,
        header: 0,
        footer: 0,
      };

      worksheet["!pageSetup"] = {
        paperSize: 9,
        orientation: "portrait",
        scale: 100,
        fitToWidth: 1,
        fitToHeight: 0,
      };

      worksheet["!printArea"] = "A1:C5";

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        totalPages === 1 ? "네임택" : `네임택${pageIndex + 1}`,
      );
    }

    const safeProductName = makeSafeFileName(selectedGroup.product);

    const fileName =
      `${selectedGroup.departureDate}_` + `${safeProductName}_네임택.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  function closeModal() {
    setOpen(false);
    setSelectedGroup(null);
    setPeople([]);
    setPreviewPage(1);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="
          rounded-xl bg-blue-600 px-4 py-3
          text-sm font-bold text-white shadow-lg
          transition hover:bg-blue-700
        "
      >
        🏷️ 네임택 출력
      </button>

      {open && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-6 w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  🏷️ 네임택 출력
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedGroup
                    ? "출력 전 네임택을 확인해주세요."
                    : "출발일을 선택해주세요."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {!selectedGroup ? (
              <div className="mt-5 max-h-[65vh] space-y-2 overflow-y-auto">
                {loading ? (
                  <div className="py-12 text-center text-sm font-semibold text-gray-500">
                    출발일을 불러오는 중입니다...
                  </div>
                ) : groups.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    출력할 예약이 없습니다.
                  </div>
                ) : (
                  groups.map((group) => (
                    <button
                      key={group.key}
                      type="button"
                      onClick={() => selectDeparture(group)}
                      className="
                        w-full rounded-2xl border border-gray-200
                        px-4 py-4 text-left transition
                        hover:border-blue-300 hover:bg-blue-50
                      "
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-black text-gray-900">
                            {group.departureDate}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {group.product}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-lg font-black text-blue-600">
                            {group.peopleCount}명
                          </p>

                          <p className="text-xs text-gray-400">
                            예약 {group.reservationCount}건
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="mt-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="font-black text-gray-900">
                      {selectedGroup.departureDate}
                    </p>

                    <p className="text-sm font-semibold text-gray-600">
                      {selectedGroup.product}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-blue-600">
                      총 {people.length}명
                    </p>

                    <p className="text-xs text-gray-400">
                      예약 {selectedGroup.reservationCount}건
                    </p>
                  </div>
                </div>

                {peopleLoading ? (
                  <div className="py-16 text-center text-sm font-semibold text-gray-500">
                    예약자 명단을 불러오는 중입니다...
                  </div>
                ) : people.length === 0 ? (
                  <div className="py-16 text-center text-sm text-gray-500">
                    등록된 예약자 명단이 없습니다.
                  </div>
                ) : (
                  <>
                    <div className="mx-auto max-w-2xl rounded-2xl bg-gray-100 p-4">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0">
                        {Array.from({ length: 10 }).map((_, index) => {
                          const person = previewPeople[index];

                          return (
                            <div
                              key={index}
                              className="
                                  flex aspect-[88.9/52]
                                  items-center justify-center
                                  border border-gray-300
                                  bg-white px-3 text-center
                                "
                            >
                              {person ? (
                                <div className="min-w-0">
                                  <div className="truncate text-xl font-black text-gray-900">
                                    {person.name}
                                  </div>

                                  {(() => {
                                    const englishName =
                                      formatEnglishName(person);
                                    const nameStyle = getNameStyle(englishName);

                                    return (
                                      <>
                                        <div
                                          className={`
          mt-1 truncate font-bold tracking-wide text-gray-600
          ${nameStyle.className}
        `}
                                        >
                                          {englishName || "영문명 미등록"}
                                        </div>

                                        {englishName && nameStyle.warning && (
                                          <div className="mt-1 text-[10px] font-semibold text-amber-500">
                                            ⚠ 긴 영문명 · 자동 축소
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">
                                  빈 라벨
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPage((page) => Math.max(1, page - 1))
                        }
                        disabled={previewPage <= 1}
                        className="
                          rounded-xl border border-gray-200
                          px-4 py-2 text-sm font-bold
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        ← 이전
                      </button>

                      <span className="min-w-[90px] text-center text-sm font-black text-gray-700">
                        {previewPage} / {totalPages} 페이지
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPage((page) =>
                            Math.min(totalPages, page + 1),
                          )
                        }
                        disabled={previewPage >= totalPages}
                        className="
                          rounded-xl border border-gray-200
                          px-4 py-2 text-sm font-bold
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        다음 →
                      </button>
                    </div>
                  </>
                )}

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroup(null);
                      setPeople([]);
                      setPreviewPage(1);
                    }}
                    className="
                      flex-1 rounded-xl border border-gray-200
                      px-4 py-3 font-bold text-gray-600
                      hover:bg-gray-50
                    "
                  >
                    ← 출발일 다시 선택
                  </button>

                  <button
                    type="button"
                    onClick={generateExcel}
                    disabled={people.length === 0}
                    className="
    flex-1 rounded-xl bg-emerald-600
    px-4 py-3 font-bold text-white
    transition hover:bg-emerald-700
    disabled:cursor-not-allowed
    disabled:bg-gray-300
    disabled:text-gray-500
  "
                  >
                    📊 엑셀 다운로드
                  </button>

                  <button
                    type="button"
                    onClick={generatePdf}
                    disabled={pdfGenerating || people.length === 0}
                    className="
    flex-1 rounded-xl bg-blue-600
    px-4 py-3 font-bold text-white
    transition hover:bg-blue-700
    disabled:cursor-not-allowed
    disabled:bg-gray-300
    disabled:text-gray-500
  "
                  >
                    {pdfGenerating ? "⏳ PDF 생성 중..." : "🖨️ PDF 다운로드"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
