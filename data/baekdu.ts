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
    flight: "ZE831",
    from: "청주",
    to: "연길",
    departure: "11:20",
    arrival: "12:45",
  },

  inbound: {
    airline: "이스타항공",
    flight: "ZE832",
    from: "연길",
    to: "청주",
    departure: "13:45",
    arrival: "18:05",
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
{/*}
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
*/}

export const faqs: FAQ[] = [
  {
    id: 1,
    question: "여권 유효기간은 얼마나 남아 있어야 하나요?",
    answer: "출발일 기준 6개월 이상 남아있는 여권이 필요합니다.",
  },
  {
    id: 2,
    question: "백두산은 비자가 필요한가요?",
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
    answer: "출발 전 최신 날씨는 아래 사이트에서 확인하실 수 있습니다.\nhttps://www.windy.com/42.905/129.504?42.404,129.504,8",
  },
];

export const includes: IncludedItem[] = [
  { id: 1, text: "왕복 항공권,유류할증료 및 공항세" },
  { id: 2, text: "전 일정 호텔(2인 1실)" },
  { id: 3, text: "특식5회(양꼬치무제한,소불고기전골,삼겹살무제한,냉면+꿔바로우)" },
  { id: 4, text: "전용 차량(리무진)&한국어 가이드&기사/가이드팁" },
  { id: 5, text: "백두산(서파)-금강대협곡,고산화원 / 백두산(북파)-장백폭포(온천계란 1인 2알)" },
  { id: 6, text: "용정(일송정+해란강-차창),용드레우물,왕흥거리+부르하통하(차장)관광" },
  { id: 7, text: "두만강 접경지대 및 공원 티타임(1인 1잔)" },
  { id: 8, text: "[특전]발+전신마사지 90분 1회(매너팁 별도)" },
  { id: 9, text: "[특전]5D플라잉체험(4박5일만 포함)" },
  { id: 10, text: "1억원 여행자보험" },
];

export const excludes: IncludedItem[] = [
  { id: 1, text: "개인경비 및 매너팁" },
  { id: 2, text: "일정 외 선택 관광" },
];  

export const hotels: Hotel[] = [
  {
    id: 1,
    name: "금수학호텔",
    grade: "★★★★★",
    image: "jinshuha.JPG",
    desc: "온천 시설을 갖춘 백두산 대표 프리미엄 호텔입니다.",
  },
  {
    id: 2,
    name: "연길 국제호텔",
    grade: "★★★★★",
    image: "guoji.jpg",
    desc: "연길 시내 중심에 위치한 쾌적한 특급 호텔입니다.",
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

export const itinerary3N4D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 연길공항 도착",
    description:
      "청주공항 출발 후 연길에 도착하여 도문을 관광후 이도백하 이동, 호텔 체크인을 진행합니다.",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/baekdu/tumen.jpg",
    places: ["청주공항", "연길공항", "도문 강변공원", "이도백하"],
    duration: "약 10시간",
    meals: {
      breakfast: "-----",
      lunch: "냉면+꿔바로우",
      dinner: "소불고기 전골",
    },
    hotel: "금수학호텔 또는 동급\n온천욕 가능:수영복 필수 지참(대여안됨)"
  },
  {
    day: "DAY 2",
    icon: "🏔️",
    title: "백두산 서파",
    description:
      "1442계단을 이동하여 백두산 서파 & 37호 경계비 & 금강대협곡 &고산화원(차창)을 관광합니다.",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/baekdu/thumb.jpg",
    places: ["서백두산", "금강대협곡", "고산화원"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "산채비빔밥",
      dinner: "삼겹살 무제한",
    },
    hotel: "금수학호텔 또는 동급\n온천욕 가능:수영복 필수 지참(대여안됨)"
  },
  {
    day: "DAY 3",
    icon: "🌄",
    title: "백두산 북파",
    description:
      "10인승 봉고차 왕복으로 백두산 북파 천문봉을 감상 후 용정&연길을 관광합니다.",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/baekdu/hero.jpg",
    places: ["북백두산", "장백폭포", "유황온천지대", "용정(일송정+해란강)", "왕흥거리+부르하통하 야경"],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "버섯 샤브샤브",
      dinner: "삼겹살 무제한",
    },
    hotel: "연길 국제호텔 또는 동급",
  },
  {
    day: "DAY 4",
    icon: "✈️",
    title: "연길공항 출발 · 청주공항 도착",
    description:
      "진달래 광장 관람 후 연길공항을 출발하여 청주공항에 도착합니다.",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/baekdu/jindalle.jpg",
    places: ["진달래 광장", "연길공항", "청주공항"],
    duration: "10시간",
    meals: {
      breakfast: "호텔식",
      lunch: "도시락",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
];  

export const itinerary4N5D: ItineraryItem[] = [
    {
      day: "DAY 1",
     icon: "✈️",
     title: "청주공항 출발 · 연길공항 도착",
     description:
      "청주공항 출발 후 연길에 도착하여 용정 관광후 이도백하로 이동, 호텔 투숙합니다.",
     image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/baekdu/yundongju.jpg",
     places: ["청주공항", "연길공항", "용정(일송정+해란강)", "윤동주생가", "이도백하"],
     duration: "약 10시간",
     meals: {
      breakfast: "-----",
      lunch: "냉면+꿔바로우",
      dinner: "소불고기 전골",
    },
    hotel: "금수학호텔 또는 동급\n온천욕 가능:수영복 필수 지참(대여안됨)"
    },
    {
      day: "DAY 2",
      icon: "🏔️",
      title: "백두산 서파",
      description:
       "1442계단을 이동하여 백두산 서파 & 37호 경계비 & 금강대협곡 &고산화원(차창)을 관광합니다.",
      image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/baekdu/thumb.jpg",
      places: ["서백두산", "금강대협곡", "고산화원"],
      duration: "전일 관광",
      meals: {
        breakfast: "호텔식",
        lunch: "현지식",
        dinner: "삼겹살 무제한",
      },
      hotel: "금수학호텔 또는 동급\n온천욕 가능:수영복 필수 지참(대여안됨)",
    },
    {
      day: "DAY 3",
      icon: "🌄",
      title: "백두산 북파",
      description:
       "10인승 봉고차 왕복으로 백두산 북파 천문봉을 감상 후 5D플라잉 체험 후 연길로 이동합니다.",
      image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/baekdu/hero.jpg",
      places: ["북백두산", "장백폭포", "유황온천지대", "5D플라잉 체험"],
      duration: "전일 관광",
      meals: {
        breakfast: "호텔식",
        lunch: "현지식",
        dinner: "산천어회+매운탕",
      },
      hotel: "연길 국제호텔 또는 동급",
    },
    {
      day: "DAY 4",
      icon: "🛬",
      title: "도문 · 연길",
      description:
        "중/조 국경지대 두만강 강변공원 관람 후 연길 시내 관광을 진행 합니다.",
      image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/baekdu/tumen.jpg",
      places: ["도문 강변 공원", "왕흥거리+부르하통하 야경"],
      duration: "약 5~6시간",
      meals: {
        breakfast: "호텔식",
        lunch: "연변요리",
        dinner: "양꼬치무제한",
      },
      hotel: "연길 국제호텔 또는 동급",
    },
    {
    day: "DAY 5",
    icon: "✈️",
    title: "연길공항 출발 · 청주공항 도착",
    description:
      "진달래 광장 관람 후 연길공항을 출발하여 청주공항에 도착합니다.",
    image: "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/baekdu/jindalle.jpg",
    places: ["진달래 광장", "연길공항", "청주공항"],
    duration: "10시간",
    meals: {
      breakfast: "호텔식",
      lunch: "도시락",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
];  
