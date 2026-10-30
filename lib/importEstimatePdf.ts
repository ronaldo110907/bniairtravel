/**
 * BNI AIR TRAVEL - 기존 견적서 PDF -> 자유 견적 작성 화면용 데이터
 *
 * 브라우저에서만 실행합니다. PDF를 서버에 업로드하지 않습니다.
 * PDF 전체 페이지와 실제 DAY 표기 수를 기준으로 읽으며, 페이지 수를 가정하지 않습니다.
 *
 * 주의: 인쇄 PDF에는 원본 입력 데이터가 보존되지 않으므로 표/줄바꿈의
 * 100% 복원은 불가능할 수 있습니다. 이 경우 추출된 값을 사용자가 수정합니다.
 */

export type EstimateCurrency = "KRW" | "USD" | "CNY";
export type ImportedEstimatePriceMode = "combined" | "split";

export type ImportedEstimateForm = {
  recipient: string;
  sender: string;
  sentDate: string;
  productName: string;
  travelPeriod: string;
  includes: string;
  excludes: string;
  shopping: string;
  options: string;
  remarks: string;
  combinedPrice: string;
  combinedCurrency: EstimateCurrency;
  airfare: string;
  airfareCurrency: EstimateCurrency;
  landCost: string;
  landCurrency: EstimateCurrency;
};

export type ImportedEstimateDay = {
  id: string;
  region: string;
  transport: string;
  time: string;
  schedule: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  hotel: string;
};

export type ImportedEstimate = {
  form: ImportedEstimateForm;
  priceMode: ImportedEstimatePriceMode;
  days: ImportedEstimateDay[];
  warnings: string[];
};

type PdfToken = {
  page: number;
  x: number;
  y: number;
  width: number;
  pageWidth: number;
  text: string;
};

type PdfLine = { page: number; y: number; tokens: PdfToken[] };
type DayMarker = { token: PdfToken; dayNumber: number };

function position(token: PdfToken) {
  // 각 페이지의 높이가 달라도 페이지 순서가 우선이 되도록 합니다.
  return token.page * 100_000 + token.y;
}

function clean(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/[\t ]+/g, " ").trim();
}

function withoutPlaceholder(value: string) {
  const trimmed = value.trim();
  return trimmed === "-" ? "" : trimmed;
}

function sortTokens(tokens: PdfToken[]) {
  return [...tokens].sort(
    (a, b) => a.page - b.page || a.y - b.y || a.x - b.x,
  );
}

function groupLines(tokens: PdfToken[], tolerance = 3.2): PdfLine[] {
  const lines: PdfLine[] = [];
  for (const token of sortTokens(tokens)) {
    const last = lines[lines.length - 1];
    if (last && last.page === token.page && Math.abs(last.y - token.y) <= tolerance) {
      last.tokens.push(token);
    } else {
      lines.push({ page: token.page, y: token.y, tokens: [token] });
    }
  }
  return lines;
}

function lineText(tokens: PdfToken[]) {
  const parts = [...tokens].sort((a, b) => a.x - b.x);
  let output = "";
  let lastEnd = 0;
  for (const part of parts) {
    const value = clean(part.text);
    if (!value) continue;
    // PDF가 한 줄을 여러 텍스트 조각으로 나누어 저장한 경우만 공백 삽입
    const gap = part.x - lastEnd;
    const separator = output && gap > 1.8 ? " " : "";
    output += `${separator}${value}`;
    lastEnd = Math.max(lastEnd, part.x + part.width);
  }
  return clean(output);
}

function linesText(tokens: PdfToken[]) {
  return groupLines(tokens)
    .map((line) => lineText(line.tokens))
    .filter(Boolean)
    .join("\n")
    .trim();
}

function headerToken(tokens: PdfToken[], label: string) {
  const needle = label.replace(/\s/g, "");
  return tokens.find((token) => token.text.replace(/\s/g, "").includes(needle));
}

function parseCurrency(text: string): EstimateCurrency {
  if (/\$|\bUSD\b/i.test(text)) return "USD";
  if (/¥|￥|\bCNY\b/i.test(text)) return "CNY";
  return "KRW";
}

function parseMoney(text: string) {
  const numbers = text.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
  return numbers.length ? numbers[numbers.length - 1].replace(/,/g, "") : "";
}

