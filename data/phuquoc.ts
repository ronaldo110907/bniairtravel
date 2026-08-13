export type PhuQuocProductType =
  | "premium"
  | "quality"
  | "value"
  | "golf";

  export type Hotel = {
  id: number;
  name: string;
  grade: string;
  image: string;
  roomImage?: string;
  desc: string;
};

export type IncludedItem = {
  id: number;
  text: string;
};

export type Shopping = {
  id: number;
  title: string;
  image: string;
  desc: string;
};

export type FAQ = {
  id: number;
  question: string;
  answer: string;
  link?: string;
};

export type ItineraryItem = {
  day: string;
  icon: string;
  title: string;
  description: string;
  image?: string;
  imagePosition?: string;
  places?: string[];

  spotImages?: {
    name: string;
    image: string;
  }[];

  duration?: string;

  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };

  hotel?: string;
};

export const productTabs = [
  {
    id: "premium" as const,
    label: "고품격",
    description: "노팁 · 노옵션",
  },
  {
    id: "quality" as const,
    label: "품격",
    description: "노팁 · 노옵션",
  },
  {
    id: "value" as const,
    label: "실속",
    description: "알찬 실속상품",
  },
  {
    id: "golf" as const,
    label: "골프",
    description: "푸꾸옥 골프투어",
  },
];

export const flightInfo = {
  outbound: {
    airline: "비엣젯항공",
    flight: "VJ2867",
    from: "청주",
    to: "푸꾸옥",
    departure: "07:30",
    arrival: "10:30",
  },

  inbound: {
    airline: "비엣젯항공",
    flight: "VJ2866",
    from: "푸꾸옥",
    to: "청주",
    departure: "23:30",
    arrival: "06:30+1",
  },
};

// ==================== 호텔 ====================

// 고품격
export const hotelsPremium: Hotel[] = [
  {
    id: 1,
    name: "윈덤 그랜드 푸꾸옥",
    grade: "★★★★★",
    image: "wyndham-grand.jpg",
    roomImage: "wyndham-grand_room.JPG",
    desc: "푸꾸옥 북부에 위치한 프리미엄 5성급 리조트로 쾌적하고 여유로운 휴양을 즐길 수 있습니다.",
  },
];

// 품격
export const hotelsQuality: Hotel[] = [
  {
    id: 1,
    name: "빈 홀리데이 피에스타 푸꾸옥",
    grade: "★★★★",
    image: "vinholidays-fiesta.jpg",
    roomImage: "vinholidays-fiesta_room.JPG",
    desc: "그랜드월드와 인접하여 관광과 휴양을 편리하게 즐길 수 있는 푸꾸옥 대표 호텔입니다.",
  },
];

// 실속
export const hotelsValue: Hotel[] = [
  {
    id: 1,
    name: "윈덤 가든 푸꾸옥",
    grade: "★★★★",
    image: "wyndham-garden.jpg",
    roomImage: "wyndham-garden_room.jpeg",
    desc: "편안한 객실과 다양한 부대시설을 갖춘 실속형 푸꾸옥 호텔입니다.",
  },
  {
    id: 2,
    name: "무엉탄 럭셔리 푸꾸옥",
    grade: "★★★★",
    image: "muong-thanh.jpg",
    roomImage: "muong-thanh_room.JPG",
    desc: "푸꾸옥의 휴양 분위기와 편안한 객실을 함께 즐길 수 있는 호텔입니다.",
  },
  {
    id: 3,
    name: "펄 오션 호텔",
    grade: "★★★★",
    image: "pearl-ocean.jpg",
    roomImage: "pearl-ocean_room.JPG",
    desc: "편안한 숙박과 휴식을 즐길 수 있는 푸꾸옥 실속형 호텔입니다.",
  },
];

// 골프
export const hotelsGolf: Hotel[] = [
  {
    id: 1,
    name: "빈 홀리데이 피에스타 푸꾸옥",
    grade: "★★★★",
    image: "vinholidays-fiesta.jpg",
    roomImage: "vinholidays-fiesta_room.JPG",
    desc: "골프 라운딩과 푸꾸옥 관광을 함께 즐기기에 편리한 위치의 호텔입니다.",
  },
];


