import {
  itineraryPremium3N5D, itineraryGuanzhishan4N6D,
  includesPremium3, excludesPremium3, includesGuanzhishan4, excludesGuanzhishan4,
  type ItineraryItem,
} from "@/data/xiamen";
import type { ConfirmationProduct, ConfirmationDay } from "./model";

function convertDays(items: ItineraryItem[]): ConfirmationDay[] {
  return items.map(item => ({
    region: (item.region ?? "").replace(/ · /g, "\n"), transport: (item.transport ?? "").replace(/ · /g, "\n"), time: (item.time ?? "").replace(/ \/ /g, "\n"),
    schedule: (item.schedule ?? item.description).split(/\r?\n/).filter(line => line.trim()).join("\n"),
    meals: [["조", item.meals?.breakfast], ["중", item.meals?.lunch], ["석", item.meals?.dinner]]
      .filter(([, v]) => v && !/^-+$/.test(v)).map(([k, v]) => `${k}:${v}`).join("\n") || "—",
    // An overnight flight is not an additional hotel night.
    hotel: !item.hotel || /기내|해당\s*없음|숙박\s*없음/.test(item.hotel) ? null : item.hotel,
  }));
}
const texts = (items: { text: string }[]) => items.map(i => i.text).join(" · ");
function xiamen(id: string, label: string, nights: number, variants: string[], items: ItineraryItem[], included: string, excluded: string): ConfirmationProduct {
  const days = convertDays(items);
  const meetingTime = days[0].schedule.match(/^(\d{2}:\d{2})[^\n]*미팅/m)?.[1] ?? days[0].time.split("\n")[0];
  return {
    id, label, nights, variants, productSlug: "xiamen", days,
    title: `[ZE][고품격] 청주출발↔${label} 확정서`,
    meeting: `${meetingTime} 청주국제공항 1층 3번게이트 안 좌측 여행사 미팅 데스크`,
    included, excluded, shopping: "노쇼핑", options: "노옵션",
    notice: "피켓명·가이드·호텔 등 변경사항은 한글에서 수정해주세요.",
  };
}
// New destinations register an adapter here; the document engine has no destination-specific branches.
export const confirmationProducts: ConfirmationProduct[] = [
  xiamen("xiamen-premium3", "하문 고품격 3박5일", 3, ["하문고품격", "고품격", "premium3"], itineraryPremium3N5D, texts(includesPremium3), texts(excludesPremium3)),
  xiamen("xiamen-guanzhishan4", "하문·관지산 4박6일", 4, ["고품격관지산", "관지산", "guanzhishan4"], itineraryGuanzhishan4N6D, texts(includesGuanzhishan4), texts(excludesGuanzhishan4)),
];