function createEmptyForm(): ImportedEstimateForm {
  return {
    recipient: "",
    sender: "",
    sentDate: "",
    productName: "",
    travelPeriod: "",
    includes: "",
    excludes: "",
    shopping: "",
    options: "",
    remarks: "",
    combinedPrice: "",
    combinedCurrency: "KRW",
    airfare: "",
    airfareCurrency: "KRW",
    landCost: "",
    landCurrency: "USD",
  };
}

function isRepeatedHeader(token: PdfToken) {
  const text = clean(token.text);
  const headerWords = ["일자", "지역", "교통", "시간", "상세일정", "상세 일정", "식사"];
  return headerWords.includes(text);
}

function isDocumentFooter(token: PdfToken) {
  return token.text.includes("상기 일정은 현지 및 항공 사정에 따라 변경될 수 있습니다");
}

function findDayMarkers(tokens: PdfToken[]): DayMarker[] {
  const sorted = sortTokens(tokens);
  const markers: DayMarker[] = [];
  for (const token of sorted) {
    // DAY라는 글자가 일정 내용에 있어도 일자 열의 DAY만 인식
    if (token.x / token.pageWidth > 0.09) continue;
    const match = clean(token.text).match(/^DAY\s*(\d+)?$/i);
    if (!match) continue;

    let number = Number(match[1] ?? 0);
    if (!number) {
      const nextNumber = sorted.find(
        (candidate) =>
          candidate.page === token.page &&
          candidate.y > token.y &&
          candidate.y - token.y < 25 &&
          candidate.x / candidate.pageWidth < 0.09 &&
          /^\d{1,3}$/.test(clean(candidate.text)),
      );
      number = Number(nextNumber?.text ?? 0);
    }
    markers.push({ token, dayNumber: number || markers.length + 1 });
  }
  return markers;
}

function extractMealText(tokens: PdfToken[]) {
  const result = { breakfast: "", lunch: "", dinner: "" };
  let previous: keyof typeof result | null = null;
  for (const line of groupLines(tokens)) {
    const text = lineText(line.tokens);
    // 조 / 중 / 석은 오른쪽 식사 칼럼에만 있으므로 일정 문장과 구분됩니다.
    const match = text.match(/^([조중석])\s*(.*)$/);
    if (match) {
      previous = match[1] === "조" ? "breakfast" : match[1] === "중" ? "lunch" : "dinner";
      result[previous] = [result[previous], match[2]].filter(Boolean).join(" ");
    } else if (previous && text && text !== "-") {
      // 긴 식사명이 다음 줄로 자동 줄바꿈된 경우
      result[previous] = [result[previous], text].filter(Boolean).join(" ");
    }
  }
  return result;
}

function extractDay(
  tokens: PdfToken[],
  marker: DayMarker,
  nextPosition: number,
  notesStart: number,
  index: number,
): ImportedEstimateDay {
  const start = position(marker.token);
  const usable = sortTokens(tokens).filter((token) => {
    const pos = position(token);
    return (
      pos >= start &&
      pos < nextPosition &&
      pos < notesStart &&
      !isRepeatedHeader(token) &&
      !isDocumentFooter(token)
    );
  });

  // 호텔은 여러 칼럼을 합친 별도 행이므로 먼저 떼어냅니다.
  const hotels: string[] = [];
  const hotelLineKeys = new Set<string>();
  for (const line of groupLines(usable)) {
    const sorted = [...line.tokens].sort((a, b) => a.x - b.x);
    const hotelLabel = sorted.find(
      (item) => item.x / item.pageWidth < 0.2 && /^HOTEL\b/i.test(clean(item.text)),
    );
    if (!hotelLabel) continue;
    const value = lineText(sorted).replace(/^HOTEL\s*/i, "").trim();
    if (value) hotels.push(value);
    hotelLineKeys.add(`${line.page}:${line.y.toFixed(1)}`);
  }

  const fieldTokens = usable.filter((token) => {
    return ![...hotelLineKeys].some((key) => {
      const [page, y] = key.split(":").map(Number);
      return token.page === page && Math.abs(token.y - y) <= 3.2;
    });
  });

  const region: PdfToken[] = [];
  const transport: PdfToken[] = [];
  const time: PdfToken[] = [];
  const schedule: PdfToken[] = [];
  const meal: PdfToken[] = [];

  for (const token of fieldTokens) {
    const x = token.x / token.pageWidth;
    if (x < 0.084) continue; // DAY와 날짜 숫자
    if (x < 0.162) region.push(token);
    else if (x < 0.244) transport.push(token);
    else if (x < 0.314) time.push(token);
    else if (x < 0.805) schedule.push(token);
    else meal.push(token);
  }

  return {
    id: `import-day-${index + 1}`,
    region: withoutPlaceholder(linesText(region)),
    transport: withoutPlaceholder(linesText(transport)),
    time: withoutPlaceholder(linesText(time)),
    schedule: withoutPlaceholder(linesText(schedule)),
    ...extractMealText(meal),
    hotel: hotels.join("\n"),
  };
}