// ==================== 포함 / 불포함 ====================

// ==================== 고품격 ====================

export const includesPremium: IncludedItem[] = [
  { id: 1, text: "왕복 항공권, 유류할증료 및 공항세" },
  { id: 2, text: "전 일정 호텔(2인 1실)" },
  { id: 3, text: "일정표에 명시된 전 일정 식사" },
  { id: 4, text: "전용 차량 및 한국어 가이드" },
  { id: 5, text: "가이드/기사 경비 포함 (노팁)" },
  { id: 6, text: "일정표에 명시된 관광지 입장료 (노옵션)" },
  { id: 7, text: "혼똔섬 해상 케이블카 및 워터파크" },
  { id: 8, text: "빈펄사파리 및 그랜드월드 관광" },
  { id: 9, text: "전신마사지 90분 1회 (매너팁 별도)" },
  { id: 10, text: "여행자보험" },
];

export const excludesPremium: IncludedItem[] = [
  { id: 1, text: "개인경비 및 매너팁" },
  { id: 2, text: "일정 외 개인 선택사항" },
];


// ==================== 품격 ====================

export const includesQuality: IncludedItem[] = [
  { id: 1, text: "왕복 항공권, 유류할증료 및 공항세" },
  { id: 2, text: "전 일정 호텔(2인 1실)" },
  { id: 3, text: "일정표에 명시된 전 일정 식사" },
  { id: 4, text: "전용 차량 및 한국어 가이드" },
  { id: 5, text: "가이드/기사 경비 포함 (노팁)" },
  { id: 6, text: "일정표에 명시된 관광지 입장료 (노옵션)" },
  { id: 7, text: "혼똔섬 해상 케이블카 및 워터파크" },
  { id: 8, text: "빈펄사파리 및 그랜드월드 관광" },
  { id: 9, text: "전신마사지 90분 1회 (매너팁 별도)" },
  { id: 10, text: "여행자보험" },
];

export const excludesQuality: IncludedItem[] = [
  { id: 1, text: "개인경비 및 매너팁" },
  { id: 2, text: "일정 외 개인 선택사항" },
];


// ==================== 실속 ====================

export const includesValue: IncludedItem[] = [
  { id: 1, text: "왕복 항공권, 유류할증료 및 공항세" },
  { id: 2, text: "전 일정 호텔(2인 1실)" },
  { id: 3, text: "일정표에 명시된 식사" },
  { id: 4, text: "전용 차량 및 한국어 가이드" },
  { id: 5, text: "혼똔섬 해상 케이블카 및 워터파크" },
  { id: 6, text: "전신마사지 60분 1회 (매너팁 별도)" },
  { id: 7, text: "여행자보험" },
];

export const excludesValue: IncludedItem[] = [
  { id: 1, text: "가이드/기사 경비" },
  { id: 2, text: "선택관광 비용" },
  { id: 3, text: "개인경비 및 매너팁" },
];


// ==================== 골프 ====================

export const includesGolf: IncludedItem[] = [
  { id: 1, text: "왕복 항공권, 유류할증료 및 공항세" },
  { id: 2, text: "전 일정 호텔(2인 1실)" },
  { id: 3, text: "일정표에 명시된 식사" },
  { id: 4, text: "전용 차량 및 한국어 가이드" },
  { id: 5, text: "빈펄 골프 푸꾸옥 18홀" },
  { id: 6, text: "에스추리 골프 18홀" },
  { id: 7, text: "골프 그린피 + 캐디피 + 전동카(2인 1카)" },
  { id: 8, text: "전신마사지 60분 1회 (매너팁 별도)" },
  { id: 9, text: "여행자보험" },
];

export const excludesGolf: IncludedItem[] = [
  { id: 1, text: "골프장 클럽 중식" },
  { id: 2, text: "캐디팁 및 기타 골프장 개인경비" },
  { id: 3, text: "개인경비 및 매너팁" },
  { id: 4, text: "일정 외 선택관광 및 추가 라운딩 비용" },
];


// ==================== 쇼핑 ====================

