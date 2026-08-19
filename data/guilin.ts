export type DepartureStatus = "available" | "hot" | "closed";

export interface Departure {
  id: number;
  date: string;
  course: "3박5일" | "4박6일";
  airline: string;
  price: number;
  seats: number;
  status: DepartureStatus;
}


export interface Shopping {
  id: number;
  title: string;
  image: string;
  desc: string;
}


export interface Review {
  id: number;
  name: string;
  date: string;
  image: string;
  rating: number;
  text: string;
}


export interface FAQ {
  id: number;
  question: string;
  answer: string;
  link?: string;
}

export interface IncludedItem {
  id: number;
  text: string;
}

export interface GalleryImage {
  id: number;
  src: string;
  title: string;
  desc: string;
}

export interface Hotel {
  id: number;
  name: string;
  grade: string;
  image: string;
  roomImage?: string;
  desc: string;
}

export const mealBaseUrl =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/meals/guilin/";

export const mealImages: Record<string, string> = {
  호텔식: "breakfast.jpg",
  현지식: "local.png",
  "이강폭포 딤섬특식": "gimseo.png",
  "민물 생선요리": "fish.png",
  "사천식 샤브샤브": "sichuan-hotpot.png",
  "토종 닭백숙": "chicken.png",
  "삼겹살 무제한": "samgyeopsal.png",
  동북요리: "dongbei.png",
  농가식: "farmmeal.png",
  샤브샤브: "shabu.png",
  "천저우식 마라닭요리 + 호남요리": "mala-chicken.png",
  "연어 회정식": "salmon.png",
  해물전골: "seafood-hotpot.png",
};

export const flightInfo = {
  outbound: {
    airline: "티웨이항공",
    flight: "TW9613",
    from: "청주",
    to: "계림",
    departure: "22:00",
    arrival: "00:45(+1)",
  },

  inbound: {
    airline: "티웨이항공",
    flight: "TW9614",
    from: "계림",
    to: "청주",
    departure: "02:00",
    arrival: "06:15",
  },
};

export const shopping: Shopping[] = [
  {
    id: 1,
    title: "라텍스",
    image: "/images/shopping/latex.jpg",
    desc: "천연 라텍스 침구 및 생활용품을 둘러보는 매장입니다.",
  },
  {
    id: 2,
    title: "차(Tea)",
    image: "/images/shopping/tea.jpg",
    desc: "중국 전통차와 다양한 차 문화를 체험할 수 있습니다.",
  },
  {
    id: 3,
    title: "보석",
    image: "/images/shopping/jewelry.jpg",
    desc: "옥·비취 등 중국 전통 보석 제품을 소개합니다.",
  },
  {
    id: 4,
    title: "침향",
    image: "/images/shopping/qimhyang.jpg",
    desc: "침향나무가 수백 년에 걸쳐 생성한 천연 수지를 소개합니다.",
  },
  {
    id: 5,
    title: "게르마늄",
    image: "/images/shopping/germanium.jpg",
    desc: "혈액순환, 통증완화, 피로해소 등의 효과가 있는 제품을 소개합니다.",
  },
];

export const reviews: Review[] = [
  {
    id: 1,
    name: "김○○",
    date: "2026.09",
    image: "/images/reviews/review1.jpg",
    rating: 5,
    text: "부모님과 함께한 최고의 여행이었습니다. 일정과 식사 모두 만족했습니다.",
  },
  {
    id: 2,
    name: "이○○",
    date: "2026.10",
    image: "/images/reviews/review2.jpeg",
    rating: 5,
    text: "천문산과 원가계의 풍경이 아직도 생생합니다. 가이드도 친절했습니다.",
  },
  {
    id: 3,
    name: "박○○",
    date: "2026.09",
    image: "/images/reviews/review3.jpg",
    rating: 5,
    text: "사진보다 실제 풍경이 훨씬 아름다웠습니다.",
  },
  {
    id: 4,
    name: "최○○",
    date: "2026.10",
    image: "/images/reviews/review4.jpg",
    rating: 5,
    text: "호텔과 식사 모두 기대 이상이었습니다.",
  },
  {
    id: 5,
    name: "정○○",
    date: "2026.09",
    image: "/images/reviews/review5.jpg",
    rating: 5,
    text: "가족여행으로 정말 만족했습니다. 다음에도 이용하고 싶습니다.",
  },
];