/**
 * 파일 선택 이벤트에서 직접 호출할 함수.
 * 예: const imported = await extractEstimateFromPdf(file);
 *     setMode("free"); setForm(imported.form); setPriceMode(imported.priceMode);
 *     setDays(imported.days);
 */
export async function extractEstimateFromPdf(file: File): Promise<ImportedEstimate> {
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    throw new Error("PDF 파일을 선택해주세요.");
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder("ascii").decode(data.slice(0, 5));
  if (signature !== "%PDF-") {
    throw new Error("올바른 PDF 파일이 아닙니다.");
  }

  // 동적 import이므로 Next.js 서버 렌더링 시 PDF.js를 실행하지 않습니다.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const task = pdfjs.getDocument({ data });
  const tokens: PdfToken[] = [];
  const warnings: string[] = [];

  try {
    const pdf = await task.promise;
    // 중요: numPages 만큼 순회. 페이지 또는 DAY 개수를 하드코딩하지 않습니다.
    for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
      const page = await pdf.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      for (const item of content.items) {
        if (!("str" in item) || !clean(item.str)) continue;
        const transform = pdfjs.Util.transform(viewport.transform, item.transform);
        tokens.push({
          page: pageIndex,
          x: transform[4],
          y: transform[5],
          width: item.width,
          pageWidth: viewport.width,
          text: item.str,
        });
      }
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }

  if (tokens.length === 0) {
    throw new Error("PDF에서 글자를 읽을 수 없습니다. 이미지로 스캔된 PDF는 지원하지 않습니다.");
  }

  const form = createEmptyForm();
  const sorted = sortTokens(tokens);
  const markers = findDayMarkers(sorted);
  if (markers.length === 0) {
    throw new Error("DAY 일정표를 찾지 못했습니다. BNI에서 생성한 텍스트형 견적서 PDF인지 확인해주세요.");
  }

  // 상품명은 현재 견적서 PDF 본문에 인쇄되지 않으므로 파일명을 사용합니다.
  const productFromFile = file.name
    .replace(/\.pdf$/i, "")
    .replace(/^BNI[_\s-]*견적서[_\s-]*/i, "")
    .trim();
  form.productName = productFromFile === file.name.replace(/\.pdf$/i, "") ? "" : productFromFile;
  if (!form.productName) warnings.push("상품명을 PDF에서 확인하지 못했습니다. 직접 입력해주세요.");

  const firstDayPosition = position(markers[0].token);
  const intro = sorted.filter((token) => position(token) < firstDayPosition);
  const notesHeading = sorted.find(
    (token) =>
      position(token) > position(markers[markers.length - 1].token) &&
      token.x / token.pageWidth < 0.16 &&
      clean(token.text) === "비고",
  );
  const notesStart = notesHeading ? position(notesHeading) : Infinity;

  // 수신 / 발신: 표 상단의 좌우 칼럼을 각각 인식
  for (const line of groupLines(intro)) {
    const full = lineText(line.tokens);
    if (/(^|\s)수신/.test(full) || /(^|\s)발신/.test(full)) {
      const left = lineText(line.tokens.filter((item) => item.x / item.pageWidth < 0.5));
      const right = lineText(line.tokens.filter((item) => item.x / item.pageWidth >= 0.5));
      const recipient = left.replace(/^수신\s*[:：]?\s*/, "").trim();
      const sender = right.replace(/^발신\s*[:：]?\s*/, "").replace(/^BNI\s*항공\s*/, "").trim();
      if (left.startsWith("수신") && recipient) form.recipient = recipient;
      if (right.startsWith("발신") && sender) form.sender = sender;
    }
  }

  const introText = linesText(intro);
  const dateMatch = introText.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (dateMatch) {
    form.sentDate = [
      dateMatch[1],
      dateMatch[2].padStart(2, "0"),
      dateMatch[3].padStart(2, "0"),
    ].join("-");
  }

  const periodMatch = introText.match(/여행기간\s*[:：]?\s*([^\n]+)/);
  if (periodMatch) form.travelPeriod = clean(periodMatch[1]);
  else warnings.push("기존 PDF에는 여행기간 입력값이 표시되지 않아 비워 두었습니다.");

  // 입금가 / 항공료 / 지상비: 견적 금액 영역의 행별 라벨로 구분
  const priceHeading = headerToken(intro, "견적 금액");
  const includesHeading = headerToken(intro, "포함사항");
  const priceRows = groupLines(
    intro.filter(
      (token) =>
        (!priceHeading || position(token) > position(priceHeading)) &&
        (!includesHeading || position(token) < position(includesHeading)),
    ),
  );
  let hasSplitPrice = false;
  for (const line of priceRows) {
    const text = lineText(line.tokens);
    const label = text.match(/^(총\s*입금가|입금가|항공료|지상비)\s*/);
    if (!label) continue;
    const amountText = text.slice(label[0].length);
    const amount = parseMoney(amountText);
    const currency = parseCurrency(amountText);
    if (label[1] === "항공료") {
      form.airfare = amount;
      form.airfareCurrency = currency;
      hasSplitPrice = true;
    } else if (label[1] === "지상비") {
      form.landCost = amount;
      form.landCurrency = currency;
      hasSplitPrice = true;
    } else if (label[1] === "입금가") {
      form.combinedPrice = amount;
      form.combinedCurrency = currency;
    }
  }

  // 포함 / 불포함: 한 행에서 좌우 열에 인쇄되므로 x 위치로 분리
  if (includesHeading) {
    const shoppingHeading = headerToken(intro, "쇼핑");
    const optionsHeading = headerToken(intro, "옵션");
    const scheduleHeading = headerToken(intro, "상세 일정");
    const end = Math.min(
      ...( [shoppingHeading, optionsHeading, scheduleHeading]
        .filter((token): token is PdfToken => Boolean(token))
        .map(position)),
      firstDayPosition,
    );
    const body = intro.filter(
      (token) =>
        position(token) > position(includesHeading) + 4 &&
        position(token) < end &&
        !/^(포함사항|불포함사항)$/.test(clean(token.text)),
    );
    form.includes = linesText(body.filter((token) => token.x / token.pageWidth < 0.5));
    form.excludes = linesText(body.filter((token) => token.x / token.pageWidth >= 0.5));
  }

  // 쇼핑 / 옵션: 라벨로 시작하는 행만 사용
  for (const line of groupLines(intro)) {
    const value = lineText(line.tokens);
    if (/^쇼핑\s+/.test(value)) form.shopping = value.replace(/^쇼핑\s+/, "");
    if (/^옵션\s+/.test(value)) form.options = value.replace(/^옵션\s+/, "");
  }

  const days = markers.map((marker, index) => {
    const next = markers[index + 1];
    return extractDay(
      sorted,
      marker,
      next ? position(next.token) : Infinity,
      notesStart,
      index,
    );
  });

  // 마지막 DAY 다음 페이지에 비고가 있어도 계속 읽음
  if (notesHeading) {
    form.remarks = linesText(
      sorted.filter(
        (token) =>
          position(token) > notesStart + 3 &&
          !isDocumentFooter(token),
      ),
    );
  }

  const emptyDays = days.filter(
    (day) => !day.region && !day.transport && !day.time && !day.schedule && !day.hotel,
  );
  if (emptyDays.length) {
    warnings.push(`DAY ${emptyDays.length}개에서 추출된 일정 내용이 적습니다. 원본 PDF와 비교해주세요.`);
  }
  warnings.push("PDF의 표 줄바꿈은 원래 입력한 줄바꿈과 다를 수 있습니다. 일정과 식사, 금액을 확인해주세요.");

  return { form, priceMode: hasSplitPrice ? "split" : "combined", days, warnings };
}
