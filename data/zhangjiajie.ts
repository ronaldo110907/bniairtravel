export type DepartureStatus = "available" | "hot" | "closed";

export interface Departure {
  id: number;
  date: string;
  course: "3박4일" | "4박5일";
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
  desc: string;
}

export const flightInfo = {
  outbound: {
    airline: "이스타항공",
    flight: "ZE751",
    from: "청주",
    to: "장가계",
    departure: "11:00",
    arrival: "13:30",
  },

  inbound: {
    airline: "이스타항공",
    flight: "ZE752",
    from: "장가계",
    to: "청주",
    departure: "14:30",
    arrival: "18:30",
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
    question: "장가계는 비자가 필요한가요?",
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
];

export const includes: IncludedItem[] = [
  { id: 1, text: "왕복 항공권,유류할증료 및 공항세" },
  { id: 2, text: "전 일정 호텔(2인 1실)" },
  { id: 3, text: "특식5회(오리모듬,버섯샤브샤브,소고기특식,삼겹살무제한,누룽지닭백숙)" },
  { id: 4, text: "전용 차량(리무진)&한국어 가이드&기사/가이드팁" },
  { id: 5, text: "천자산, 보봉호(VIP+유람선),황룡동굴(VIP), " },
  { id: 6, text: "천문산(귀곡잔도+천문산사+유리잔도)" },
  { id: 7, text: "대협곡 B코스(유리다리편도+대협곡편도+유람선)" },
  { id: 8, text: "1억원 여행자보험" },
];

export const excludes: IncludedItem[] = [
  { id: 1, text: "개인경비 및 매너팁" },
  { id: 2, text: "일정 외 선택 관광" },
];  

export const hotels: Hotel[] = [
  {
    id: 1,
    name: "장가계 화천호텔",
    grade: "★★★★★",
    image: "hotel1.jpg",
    desc: "장가계 시내에 위치한 대표 5성급 호텔입니다.",
  },
  {
    id: 2,
    name: "블루베이 호텔",
    grade: "★★★★★",
    image: "bluebay.jpg",
    desc: "쾌적한 객실과 다양한 부대시설을 갖춘 프리미엄 호텔입니다.",
  },
  {
    id: 3,
    name: "피닉스 호텔",
    grade: "★★★★★",
    image: "phinex.jpg",
    desc: "관광 접근성이 뛰어난 5성급 호텔입니다.",
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

export const itinerary4N5D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 장가계 도착",
    description:
      "청주공항 출발 후 장가계에 도착하여 칠성산 관광과 호텔 체크인을 진행합니다.",
    image: "/images/zhangjiajie/7sungsan.jpg",
    places: ["청주공항", "장가계공항", "칠성산", "유리전망대", "잔도"],
    duration: "약 6~7시간",
    meals: {
      breakfast: "-----",
      lunch: "김밥+생수",
      dinner: "오리모듬",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 2",
    icon: "🏔️",
    title: "황룡동굴 · 대협곡",
    description:
      "황룡동굴을 둘러보고 대협곡 유리다리, 트레킹, 유람선 코스를 체험합니다.",
    image: "/images/zhangjiajie/detail-3.jpg",
    places: ["황룡동굴", "대협곡 유리다리", "트레킹", "유람선"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "산채비빔밥",
      dinner: "누룽지 닭백숙",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 3",
    icon: "🌄",
    title: "천자산 · 원가계",
    description:
      "천자산 케이블카와 백룡엘리베이터를 이용해 원가계의 대표 절경을 감상합니다.",
    image: "/images/zhangjiajie/chunjasan.jpg",
    places: ["천자산", "원가계", "백룡엘리베이터", "천하제일교", "미혼대", "십리화랑"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "버섯 샤브샤브",
      dinner: "삼겹살 무제한",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 4",
    icon: "🌿",
    title: "보봉호수 · 천문산 · 천문호선쇼",
    description:
      "보봉호수와 천문산 핵심 코스를 둘러보고 저녁에는 천문호선쇼를 관람합니다.",
    image: "/images/zhangjiajie/detail-2.jpg",
    places: ["보봉호수", "천문산", "천문동", "귀곡잔도", "유리잔도", "천문호선쇼", "72기루"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "보쌈정식",
      dinner: "소고기 특식",
    },
    hotel: "화천국제호텔 또는 동급",
  },
  {
    day: "DAY 5",
    icon: "🛬",
    title: "군성사석화 · 청주공항 도착",
    description:
      "군성사석화 관람 후 장가계공항으로 이동하여 청주행 항공편에 탑승합니다.",
    image: "/images/zhangjiajie/gunsung.jpg",
    places: ["군성사석화", "장가계공항", "청주공항"],
    duration: "약 5~6시간",
    meals: {
      breakfast: "호텔식",
      lunch: "한식",
      dinner: "-----",
    },
    hotel: "해당 없음",
    },
  ];  
export const itinerary3N4D: ItineraryItem[] = [
    {
      day: "DAY 1",
      icon: "✈️",
      title: "청주공항 출발 · 장가계 도착",
      description:
        "청주공항 출발 후 장가계에 도착하여 대협곡 유리다리 코스를 관광합니다.",
      image: "/images/zhangjiajie/detail-3.jpg",
      places: ["청주공항", "장가계공항", "대협곡", "유리다리"],
      duration: "약 6~7시간",
      meals: {
        breakfast: "-----",
        lunch: "김밥+생수",
        dinner: "오리모듬",
      },
      hotel: "화천국제호텔 또는 동급",
    },
    {
      day: "DAY 2",
      icon: "🏔️",
      title: "황룡동굴 · 천자산 · 원가계",
      description:
        "황룡동굴과 천자산, 원가계 핵심 절경을 하루 동안 집중적으로 둘러봅니다.",
      image: "/images/zhangjiajie/chunjasan.jpg",
      places: ["황룡동굴", "천자산", "원가계", "천하제일교", "미혼대", "백룡엘리베이터", "십리화랑", "72기루"],
      duration: "전일 관광",
      meals: {
        breakfast: "호텔식",
        lunch: "산채비빔밥",
        dinner: "삼겹살 무제한",
      },
      hotel: "화천국제호텔 또는 동급",
    },
    {
      day: "DAY 3",
      icon: "🌄",
      title: "보봉호수 · 천문산 · 천문호선쇼",
      description:
        "보봉호수 VIP 코스와 천문산 핵심 코스를 관광하고 천문호선쇼를 관람합니다.",
      image: "/images/zhangjiajie/detail-2.jpg",
      places: ["보봉호수", "천문산", "귀곡잔도", "유리잔도", "천문동", "천문호선쇼"],
      duration: "전일 관광",
      meals: {
        breakfast: "호텔식",
        lunch: "소고기 특식",
        dinner: "누룽지 닭백숙",
      },
      hotel: "화천국제호텔 또는 동급",
    },
    {
      day: "DAY 4",
      icon: "🛬",
      title: "군성사석화 · 청주공항 도착",
      description:
        "군성사석화 관람 후 장가계공항으로 이동하여 청주행 항공편에 탑승합니다.",
      image: "/images/zhangjiajie/gunsung.jpg",
      places: ["군성사석화", "장가계공항", "청주공항"],
      duration: "약 5~6시간",
      meals: {
        breakfast: "호텔식",
        lunch: "버섯 샤브샤브",
        dinner: "-----",
      },
      hotel: "해당 없음",
    },
];  
