import type { ItineraryItem } from "@/data/xiamen";

import {
  itineraryValue3N5D,
  itineraryPremium3N5D,
  itineraryPremium4N6D,
  itineraryWuyishan4N6D,
  itineraryGolf3N5D,
  itineraryGolf4N6D,
  includesValue3,
  excludesValue3,
  includesPremium3,
  excludesPremium3,
  includesPremium4,
  excludesPremium4,
  includesWuyishan4,
  excludesWuyishan4,
  includesGolf3,
  excludesGolf3,
  includesGolf4,
  excludesGolf4,
} from "@/data/xiamen";

export type EstimatePresetDay = {
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

export type EstimateProductPreset = {
  id: string;

  region: string;
  stay: string;

  // 장가계/백두산처럼 상품 구분이 필요 없으면 생략 가능
  type?: string;

  productName: string;
  travelPeriod: string;

  includes: string;
  excludes: string;

  shopping: string;
  options: string;
  remarks: string;

  days: EstimatePresetDay[];
};

function listToText(items: { text: string }[]) {
  return items.map((item) => `• ${item.text}`).join("\n");
}

function itineraryToDays(
  key: string,
  itinerary: ItineraryItem[],
): EstimatePresetDay[] {
  return itinerary.map((item, index) => {
    const places =
      item.places && item.places.length > 0
        ? item.places.map((place) => `▶ ${place}`).join("\n")
        : "";

    const schedule = [item.title, item.description, places]
      .filter(Boolean)
      .join("\n");

    return {
      id: `${key}-day-${index + 1}`,

      // 원본 데이터에 별도 필드가 없으므로 임의로 만들지 않음
      region: "",
      transport: "",

      time: item.duration ?? "",
      schedule,

      breakfast: item.meals?.breakfast ?? "",
      lunch: item.meals?.lunch ?? "",
      dinner: item.meals?.dinner ?? "",

      hotel: item.hotel ?? "",
    };
  });
}

const xiamenTourShopping = "찻집 · 라텍스 · 침향 중 2곳";

const xiamenRemarks = "이스타항공 위탁수하물 1인 15kg, 1Bag 기준";

export const estimateProducts: EstimateProductPreset[] = [
  // ======================================================
  // 하문 - 실속 3박5일
  // ======================================================
  {
    id: "xiamen-value-3n5d",

    region: "하문",
    stay: "3박5일",
    type: "실속",

    productName: "하문 실속 3박5일",
    travelPeriod: "3박5일",

    includes: listToText(includesValue3),
    excludes: listToText(excludesValue3),

    shopping: xiamenTourShopping,
    options: "선택관광 별도",
    remarks: xiamenRemarks,

    days: itineraryToDays("xiamen-value-3n5d", itineraryValue3N5D),
  },

  // ======================================================
  // 하문 - 고품격 3박5일
  // ======================================================
  {
    id: "xiamen-premium-3n5d",

    region: "하문",
    stay: "3박5일",
    type: "고품격",

    productName: "하문 고품격 3박5일",
    travelPeriod: "3박5일",

    includes: listToText(includesPremium3),
    excludes: listToText(excludesPremium3),

    shopping: xiamenTourShopping,
    options: "노옵션",
    remarks: xiamenRemarks,

    days: itineraryToDays("xiamen-premium-3n5d", itineraryPremium3N5D),
  },

  // ======================================================
  // 하문 - 고품격 4박6일
  // ======================================================
  {
    id: "xiamen-premium-4n6d",

    region: "하문",
    stay: "4박6일",
    type: "고품격",

    productName: "하문 고품격 4박6일",
    travelPeriod: "4박6일",

    includes: listToText(includesPremium4),
    excludes: listToText(excludesPremium4),

    shopping: xiamenTourShopping,
    options: "",
    remarks: xiamenRemarks,

    days: itineraryToDays("xiamen-premium-4n6d", itineraryPremium4N6D),
  },

  // ======================================================
  // 하문 - 무이산 4박6일
  // ======================================================
  {
    id: "xiamen-wuyishan-4n6d",

    region: "하문",
    stay: "4박6일",
    type: "무이산",

    productName: "하문 · 무이산 4박6일",
    travelPeriod: "4박6일",

    includes: listToText(includesWuyishan4),
    excludes: listToText(excludesWuyishan4),

    shopping: xiamenTourShopping,
    options: "",
    remarks: xiamenRemarks,

    days: itineraryToDays("xiamen-wuyishan-4n6d", itineraryWuyishan4N6D),
  },

  // ======================================================
  // 하문 - 골프 3박5일
  // ======================================================
  {
    id: "xiamen-golf-3n5d",

    region: "하문",
    stay: "3박5일",
    type: "골프",

    productName: "하문 골프 3박5일",
    travelPeriod: "3박5일",

    includes: listToText(includesGolf3),
    excludes: listToText(excludesGolf3),

    shopping: "노쇼핑",
    options: "",
    remarks: xiamenRemarks,

    days: itineraryToDays("xiamen-golf-3n5d", itineraryGolf3N5D),
  },

  // ======================================================
  // 하문 - 골프 4박6일
  // ======================================================
  {
    id: "xiamen-golf-4n6d",

    region: "하문",
    stay: "4박6일",
    type: "골프",

    productName: "하문 골프 4박6일",
    travelPeriod: "4박6일",

    includes: listToText(includesGolf4),
    excludes: listToText(excludesGolf4),

    shopping: "노쇼핑",
    options: "",
    remarks: xiamenRemarks,

    days: itineraryToDays("xiamen-golf-4n6d", itineraryGolf4N6D),
  },
];