export const faqs: FAQ[] = [
  {
    id: 1,
    question: "여권 유효기간은 얼마나 남아 있어야 하나요?",
    answer: "출발일 기준 6개월 이상 남아있는 여권이 필요합니다.",
  },
  {
    id: 2,
    question: "계림은 비자가 필요한가요?",
    answer: "여행 시점의 중국 입국 정책을 기준으로 적용됩니다.",
  },
  {
    id: 3,
    question: "환전은 얼마나 해야 하나요?",
    answer: "개인경비와 선택사항을 고려하여 위안화를 준비하시는 것을 권장합니다.",
  },
  {
    id: 4,
    question: "보조배터리는 기내 반입이 가능한가요?",
    answer: "가능하지만 국토교통부 규정에 따라 반드시 기내 휴대해야 합니다.",
  },
  {
    id: 5,
    question: "쇼핑센터 방문이 포함되어 있나요?",
    answer: "네. 일정에 포함되어 있으며 구매는 고객님의 자율적인 선택입니다.",
  },
  {
    id: 6,
    question: "여행지 날씨는 어디에서 확인할 수 있나요?",
    answer: "출발 전 최신 날씨는 아래 사이트에서 확인하실 수 있습니다.",
    link: "https://www.windy.com/25.278/110.291?25.008,110.302,9"
  },
];

export const includes: IncludedItem[] = [
  { id: 1, text: "왕복 항공권,유류할증료 및 공항세" },
  { id: 2, text: "전 일정 호텔(2인 1실)" },
  { id: 3, text: "특식5회(이강폭포딤섬특식,민물생선요리,사천식 샤브샤브,토종닭백숙,삼겹살무제한)" },
  { id: 4, text: "전용 차량(리무진)&한국어 가이드&기사/가이드팁" },
  { id: 5, text: "요산(케이블카),우산공원,양강사호 야간유람선" },
  { id: 6, text: "세외도원(뱃놀이),월량산,여의봉(케의블카+잔도+출렁다리+드론영상)" },
  { id: 7, text: "이강유람선,관암동굴(쪽배+유람선+모노레일),첩채산,상비산" },
  { id: 8, text: "[특전] 산수간쇼+인상유삼조+발&전신마사지 90분체험" },
  { id: 9, text: "1억원 여행자보험" },
];

export const excludes: IncludedItem[] = [
  { id: 1, text: "개인경비 및 매너팁" },
  { id: 2, text: "일정 외 선택 관광" },
];  

export const hotels: Hotel[] = [
  {
    id: 1,
    name: "계림 머큐어 호텔",
    grade: "★★★★",
    image: "mercure.jpg",
    roomImage: "mercureroom.jpg",
    desc: "계림시 하이테크존 레스토랑 지역에 위치한 시내 중심 호텔입니다.",
  },
  {
    id: 2,
    name: "양삭 스위트 BY 래디슨",
    grade: "★★★★",
    image: "raedison.JPG",
    roomImage: "raedisonroom.JPG",
    desc: "쾌적한 객실과 다양한 부대시설을 갖춘 프리미엄 호텔입니다.",
  },
  {
    id: 3,
    name: "천저우 홀리데이인 익스프레스호텔",
    grade: "★★★★",
    image: "cheonzhou.JPG",
    roomImage: "cheonzhouroom.JPG",
    desc: "관광 접근성이 뛰어난 4성급 호텔입니다.",
  },
];