// ==================== 고품격 ====================

export const shoppingPremium: Shopping[] = [
   {
    id: 1,
    title: "침향",
    image: "/images/shopping/qimhyang.jpg",
    desc: "베트남 전통 침향 관련 제품을 소개하는 매장입니다.",
  },
  {
    id: 2,
    title: "잡화",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/shopping/zhangjiajie/coffee.jpg",
    desc: "베트남 현지 특산품과 G7커피 등 다양한 생활 잡화를 둘러보는 매장입니다.",
  },
];

// ==================== 품격 ====================

export const shoppingQuality: Shopping[] = [
  {
    id: 1,
    title: "침향",
    image: "/images/shopping/qimhyang.jpg",
    desc: "베트남 전통 침향 관련 제품을 소개하는 매장입니다.",
  },
  {
    id: 2,
    title: "잡화",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/shopping/zhangjiajie/coffee.jpg",
    desc: "베트남 현지 특산품과 G7커피 등 다양한 생활 잡화를 둘러보는 매장입니다.",
  },
];

// ==================== 실속 ====================

export const shoppingValue: Shopping[] = [
  {
    id: 1,
    title: "노니",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/shopping/zhangjiajie/noni.jpg",
    desc: "베트남 대표 건강식품인 노니 관련 제품을 둘러보는 매장입니다.",
  },
  {
    id: 2,
    title: "침향",
    image: "/images/shopping/qimhyang.jpg",
    desc: "베트남 전통 침향 관련 제품을 소개하는 매장입니다.",
  },
  {
    id: 3,
    title: "잡화",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/shopping/zhangjiajie/coffee.jpg",
    desc: "베트남 현지 특산품과 G7커피 등 다양한 생활 잡화를 둘러보는 매장입니다.",
  },
];

// ==================== 골프 ====================

export const shoppingGolf: Shopping[] = [
  {
    id: 1,
    title: "침향",
    image: "/images/shopping/qimhyang.jpg",
    desc: "베트남 전통 침향 관련 제품을 소개하는 매장입니다.",
  },
  {
    id: 2,
    title: "잡화",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/shopping/zhangjiajie/coffee.jpg",
    desc: "베트남 현지 특산품과 G7커피 등 다양한 생활 잡화를 둘러보는 매장입니다.",
  },
];

// ==================== FAQ ====================

export const faqs: FAQ[] = [
  {
    id: 1,
    question: "여권 유효기간은 얼마나 남아 있어야 하나요?",
    answer: "출발일 기준 6개월 이상 남아있는 여권을 준비해주세요.",
  },
  {
    id: 2,
    question: "베트남 여행 시 비자가 필요한가요?",
    answer:
      "대한민국 국민은 관광 목적으로 베트남 입국시 무비자이며 최대 45일간 체류가 가능합니다.\n여권 유효기간은 6개월 이상 남아 있어야 하며, 반드시 귀국 항공권(또는 제3국행 항공권)을 소지해야 합니다.",
  },
  {
    id: 3,
    question: "환전은 어떻게 준비하면 되나요?",
    answer:
      "베트남 동(VND) 또는 달러(USD)를 준비하실 수 있으며, 개인경비와 선택사항을 고려하여 준비해주세요.",
  },
  {
    id: 4,
    question: "보조배터리는 기내 반입이 가능한가요?",
    answer:
      "가능하지만 항공 안전 규정에 따라 위탁수하물에 넣지 말고 반드시 기내에 휴대해주세요.",
  },
  {
    id: 5,
    question: "쇼핑센터 방문이 포함되어 있나요?",
    answer:
      "네. 상품별 일정에 쇼핑센터 방문이 포함될 수 있으며 구매는 고객님의 자율적인 선택입니다.",
  },
  {
    id: 6,
    question: "푸꾸옥 날씨는 어디에서 확인할 수 있나요?",
    answer:
      "출발 전 푸꾸옥의 최신 날씨는 아래 사이트에서 확인하실 수 있습니다.",
    link: "https://www.windy.com/10.217/103.959?10.099,104.085,11",
  },
];

export const mealBaseUrl =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/meal/phuquoc/";