export interface ItineraryItem {
    day: string;
    icon: string;
    title: string;
    description: string;
    image: string;
    places: string[];
    duration: string;
    meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
    hotel: string;
  };

  export const itineraryGuilin3N5D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 계림공항 도착",
    description:
      "청주공항에서 티웨이항공 TW9613편으로 출발하여 계림공항 도착 후 가이드 미팅, 호텔 투숙 및 휴식합니다.",
    image: "/images/guilin/day1.jpg",
    places: ["청주공항", "계림공항"],
    duration: "계림 도착 후 호텔 이동",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "불포함",
    },
    hotel: "계림 머큐어/갤러리호텔 또는 동급",
  },

  {
    day: "DAY 2",
    icon: "🏞️",
    title: "요산 · 산수간쇼 · 우산공원 · 동서항 · 양강사호",
    description:
      "계림 시내를 한눈에 볼 수 있는 요산을 케이블카로 관광하고, 계림의 산수와 문화를 환상적으로 표현한 산수간쇼를 관람합니다. 아름다운 꽃과 조경을 감상할 수 있는 우산공원과 계림의 명동으로 불리는 동서항 정양보행가를 둘러본 뒤 양강사호 야간유람을 즐깁니다.",
    image: "/images/guilin/day2.jpg",
    places: [
      "요산",
      "산수간쇼",
      "우산공원",
      "동서항 정양보행가",
      "양강사호 야간유람",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "이강폭포 딤섬특식",
    },
    hotel: "계림 머큐어/갤러리호텔 또는 동급",
  },

  {
    day: "DAY 3",
    icon: "⛰️",
    title: "세외도원 · 대용수 · 월량산 · 여의봉 · 서가시장 · 인상유삼조",
    description:
      "호텔 조식 후 백사로 이동하여 각 민족의 풍습과 수공예품을 볼 수 있는 세외도원을 뱃놀이로 관광합니다. 양삭으로 이동하여 천년 묵은 대용수와 초승달 모양의 월량산을 둘러보고, 여의봉 케이블카와 잔도·출렁다리·드론영상 체험을 즐깁니다. 이후 서가시장에서 자유시간을 가진 뒤 인상유삼조 공연을 관람합니다.",
    image: "/images/guilin/day3.jpg",
    places: [
      "세외도원",
      "대용수",
      "월량산",
      "여의봉",
      "서가시장",
      "인상유삼조",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "민물 생선요리",
      dinner: "사천식 샤브샤브",
    },
    hotel: "양삭 스위트 By 레디슨 호텔 또는 동급",
  },

  {
    day: "DAY 4",
    icon: "🌊",
    title: "이강유람선 · 관암동굴 · 첩채산 · 상비산 · 발마사지",
    description:
      "호텔 조식 후 이강 선착장으로 이동하여 계림 산수의 하이라이트인 이강유람선을 즐깁니다. 아름다운 종유동굴 관암동굴과 비단이 켜켜이 포개진 형태의 첩채산, 코끼리가 물을 마시는 형상의 상비산을 관광합니다. 이후 전통 발마사지 체험 후 공항으로 이동합니다.",
    image: "/images/guilin/day4.jpg",
    places: [
      "이강유람선",
      "관암동굴",
      "첩채산",
      "상비산",
      "발마사지",
    ],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "토종 닭백숙",
      dinner: "삼겹살 무제한",
    },
    hotel: "해당 없음",
  },

  {
    day: "DAY 5",
    icon: "🛬",
    title: "계림공항 출발 · 청주공항 도착",
    description:
      "계림공항에서 티웨이항공 TW9614편으로 출발하여 청주공항 도착 후 일정을 마칩니다.",
    image: "/images/guilin/day5.jpg",
    places: ["계림공항", "청주공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당 없음",
  },
];

export const itineraryGuilin4N6D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 계림공항 도착",
    description:
      "청주 국제공항에서 티웨이항공 TW9613편으로 출발하여 계림 국제공항 도착 후 가이드 미팅, 호텔 투숙 및 휴식합니다.",
    image: "/images/guilin/day1.jpg",
    places: ["청주공항", "계림공항"],
    duration: "계림 도착 후 호텔 이동",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "계림 머큐어/캘러리호텔 또는 동급",
  },

  {
    day: "DAY 2",
    icon: "🏞️",
    title: "요산 · 산수간쇼 · 우산공원 · 동서항 · 양강사호",
    description:
      "계림 시내를 한눈에 볼 수 있는 요산을 케이블카로 관광하고, 계림의 산수와 문화를 표현한 산수간쇼를 관람합니다. 이후 아름다운 꽃과 조경을 감상할 수 있는 우산공원과 계림의 명동으로 불리는 동서항 정양보행가를 둘러본 뒤 양강사호 야간유람을 즐깁니다.",
    image: "/images/guilin/day2.jpg",
    places: [
      "요산",
      "산수간쇼",
      "우산공원",
      "동서항 정양보행가",
      "양강사호 야간유람",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "이강폭포 딤섬특식",
    },
    hotel: "계림 머큐어/캘러리호텔 또는 동급",
  },

  {
    day: "DAY 3",
    icon: "⛰️",
    title: "세외도원 · 대용수 · 월량산 · 여의봉 · 서가시장 · 인상유삼조",
    description:
      "백사로 이동하여 각 민족의 풍습과 수공예품을 볼 수 있는 세외도원을 뱃놀이로 관광합니다. 양삭으로 이동하여 천년 묵은 대용수와 초승달 모양의 월량산을 둘러보고, 여의봉 케이블카와 잔도·출렁다리·드론영상 체험을 즐깁니다. 이후 서가시장에서 자유시간을 가진 뒤 인상유삼조 공연을 관람합니다.",
    image: "/images/guilin/day3.jpg",
    places: [
      "세외도원",
      "대용수",
      "월량산",
      "여의봉",
      "서가시장",
      "인상유삼조",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "민물 생선요리",
    },
    hotel: "양삭 스위트 By 레디슨 호텔 또는 동급",
  },

  {
    day: "DAY 4",
    icon: "🏔️",
    title: "계평 · 망산 · 복계산 · 서가시장",
    description:
      "호텔 조식 후 계평으로 이동하여 TV에 등장한 신비로운 복계산 투어를 진행합니다. 이후 망산으로 이동하여 고의령, 망산오지봉관광지, 마천령 엘리베이터 등 핵심 관광지를 둘러봅니다. 관광 후 양삭으로 이동하여 서가시장에서 자유시간을 갖습니다.",
    image: "/images/guilin/day4.jpg",
    places: [
      "복계산",
      "고의령",
      "망산오지봉관광지",
      "마천령 엘리베이터",
      "서가시장",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "사천식 샤브샤브",
    },
    hotel: "양삭 스위트 By 레디슨 호텔 또는 동급",
  },

  {
    day: "DAY 5",
    icon: "🌊",
    title: "이강유람선 · 관암동굴 · 첩채산 · 상비산 · 발마사지",
    description:
      "호텔 조식 후 이강 선착장으로 이동하여 계림 산수의 하이라이트인 이강유람선을 즐깁니다. 아름다운 종유동굴 관암동굴과 비단이 겹쳐진 절벽의 첩채산, 코끼리가 물을 마시는 형상의 상비산을 관광합니다. 이후 전통 발마사지 체험 후 공항으로 이동합니다.",
    image: "/images/guilin/day5.jpg",
    places: [
      "이강유람선",
      "관암동굴",
      "첩채산",
      "상비산",
      "발마사지",
    ],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "토종 닭백숙",
      dinner: "삼겹살 무제한",
    },
    hotel: "해당 없음",
  },

  {
    day: "DAY 6",
    icon: "🛬",
    title: "계림공항 출발 · 청주공항 도착",
    description:
      "계림 국제공항에서 티웨이항공 TW9614편으로 출발하여 청주 국제공항 도착 후 일정을 마칩니다.",
    image: "/images/guilin/day6.jpg",
    places: ["계림공항", "청주공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당 없음",
  },
];