export const mealImages: Record<string, string> = {};

// ==================== 고품격 ====================
export const itineraryPremium: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 푸꾸옥 도착",
    description:
      "청주공항을 출발하여 푸꾸옥 국제공항에 도착합니다. 가이드 미팅 후 딘커우 사원을 관광하고 전신마사지 90분으로 여행의 피로를 풀어드립니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/dinhcau.jpg",
    imagePosition: "center 70%",
    places: [
      "청주공항",
      "푸꾸옥 국제공항",
      "딘커우 사원",
      "전신마사지 90분",
    ],
    spotImages: [
  {
    name: "딘커우 사원",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/dinhcau.jpg",
  },
  {
    name: "전신마사지 90분",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/massage.JPG",
  },
],
    duration: "푸꾸옥 도착 후 관광",
    meals: {
      breakfast: "-----",
      lunch: "쌀국수세트",
      dinner: "쌈밥정식",
    },
    hotel: "윈덤 그랜드 푸꾸옥 호텔 또는 동급",
  },

  {
    day: "DAY 2",
    icon: "🚠",
    title: "혼똔섬 · 선셋타운",
    description:
      "세계 최장 해상 케이블카를 타고 혼똔섬으로 이동하여 워터파크와 네이처파크를 즐긴 후 선셋타운과 키스오브브릿지, 부이페스트 바자 나이트마켓을 관광합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/honddon.png",
    imagePosition: "center 70%",
    places: [
      "혼똔섬",
      "해상 케이블카",
      "워터파크",
      "네이처파크",
      "선셋타운",
      "키스오브브릿지",
      "부이페스트 바자 나이트마켓",
    ],
    spotImages: [
  {
    name: "혼똔섬 케이블카",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/honddon.png",
  },
  {
    name: "워터파크",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/waterpark.jpg",
  },
  {
    name: "선셋타운",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/sunset.jpg",
  },
],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "망고 레스토랑",
      dinner: "삼겹살 무제한",
    },
    hotel: "윈덤 그랜드 푸꾸옥 호텔 또는 동급",
  },

  {
    day: "DAY 3",
    icon: "🎡",
    title: "푸꾸옥 데이투어 · 빈펄사파리 · 그랜드월드",
    description:
      "빈원더스 또는 호핑투어 중 하나를 선택하여 즐긴 후 빈펄사파리와 바구니배 체험, 그랜드월드 자유시간 및 틴호와 쇼를 관람합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/grandworld.jpg",
    imagePosition: "center 70%",
    places: [
      "빈원더스 또는 호핑투어",
      "빈펄사파리",
      "바구니배 체험",
      "그랜드월드",
      "틴호와 쇼",
    ],
    spotImages: [
  {
    name: "호핑투어",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/hoping.jpg",
  },
  {
    name: "빈펄사파리",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/safari.jpg",
  },
  {
    name: "틴호와쇼",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/ddinhowa.jpg",
  },
],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "반세오세트",
      dinner: "특한정식",
    },
    hotel: "윈덤 그랜드 푸꾸옥 호텔 또는 동급",
  },

  {
    day: "DAY 4",
    icon: "🌴",
    title: "푸꾸옥 핵심 관광 · 공항 이동",
    description:
      "호텔 조식 후 호국사와 코코넛수용소, 진주박물관, 후추생산농장 등 푸꾸옥의 주요 관광지를 둘러보고 쯔엉동 야시장 관광 후 공항으로 이동합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/zungdong.jpg",
    imagePosition: "center 70%",
    places: [
      "호국사",
      "코코넛수용소",
      "진주박물관",
      "후추생산농장",
      "쯔엉동 야시장",
      "푸꾸옥 국제공항",
    ],
    spotImages: [
  {
    name: "호국사",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/hoguksa.jpg",
  },
  {
    name: "후추생산농장",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/huchu.JPG",
  },
  {
    name: "쯔엉동 야시장",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/zungdong.jpg",
  },
],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "샤브샤브",
      dinner: "해물탕 + 파전",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 5",
    icon: "🛬",
    title: "푸꾸옥 출발 · 청주공항 도착",
    description:
      "푸꾸옥 국제공항을 출발하여 청주공항에 도착한 후 여행을 마무리합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/cjj.jpg",
    imagePosition: "80% center",
    places: ["푸꾸옥 국제공항", "청주공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
];

// ==================== 품격 ====================
export const itineraryQuality: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 푸꾸옥 도착",
    description:
      "청주공항을 출발하여 푸꾸옥 국제공항에 도착합니다. 가이드 미팅 후 딘커우 사원을 관광하고 전신마사지 90분으로 여행의 피로를 풀어드립니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/dinhcau.jpg",
    imagePosition: "center 70%",
    places: [
      "청주공항",
      "푸꾸옥 국제공항",
      "딘커우 사원",
      "전신마사지 90분",
    ],
    spotImages: [
  {
    name: "딘커우 사원",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/dinhcau.jpg",
  },
  {
    name: "전신마사지 90분",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/massage.JPG",
  },
],
    duration: "푸꾸옥 도착 후 관광",
    meals: {
      breakfast: "-----",
      lunch: "쌀국수세트",
      dinner: "쌈밥정식",
    },
    hotel: "빈 홀리데이 호텔 또는 동급",
  },

  {
    day: "DAY 2",
    icon: "🚠",
    title: "혼똔섬 · 선셋타운",
    description:
      "세계 최장 해상 케이블카를 타고 혼똔섬으로 이동하여 워터파크와 네이처파크를 즐긴 후 선셋타운과 키스오브브릿지, 부이페스트 바자 나이트마켓을 관광합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/honddon.png",
    imagePosition: "center 70%",
    places: [
      "혼똔섬",
      "해상 케이블카",
      "워터파크",
      "네이처파크",
      "선셋타운",
      "키스오브브릿지",
      "부이페스트 바자 나이트마켓",
    ],
    spotImages: [
  {
    name: "혼똔섬 케이블카",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/honddon.png",
  },
  {
    name: "워터파크",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/waterpark.jpg",
  },
  {
    name: "선셋타운",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/sunset.jpg",
  },
],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "망고 레스토랑",
      dinner: "삼겹살 무제한",
    },
    hotel: "빈 홀리데이 호텔 또는 동급",
  },

  {
    day: "DAY 3",
    icon: "🎡",
    title: "푸꾸옥 데이투어 · 빈펄사파리 · 그랜드월드",
    description:
      "빈원더스 또는 호핑투어 중 하나를 선택하여 즐긴 후 빈펄사파리와 바구니배 체험, 그랜드월드 자유시간 및 틴호와 쇼를 관람합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/grandworld.jpg",
    imagePosition: "center 70%",
    places: [
      "빈원더스 또는 호핑투어",
      "빈펄사파리",
      "바구니배 체험",
      "그랜드월드",
      "틴호와 쇼",
    ],
    spotImages: [
  {
    name: "호핑투어",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/hoping.jpg",
  },
  {
    name: "빈펄사파리",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/safari.jpg",
  },
  {
    name: "틴호와쇼",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/ddinhowa.jpg",
  },
],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "반세오세트",
      dinner: "특한정식",
    },
    hotel: "빈 홀리데이 호텔 또는 동급",
  },

  {
    day: "DAY 4",
    icon: "🌴",
    title: "푸꾸옥 핵심 관광 · 공항 이동",
    description:
      "호텔 조식 후 호국사와 코코넛수용소, 진주박물관, 후추생산농장 등 푸꾸옥의 주요 관광지를 둘러보고 쯔엉동 야시장 관광 후 공항으로 이동합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/zungdong.jpg",
    imagePosition: "center 70%",
    places: [
      "호국사",
      "코코넛수용소",
      "진주박물관",
      "후추생산농장",
      "쯔엉동 야시장",
      "푸꾸옥 국제공항",
    ],
    spotImages: [
  {
    name: "호국사",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/hoguksa.jpg",
  },
  {
    name: "후추생산농장",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/huchu.JPG",
  },
  {
    name: "쯔엉동 야시장",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/zungdong.jpg",
  },
],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "샤브샤브",
      dinner: "해물탕 + 파전",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 5",
    icon: "🛬",
    title: "푸꾸옥 출발 · 청주공항 도착",
    description:
      "푸꾸옥 국제공항을 출발하여 청주공항에 도착한 후 여행을 마무리합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/cjj.jpg",
    imagePosition: "80% center",
    places: ["푸꾸옥 국제공항", "청주공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
];

// ==================== 실속 ====================

export const itineraryValue: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 푸꾸옥 도착",
    description:
      "청주공항을 출발하여 푸꾸옥 국제공항에 도착합니다. 가이드 미팅 후 딘커우 사원을 관광하고 전신마사지 60분으로 여행의 피로를 풀어드립니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/dinhcau.jpg",
    imagePosition: "center 70%",
    places: [
      "청주공항",
      "푸꾸옥 국제공항",
      "딘커우 사원",
      "전신마사지 60분",
    ],
    spotImages: [
  {
    name: "딘커우 사원",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/dinhcau.jpg",
  },
  {
    name: "전신마사지 60분",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/massage.JPG",
  },
],
    duration: "푸꾸옥 도착 후 관광",
    meals: {
      breakfast: "-----",
      lunch: "쌀국수세트",
      dinner: "쌈밥정식",
    },
    hotel: "윈덤가든 / 무엉탄 / 펄오션 호텔 또는 동급",
  },

  {
    day: "DAY 2",
    icon: "🚠",
    title: "혼똔섬 · 선셋타운",
    description:
      "세계 최장 해상 케이블카를 타고 혼똔섬으로 이동하여 워터파크와 네이처파크를 즐긴 후 선셋타운과 키스오브브릿지, 부이페스트 바자 나이트마켓을 관광합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/honddon.png",
    imagePosition: "center 70%",
    places: [
      "혼똔섬",
      "해상 케이블카",
      "워터파크",
      "네이처파크",
      "선셋타운",
      "키스오브브릿지",
      "부이페스트 바자 나이트마켓",
    ],
    spotImages: [
  {
    name: "혼똔섬 케이블카",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/honddon.png",
  },
  {
    name: "워터파크",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/waterpark.jpg",
  },
  {
    name: "선셋타운",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/sunset.jpg",
  },
],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "반세오세트",
      dinner: "김치전골 + 고등어",
    },
    hotel: "윈덤가든 / 무엉탄 / 펄오션 호텔 또는 동급",
  },

  {
    day: "DAY 3",
    icon: "🌊",
    title: "푸꾸옥 디스커버리 선택관광",
    description:
      "푸꾸옥 디스커버리 또는 호핑 디스커버리 묶음 옵션 중 원하는 일정을 선택하여 푸꾸옥을 자유롭게 즐깁니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/grandworld.jpg",
    imagePosition: "center 70%",
    places: [
      "푸꾸옥 디스커버리 또는 호핑 디스커버리",
      "그랜드월드 시티투어",
      "마사지",
    ],
    spotImages: [
  {
    name: "호핑투어(선택관광)",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/hoping.jpg",
  },
  {
    name: "빈펄사파리(선택관광)",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/safari.jpg",
  },
  {
    name: "그랜드월드(선택관광)",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/grandworld.jpg",
  },
],
    duration: "전일 선택관광",
    meals: {
      breakfast: "호텔식",
      lunch: "분짜세트",
      dinner: "꽃게탕세트",
    },
    hotel: "윈덤가든 / 무엉탄 / 펄오션 호텔 또는 동급",
  },

  {
    day: "DAY 4",
    icon: "🌴",
    title: "푸꾸옥 핵심 관광 · 공항 이동",
    description:
      "호텔 조식 후 호국사와 코코넛수용소, 진주박물관, 후추생산농장을 관광하고 쯔엉동 야시장을 둘러본 후 공항으로 이동합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/zungdong.jpg",
    imagePosition: "center 70%",
    places: [
      "호국사",
      "코코넛수용소",
      "진주박물관",
      "후추생산농장",
      "쯔엉동 야시장",
      "푸꾸옥 국제공항",
    ],
    spotImages: [
  {
    name: "호국사",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/hoguksa.jpg",
  },
  {
    name: "후추생산농장",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/huchu.JPG",
  },
  {
    name: "쯔엉동 야시장",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/zungdong.jpg",
  },
],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "불고기세트",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 5",
    icon: "🛬",
    title: "푸꾸옥 출발 · 청주공항 도착",
    description:
      "푸꾸옥 국제공항을 출발하여 청주공항에 도착한 후 여행을 마무리합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/cjj.jpg",
    imagePosition: "80% center",
    places: ["푸꾸옥 국제공항", "청주공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
];

// ==================== 골프 ====================

export const itineraryGolf: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 푸꾸옥 도착",
    description:
      "청주공항을 출발하여 푸꾸옥 국제공항에 도착합니다. 가이드 미팅 후 딘커우 사원을 관광하고 전신마사지 60분으로 여행의 피로를 풀어드립니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/dinhcau.jpg",
    imagePosition: "center 70%",
    places: [
      "청주공항",
      "푸꾸옥 국제공항",
      "딘커우 사원",
      "전신마사지 60분",
    ],
    spotImages: [
  {
    name: "딘커우 사원",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/dinhcau.jpg",
  },
  {
    name: "전신마사지 60분",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/massage.JPG",
  },
],
    duration: "푸꾸옥 도착 후 관광",
    meals: {
      breakfast: "-----",
      lunch: "쌀국수세트",
      dinner: "쌈밥정식",
    },
    hotel: "빈 홀리데이 호텔 또는 동급",
  },

  {
    day: "DAY 2",
    icon: "⛳",
    title: "빈펄 골프 푸꾸옥 · 18홀",
    description:
      "호텔 조식 후 빈펄 골프 푸꾸옥으로 이동하여 18홀 라운딩을 즐깁니다. 라운딩 후 현지 문화와 활기찬 분위기를 느낄 수 있는 쯔엉동 야시장을 관광합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/beanpearl.jpeg",
    places: [
      "빈펄 골프 푸꾸옥",
      "18홀 라운딩",
      "쯔엉동 야시장",
    ],
    duration: "전일 골프",
    meals: {
      breakfast: "호텔식",
      lunch: "클럽중식 (불포함)",
      dinner: "삼겹살 무제한",
    },
    hotel: "빈 홀리데이 호텔 또는 동급",
  },

  {
    day: "DAY 3",
    icon: "🏌️",
    title: "에스추리 골프 · 18홀",
    description:
      "호텔 조식 후 에스추리 골프로 이동하여 18홀 라운딩을 즐깁니다. 라운딩 후 베트남의 베네치아로 불리는 그랜드월드에서 자유시간을 즐깁니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/bungbawoo.jpg",
    imagePosition: "center 70%",
    places: [
      "에스추리 골프",
      "18홀 라운딩",
      "그랜드월드",
    ],
    duration: "전일 골프",
    meals: {
      breakfast: "호텔식",
      lunch: "클럽중식 (불포함)",
      dinner: "한정식 (김치전골 + 고등어)",
    },
    hotel: "빈 홀리데이 호텔 또는 동급",
  },

  {
    day: "DAY 4",
    icon: "🌴",
    title: "푸꾸옥 핵심 관광 · 공항 이동",
    description:
      "호텔 조식 후 자유 선택 일정을 즐길 수 있으며, 이후 호국사와 코코넛수용소, 진주박물관, 후추생산농장, 소나시 야시장을 관광한 후 공항으로 이동합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/sonasi.jpg",
    imagePosition: "center 70%",
    places: [
      "호국사",
      "코코넛수용소",
      "진주박물관",
      "후추생산농장",
      "소나시 야시장",
      "푸꾸옥 국제공항",
    ],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "반세오세트",
      dinner: "불고기세트",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 5",
    icon: "🛬",
    title: "푸꾸옥 출발 · 청주공항 도착",
    description:
      "푸꾸옥 국제공항을 출발하여 청주공항에 도착한 후 여행을 마무리합니다.",
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/cjj.jpg",
    imagePosition: "80% center",
    places: ["푸꾸옥 국제공항", "청주공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
];