export const itineraryChenzhou3N5D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 계림공항 도착",
    description:
      "청주공항에서 티웨이항공 TW9613편으로 출발하여 계림공항 도착 후 가이드 미팅, 호텔 투숙 및 휴식합니다.",
    image: "/images/guilin/chenzhou-day1.jpg",
    places: ["청주공항", "계림공항"],
    duration: "계림 도착 후 호텔 이동",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "천저우 홀리데이인 익스프레스호텔 또는 동급 비엔나호텔",
  },

  {
    day: "DAY 2",
    icon: "🏞️",
    title: "천저우 · 고의령 · 비천산맥 · 유후가거리",
    description:
      "호텔 조식 후 천저우로 이동하여 높이 의자 같은 거대한 언덕 고의령과 마황구 대협곡을 관광합니다. 붉은 퇴적암이 만든 신비로운 풍경의 비천산맥을 둘러보고, 천저우를 대표하는 야경 명소 유후가거리에서 아름다운 야경을 감상합니다.",
    image: "/images/guilin/chenzhou-day2.jpg",
    places: [
      "고의령",
      "마황구 대협곡",
      "비천산맥",
      "유후가거리",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "동북요리",
    },
    hotel: "천저우 홀리데이인 익스프레스호텔 또는 동급 비엔나호텔",
  },

  {
    day: "DAY 3",
    icon: "🏔️",
    title: "망산 · 오지봉",
    description:
      "호텔 조식 후 망산으로 이동하여 절경의 운해를 감상할 수 있는 망산투어 오지봉을 관광합니다. 오지봉 케이블카를 이용하고 코스 전망대, 에스컬레이터, 정지, 팔괘대, 오지봉관망대, 안심대, 협곡식당폭포, 도해관음, 후루암, 선녀, 미천령 엘리베이터, 금편대협곡, 금편신주, 불장대, 칠성애, 소천대 엘리베이터 등을 둘러본 뒤 케이블카로 하산합니다.",
    image: "/images/guilin/chenzhou-day3.jpg",
    places: [
      "망산",
      "오지봉",
      "오지봉 케이블카",
      "금편대협곡",
      "금편신주",
      "불장대",
      "칠성애",
      "소천대 엘리베이터",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "농가식",
      dinner: "현지식",
    },
    hotel: "천저우 홀리데이인 익스프레스호텔 또는 동급 비엔나호텔",
  },

  {
    day: "DAY 4",
    icon: "🌊",
    title: "노적암동굴 · 첩채산 · 양강사호 · 일월쌍탑 · 발마사지",
    description:
      "호텔 조식 후 계림으로 이동하여 노적암동굴을 관광합니다. 비단을 펼쳐 놓은 듯한 풍경의 첩채산을 둘러보고, 삼호의 금탑과 은탑의 환상적인 야경을 감상하는 양강사호 야간유람과 계림의 상징인 일월쌍탑을 관광합니다. 이후 전통 전신 마사지 90분 체험 후 공항으로 이동합니다.",
    image: "/images/guilin/chenzhou-day4.jpg",
    places: [
      "노적암동굴",
      "첩채산",
      "양강사호 야간유람",
      "일월쌍탑",
      "전신마사지 90분",
    ],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "샤브샤브",
      dinner: "삼겹살 무제한",
    },
    hotel: "해당 없음",
  },

  {
    day: "DAY 5",
    icon: "🛬",
    title: "계림공항 출발 · 청주공항 도착",
    description:
      "계림공항에서 티웨이항공 TW9614편으로 출발하여 청주공항 도착 후 일정을 마칩니다.",
    image: "/images/guilin/chenzhou-day5.jpg",
    places: ["계림공항", "청주공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당 없음",
  },
];
export const itineraryChenzhou4N6D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 계림공항 도착",
    description:
      "청주공항에서 티웨이항공 TW9613편으로 출발하여 계림공항 도착 후 가이드 미팅, 호텔 투숙 및 휴식합니다.",
    image: "/images/guilin/chenzhou4-day1.jpg",
    places: ["청주공항", "계림공항"],
    duration: "계림 도착 후 호텔 이동",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "천저우 홀리데이인 익스프레스호텔 또는 동급 비엔나호텔",
  },

  {
    day: "DAY 2",
    icon: "🏞️",
    title: "천저우 · 소선령 · 미항구 대협곡 · 비천산",
    description:
      "호텔 조식 후 천저우로 이동하여 천저우 시내를 내려다볼 수 있는 소선령을 케이블카로 관광합니다. 이동 중 마황구대협곡을 차창으로 관광하고, 절경이 장강삼협과 비견되는 비천산을 유람선으로 관광합니다.",
    image: "/images/guilin/chenzhou4-day2.jpg",
    places: [
      "소선령",
      "소선령 케이블카",
      "마황구 대협곡",
      "비천산",
      "비천산 유람선",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "천저우식 마라닭요리 + 호남요리",
    },
    hotel: "천저우 홀리데이인 익스프레스호텔 또는 동급 비엔나호텔",
  },

  {
    day: "DAY 3",
    icon: "🏔️",
    title: "망산 · 오지봉 · 유후가거리",
    description:
      "호텔 조식 후 망산으로 이동하여 절경의 운해를 감상할 수 있는 망산 오지봉을 관광합니다. 오지봉 케이블카와 전망대, 에스컬레이터, 주요 협곡과 봉우리 등을 둘러보고 하산합니다. 이후 천저우를 대표하는 야경 명소 유후가거리에서 자유시간을 갖습니다.",
    image: "/images/guilin/chenzhou4-day3.jpg",
    places: [
      "망산",
      "오지봉",
      "오지봉 케이블카",
      "전망대",
      "금편대협곡",
      "금편신주",
      "불장대",
      "칠성애",
      "소천대 엘리베이터",
      "유후가거리",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "삼겹살 무제한",
    },
    hotel: "천저우 홀리데이인 익스프레스호텔 또는 동급 비엔나호텔",
  },

  {
    day: "DAY 4",
    icon: "🌿",
    title: "소동강 · 동강호 · 도솔영암 · 고의령",
    description:
      "호텔 조식 후 소동강으로 이동하여 안개가 모여드는 맑고 청명한 소동강을 셔틀버스와 도보로 관광합니다. 아름다운 동강호 풍경구를 유람선으로 둘러보고, 웅장하고 화려한 동굴 도솔영암과 절묘하고 아찔한 단하지모 경관의 고의령 풍경구를 관광합니다.",
    image: "/images/guilin/chenzhou4-day4.jpg",
    places: [
      "소동강",
      "동강호 풍경구",
      "동강호 유람선",
      "도솔영암",
      "고의령 풍경구",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "연어 회정식",
      dinner: "현지식",
    },
    hotel: "천저우 홀리데이인 익스프레스호텔 또는 동급 비엔나호텔",
  },

  {
    day: "DAY 5",
    icon: "🌃",
    title: "계림 · 산수간쇼 · 우산공원 · 일월쌍탑 · 동서항 · 양강사호",
    description:
      "호텔 조식 후 계림으로 이동하여 계림의 산수와 문화를 환상적으로 표현한 산수간쇼를 관람합니다. 아름다운 꽃과 조경을 감상할 수 있는 우산공원과 계림의 상징인 일월쌍탑을 관광하고, 계림의 명동으로 불리는 동서항 정양보행가를 둘러봅니다. 이후 양강사호 야간유람을 즐긴 뒤 공항으로 이동합니다.",
    image: "/images/guilin/chenzhou4-day5.jpg",
    places: [
      "산수간쇼",
      "우산공원",
      "일월쌍탑",
      "동서항 정양보행가",
      "양강사호 야간유람",
    ],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "해물전골",
      dinner: "삼겹살 무제한",
    },
    hotel: "해당 없음",
  },

  {
    day: "DAY 6",
    icon: "🛬",
    title: "계림공항 출발 · 청주공항 도착",
    description:
      "계림공항에서 티웨이항공 TW9614편으로 출발하여 청주공항 도착 후 일정을 마칩니다.",
    image: "/images/guilin/chenzhou4-day6.jpg",
    places: ["계림공항", "청주공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당 없음",
  },
];