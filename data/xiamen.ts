export type XiamenProductType =
  | "value3"
  | "premium3"
  | "premium4"
  | "wuyishan4"
  | "golf3"
  | "golf4";

export type ItineraryItem = {
  day: string;
  icon: string;
  title: string;
  description: string;
  region?: string;
  transport?: string;
  time?: string;
  schedule?: string;
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
    id: "value3" as const,
    label: "실속 3박5일",
    description: "알찬 샤먼 핵심 관광",
  },
  {
    id: "premium3" as const,
    label: "고품격 3박5일",
    description: "노옵션 프리미엄 관광",
  },
  {
    id: "premium4" as const,
    label: "고품격 4박6일",
    description: "샤먼을 여유롭게 즐기는 일정",
  },
  {
    id: "wuyishan4" as const,
    label: "무이산 4박6일",
    description: "샤먼 · 무이산 프리미엄 관광",
  },
  {
    id: "golf3" as const,
    label: "골프 3박5일",
    description: "남태무CC · 동방CC",
  },
  {
    id: "golf4" as const,
    label: "골프 4박6일",
    description: "남태무CC · 천주CC · 동방CC",
  },
];

export const flightInfo = {
  outbound: {
    airline: "이스타항공",
    flight: "ZE827",
    from: "청주",
    to: "샤먼",
    departure: "23:00",
    arrival: "01:20+1",
  },

  inbound: {
    airline: "이스타항공",
    flight: "ZE828",
    from: "샤먼",
    to: "청주",
    departure: "02:00",
    arrival: "06:20",
  },
};

export const mealBaseUrl =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/meal/xiamen/";

export const mealImages: Record<string, string> = {};

// ======================================================
// 실속 3박 5일
// ======================================================
// ======================================================
// 관광지 이미지 자동 보급소
// ======================================================

const xiamenImageBaseUrl =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/";

// ======================================================
// 호텔
// ======================================================

export const xiamenHotelBaseUrl =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/hotel/xiamen/";

export const xiamenHotels = [
  {
    id: 1,
    name: "화렉스 호텔",
    grade: "★★★★★",
    image: `${xiamenHotelBaseUrl}hualex.jpg`,
    roomImage: `${xiamenHotelBaseUrl}hualexroom.jpg`,
    desc: "샤먼 일정 중 이용하는 5성급 호텔입니다.",
  },
  {
    id: 2,
    name: "큐리오 힐튼",
    grade: "★★★★★",
    image: `${xiamenHotelBaseUrl}hilton.jpg`,
    roomImage: `${xiamenHotelBaseUrl}hiltonroom.jpg`,
    desc: "편안한 객실과 안정적인 숙박 환경을 갖춘 5성급 호텔입니다.",
  },
];

export const wuyishanHotels = [
  ...xiamenHotels,
  {
    id: 3,
    name: "무이산 윈덤 호텔",
    grade: "준5성급",
    image: `${xiamenHotelBaseUrl}whindom.jpg`,
    roomImage: `${xiamenHotelBaseUrl}whindomroom.jpg`,
    desc: "무이산 일정 중 이용하는 호텔로 편안한 휴식을 제공합니다.",
  },
];

const xiamenSpotImageMap: Record<string, string> = {
  // 샤먼
  "샤먼 국제공항": `${xiamenImageBaseUrl}xiamenairport.jpg`,

  남보타사: `${xiamenImageBaseUrl}nambotasa.jpeg`,
  백성해변: `${xiamenImageBaseUrl}baeksung.jpg`,
  "증조안 미식거리": `${xiamenImageBaseUrl}zhungjoan.jpg`,

  원림식물원: `${xiamenImageBaseUrl}wonlim.jpg`,
  중산로: `${xiamenImageBaseUrl}zhongshan.jpg`,

  고랑서: `${xiamenImageBaseUrl}golangseo.jpg`,
  민남전기쇼: `${xiamenImageBaseUrl}minnamjeonki.jpg`,

  전라갱토루: `${xiamenImageBaseUrl}jeonlagang.jpg`,
  "탑하촌 토루마을": `${xiamenImageBaseUrl}tophachon.jpg`,
  유창루: `${xiamenImageBaseUrl}yoochangru.jpg`,

  "루장강 나이트크루즈": `${xiamenImageBaseUrl}nightship.jpg`,
  "야경 유람선 선택관광": `${xiamenImageBaseUrl}nightship.jpg`,

  "해상명주탑 전망대": `${xiamenImageBaseUrl}haishangmingzhu.jpg`,

  "일월곡 온천": `${xiamenImageBaseUrl}hotwaterjpg.jpg`,
  "일월곡 온천욕 선택관광": `${xiamenImageBaseUrl}hotwaterjpg.jpg`,

  // 무이산
  천유봉: `${xiamenImageBaseUrl}chunyoubong.jpg`,
  인상대홍포쇼: `${xiamenImageBaseUrl}hongpo.jpg`,
  "무이산 구곡 뗏목투어": `${xiamenImageBaseUrl}wuyishanship.jpg`,
};

function attachXiamenImages(itinerary: ItineraryItem[]): ItineraryItem[] {
  return itinerary.map((item) => {
    // 기존에 직접 넣어놓은 사진은 그대로 보존
    const manualSpotImages = item.spotImages ?? [];

    const usedNames = new Set(manualSpotImages.map((spot) => spot.name));

    const usedImages = new Set(manualSpotImages.map((spot) => spot.image));

    // places 이름을 보고 자동 사진 보급
    const autoSpotImages =
      item.places
        ?.map((place) => {
          const image = xiamenSpotImageMap[place];

          if (!image) return null;

          return {
            name: place,
            image,
          };
        })
        .filter(
          (
            spot,
          ): spot is {
            name: string;
            image: string;
          } => spot !== null,
        )
        .filter(
          (spot) => !usedNames.has(spot.name) && !usedImages.has(spot.image),
        ) ?? [];

    const spotImages = [...manualSpotImages, ...autoSpotImages];

    return {
      ...item,

      // 메인사진이 없으면 첫 번째 관광지 사진 자동 사용
      image: item.image ?? spotImages[0]?.image,

      // 관광지 사진 자동 배치
      spotImages: spotImages.length > 0 ? spotImages : undefined,
    };
  });
}
export const itineraryValue3N5D: ItineraryItem[] = attachXiamenImages([
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 샤먼 도착",
    description:
      "청주 국제공항을 출발하여 샤먼 국제공항에 도착합니다. 가이드 미팅 후 호텔로 이동하여 투숙 및 휴식합니다.",
    region: `청주
하문`,

    transport: `ZE827
전용차량`,

    time: `20:00
23:00
01:20+1`,

    schedule: `청주 국제공항 1층 3번게이트 안쪽 에스컬레이터 앞 여행사데스크 미팅
청주 국제공항 출발 (약 3시간 20분 소요) - 이스타항공 탑승
하문 공항 도착 후 가이드 미팅
호텔 투숙 및 휴식`,
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/xiamenairport.jpg",
    imagePosition: "center 70%",
    places: ["청주 국제공항", "샤먼 국제공항"],
    duration: "샤먼 도착 후 호텔 이동",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 2",
    icon: "🌴",
    title: "원림식물원 · 중산로",
    description:
      "호텔 조식 후 오전 자유시간을 즐기고 중식 후 원림식물원과 샤먼의 대표 보행자 거리인 중산로를 관광합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전 자유일정 및 휴식
중식 후
▶ 150만평 규모의 거대한 열대·아열대 식물원인 원림식물원
▶ 하문의 명동거리로 불리는 보행자 전용 중산로 관광
선택관광(추천): 중구산 케이블카 $50/인(70세 이상 불가)
석식 후 호텔 이동 및 투숙`,
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/zhongshan.jpg",
    imagePosition: "center 70%",
    places: [
      "오전 자유일정",
      "원림식물원",
      "중산로",
      "중구산 케이블카 선택관광",
    ],
    spotImages: [
      {
        name: "원림식물원",
        image:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/wonlim.jpg",
      },
      {
        name: "중산로 관광",
        image:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/zhongshan.jpg",
      },
    ],
    duration: "오후 샤먼 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "현지식",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 3",
    icon: "🏝️",
    title: "고랑서 · 숙장화원 · 일광암",
    description:
      "고랑서로 이동하여 숙장화원과 일광암을 관광하고 다양한 현지 먹거리와 상점이 모여있는 증조안 미식거리를 둘러봅니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 고랑서 부두로 이동(약 20분 소요)
▶ 해상의 화원이라 불리는 작은 섬인 고랑서 관광
- 바다를 끼고 만들어진 아름다운 전통 정원인 숙장화원
- 해발 93m의 고랑서에서 가장 높은 봉우리 일광암
▶ 다양한 현지 먹거리와 아기자기한 상점이 모여 있는 증조안 미식거리
선택관광(추천)
1. 민남전기쇼 또는 링링서커스($50/1인)
2. 발+전신마사지 90분($60/1인)
3. 요트체험($50/1인)
석식 후 호텔 투숙 및 휴식`,
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/golangseo.jpg",
    places: [
      "고랑서",
      "숙장화원",
      "일광암",
      "증조안 미식거리",
      "민남전기쇼 또는 링링서커스 선택관광",
      "발+전신마사지 90분 선택관광",
      "요트체험 선택관광",
    ],
    spotImages: [
      {
        name: "고랑서",
        image:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/golangseo.jpg",
      },
      {
        name: "증조안 미식거리",
        image:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/zhungjoan.jpg",
      },
      {
        name: "민남전기쇼",
        image:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/minnamjeonki.jpg",
      },
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "현지식",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 4",
    icon: "🏯",
    title: "남정토루 · 전라갱토루 · 탑하촌",
    description:
      "남정토루로 이동하여 전라갱토루, 탑하촌 토루마을, 유창루를 관광합니다. 하문으로 돌아온 후 자유일정을 즐기고 공항으로 이동합니다.",
    region: `하문
남정토루
하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 남정토루로 이동(약 2시간 소요)
▶ 중국 토루 문화지역 중 가장 유명한 전라갱 지역의 전라갱토루
▶ 장씨 집성촌이며 장수마을로 알려진 탑하촌 토루마을
▶ 600~700년의 역사를 가진 원형토루인 유창루
중식 후 하문으로 이동
선택관광(추천)
1. 일월곡 온천욕($60/1인)
2. 야경 유람선($60/1인)
3. 발+전신마사지 90분($60/1인)
석식 후 자유일정
23시 공항으로 이동`,
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/tophachon.jpg",
    places: [
      "전라갱토루",
      "탑하촌 토루마을",
      "유창루",
      "일월곡 온천욕 선택관광",
      "야경 유람선 선택관광",
      "발+전신마사지 90분 선택관광",
      "공항 이동",
    ],
    spotImages: [
      {
        name: "전라갱토루",
        image:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/jeonlagang.jpg",
      },
      {
        name: "탑하촌 토루마을",
        image:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/tophachon.jpg",
      },
      {
        name: "야경유람선",
        image:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/xiamen/nightship.jpg",
      },
    ],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "현지식",
      dinner: "현지식",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 5",
    icon: "🛬",
    title: "샤먼 출발 · 청주공항 도착",
    description:
      "샤먼 국제공항을 출발하여 청주 국제공항에 도착한 후 여행을 마무리합니다.",
    region: `하문
청주`,

    transport: `ZE828`,

    time: `02:00
06:20`,

    schedule: `하문 국제공항 출발 - 이스타항공 탑승
청주 국제공항 도착 후 해산
♣ 즐거운 여행되세요. 감사합니다. ♣`,
    image:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/cjj.jpg",
    places: ["샤먼 국제공항", "청주 국제공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
]);

// ======================================================
// 고품격 3박 5일
// ======================================================

export const itineraryPremium3N5D: ItineraryItem[] = attachXiamenImages([
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 샤먼 도착",
    description:
      "청주 국제공항을 출발하여 샤먼 국제공항에 도착합니다. 가이드 미팅 후 호텔로 이동하여 투숙 및 휴식합니다.",
    region: `청주
하문`,

    transport: `ZE827
전용차량`,

    time: `20:00
23:00
01:20+1`,

    schedule: `청주 국제공항 1층 3번게이트 안 좌측 여행사 미팅 데스크 미팅
청주 국제공항 출발 (약 3시간 20분 소요) - 이스타항공 탑승
하문 공항 도착 후 가이드 미팅
호텔 투숙 및 휴식`,
    places: ["청주 국제공항", "샤먼 국제공항"],
    duration: "샤먼 도착 후 호텔 이동",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 2",
    icon: "🛕",
    title: "남보타사 · 백성해변 · 증조안",
    description:
      "오전 자유일정 후 남보타사와 백성해변, 증조안 미식거리를 관광하고 특전으로 발+전신마사지 90분을 진행합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전 자유일정 및 휴식
중식 후
▶ 당나라 시대에 창건된 1,000년이 넘는 역사를 가진 남보타사
▶ 하문에서 가장 활기찬 해변가인 백성해변
▶ 다양한 현지 먹거리와 아기자기한 상점이 모여 있는 증조안 미식거리
[특전] 발+전신마사지 90분 1회(매너팁 별도)
석식 후 호텔 이동 및 투숙`,
    places: ["남보타사", "백성해변", "증조안 미식거리", "발+전신마사지 90분"],
    duration: "오후 샤먼 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "딤섬",
      dinner: "호남요리",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 3",
    icon: "🏝️",
    title: "고랑서 · 민남전기쇼",
    description:
      "고랑서에서 숙장화원과 일광암을 관광한 후 민남전기쇼를 관람하고 원당호, 샤포웨이 또는 해만공원 중 카페거리를 방문합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 고랑서 부두로 이동(약 20분 소요)
▶ 해상의 화원이라 불리는 작은 섬인 고랑서 관광
- 바다를 끼고 만들어진 아름다운 전통 정원인 숙장화원(전동카 편도)
- 해발 93m의 고랑서에서 가장 높은 봉우리 일광암
중식 후
▶ 세계 최초의 360도 회전식 객석이 있는 초대형 실내 공연 민남전기쇼
▶ 원당호 또는 샤포웨이 또는 해만공원 중 카페거리 방문
석식 후 호텔 투숙 및 휴식`,
    places: [
      "고랑서",
      "숙장화원 전동카 편도",
      "일광암",
      "민남전기쇼",
      "카페거리",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "동북요리",
      dinner: "삼겹살 무제한",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 4",
    icon: "🌃",
    title: "남정토루 · 중산로 · 야경유람선",
    description:
      "전라갱토루와 탑하촌, 유창루를 관광한 후 샤먼으로 돌아와 중산로를 둘러보고 루장강 나이트크루즈를 탑승합니다.",
    region: `하문
남정토루
하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 남정토루로 이동(약 2시간 소요)
▶ 중국 토루 문화지역 중 가장 유명한 전라갱 지역의 전라갱토루
▶ 장씨 집성촌이며 장수마을로 알려진 탑하촌 토루마을
▶ 600~700년의 역사를 가진 원형토루인 유창루
중식 후 하문으로 이동
▶ 하문의 명동거리로 불리는 보행자 전용 중산로 관광
석식 후
[특전] 신야경유람선(루장강 나이트크루즈) 탑승 후 야경감상(약 1시간)
자유일정 진행 후 23시 공항으로 이동`,
    places: [
      "전라갱토루",
      "탑하촌 토루마을",
      "유창루",
      "중산로",
      "루장강 나이트크루즈",
      "공항 이동",
    ],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "객가요리",
      dinner: "항주요리",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 5",
    icon: "🛬",
    title: "샤먼 출발 · 청주공항 도착",
    description:
      "샤먼 국제공항을 출발하여 청주 국제공항에 도착한 후 여행을 마무리합니다.",
    region: `하문
청주`,

    transport: `ZE828`,

    time: `02:00
06:20`,

    schedule: `하문 국제공항 출발 - 이스타항공 탑승
청주 국제공항 도착 후 해산
♣ 즐거운 여행되세요. 감사합니다. ♣`,
    places: ["샤먼 국제공항", "청주 국제공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
]);

// ======================================================
// 고품격 4박 6일
// ======================================================

export const itineraryPremium4N6D: ItineraryItem[] = attachXiamenImages([
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 샤먼 도착",
    description:
      "청주 국제공항을 출발하여 샤먼 국제공항에 도착합니다. 가이드 미팅 후 호텔로 이동하여 투숙 및 휴식합니다.",
    region: `청주
하문`,

    transport: `ZE827
전용차량`,

    time: `20:00
23:00
01:20+1`,

    schedule: `청주 국제공항 1층 3번게이트 안 좌측 여행사 미팅 데스크 미팅
청주 국제공항 출발 (약 3시간 20분 소요) - 이스타항공 탑승
하문 공항 도착 후 가이드 미팅
호텔 투숙 및 휴식`,
    places: ["청주 국제공항", "샤먼 국제공항"],
    duration: "샤먼 도착 후 호텔 이동",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 2",
    icon: "🛕",
    title: "남보타사 · 백성해변 · 증조안",
    description:
      "오전 자유일정 후 남보타사, 백성해변과 증조안 미식거리를 관광하고 발+전신마사지 90분을 진행합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전 자유일정 및 휴식
중식 후
▶ 당나라 시대에 창건된 1,000년이 넘는 역사를 가진 남보타사
▶ 하문에서 가장 활기찬 해변가인 백성해변
▶ 다양한 현지 먹거리와 아기자기한 상점이 모여 있는 증조안 미식거리
[특전] 발+전신마사지 90분 1회(매너팁 별도)
석식 후 호텔 이동 및 투숙`,
    places: ["남보타사", "백성해변", "증조안 미식거리", "발+전신마사지 90분"],
    duration: "오후 샤먼 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "딤섬",
      dinner: "호남요리",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 3",
    icon: "🏝️",
    title: "고랑서 · 민남전기쇼",
    description:
      "고랑서에서 숙장화원과 일광암을 관광한 후 민남전기쇼를 관람하고 카페거리를 방문합니다.",
    region: `하문`,
    transport: `전용차량`,
    time: `전일`,
    schedule: `호텔 조식 후 고랑서 부두로 이동(약 20분 소요)
▶ 해상의 화원이라 불리는 작은 섬인 고랑서 관광
- 바다를 끼고 만들어진 아름다운 전통 정원인 숙장화원(전동카 편도)
- 해발 93m의 고랑서에서 가장 높은 봉우리 일광암
중식 후
▶ 세계 최초의 360도 회전식 객석이 있는 초대형 실내 공연 민남전기쇼
▶ 원당호 또는 샤포웨이 또는 해만공원 중 카페거리 방문
석식 후 호텔 투숙 및 휴식`,
    places: [
      "고랑서",
      "숙장화원 전동카 편도",
      "일광암",
      "민남전기쇼",
      "카페거리",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "동북요리",
      dinner: "삼겹살 무제한",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 4",
    icon: "🌃",
    title: "남정토루 · 중산로 · 야경유람선",
    description:
      "전라갱토루와 탑하촌, 유창루를 관광한 후 샤먼으로 돌아와 중산로와 루장강 나이트크루즈를 즐깁니다.",
    region: `하문
남정토루
하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 남정토루로 이동(약 2시간 소요)
▶ 중국 토루 문화지역 중 가장 유명한 전라갱 지역의 전라갱토루
▶ 장씨 집성촌이며 장수마을로 알려진 탑하촌 토루마을
▶ 600~700년의 역사를 가진 원형토루인 유창루
중식 후 하문으로 이동
▶ 하문의 명동거리로 불리는 보행자 전용 중산로 관광
석식 후
[특전] 신야경유람선(루장강 나이트크루즈) 탑승 후 야경감상(약 1시간)
호텔 투숙 및 휴식`,
    places: [
      "전라갱토루",
      "탑하촌 토루마을",
      "유창루",
      "중산로",
      "루장강 나이트크루즈",
    ],
    duration: "전일 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "객가요리",
      dinner: "항주요리",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 5",
    icon: "♨️",
    title: "해상명주탑 · 원림식물원 · 일월곡 온천",
    description:
      "해상명주탑 전망대와 카페거리, 샤먼시 박물관을 둘러본 후 원림식물원과 일월곡 온천을 즐기고 공항으로 이동합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후
▶ 하문의 랜드마크인 해상명주탑 전망대
▶ 원당호 또는 샤포웨이 또는 해만공원 중 카페거리 방문
▶ 하문의 역사와 문화를 보여주는 종합박물관인 하문시 박물관
중식 후
▶ 150만평 규모의 거대한 열대·아열대 식물원인 원림식물원
▶ 100여 개의 야외 온천탕과 40개의 특색 있는 테마탕을 갖춘 일월곡 온천욕
※ 수영복·래쉬가드 필수 지참
자유일정 진행 후 23시 공항으로 이동`,
    places: [
      "해상명주탑 전망대",
      "카페거리",
      "샤먼시 박물관",
      "원림식물원",
      "일월곡 온천",
      "공항 이동",
    ],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "한식",
      dinner: "샤브샤브 무제한",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 6",
    icon: "🛬",
    title: "샤먼 출발 · 청주공항 도착",
    description:
      "샤먼 국제공항을 출발하여 청주 국제공항에 도착한 후 여행을 마무리합니다.",
    region: `하문
청주`,

    transport: `ZE828`,

    time: `02:00
06:20`,

    schedule: `하문 국제공항 출발 - 이스타항공 탑승
청주 국제공항 도착 후 해산
♣ 즐거운 여행되세요. 감사합니다. ♣`,
    places: ["샤먼 국제공항", "청주 국제공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
]);

// ======================================================
// 무이산 고품격 4박 6일
// ======================================================

export const itineraryWuyishan4N6D: ItineraryItem[] = attachXiamenImages([
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 샤먼 도착",
    description:
      "청주 국제공항을 출발하여 샤먼 국제공항에 도착합니다. 가이드 미팅 후 호텔로 이동합니다.",
    region: `청주
하문`,

    transport: `ZE827
전용차량`,

    time: `20:00
23:00
01:20+1`,

    schedule: `청주 국제공항 1층 3번게이트 안 좌측 여행사 미팅 데스크 미팅
청주 국제공항 출발 (약 3시간 20분 소요) - 이스타항공 탑승
하문 공항 도착 후 가이드 미팅
호텔 투숙 및 휴식`,
    places: ["청주 국제공항", "샤먼 국제공항"],
    duration: "샤먼 도착 후 호텔 이동",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 2",
    icon: "🛕",
    title: "남보타사 · 백성해변 · 증조안",
    description:
      "남보타사와 백성해변, 증조안 미식거리를 관광하고 발+전신마사지 90분을 진행합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전 자유일정 및 휴식
중식 후
▶ 당나라 시대에 창건된 1,000년이 넘는 역사를 가진 남보타사
▶ 하문에서 가장 활기찬 해변가인 백성해변
▶ 다양한 현지 먹거리와 아기자기한 상점이 모여 있는 증조안 미식거리
[특전] 발+전신마사지 90분 1회(매너팁 별도)
석식 후 호텔 이동 및 투숙`,
    places: ["남보타사", "백성해변", "증조안 미식거리", "발+전신마사지 90분"],
    duration: "오후 샤먼 관광",
    meals: {
      breakfast: "호텔식",
      lunch: "딤섬",
      dinner: "호남요리",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 3",
    icon: "🚄",
    title: "고랑서 관광 · 무이산 이동",
    description:
      "고랑서의 숙장화원과 일광암을 관광한 후 열차를 이용해 무이산으로 이동합니다. 석식 후 인상대홍포쇼를 관람합니다.",
    region: `하문
무이산`,

    transport: `전용차량
열차`,

    time: `전일
14:15
17:11`,

    schedule: `호텔 조식 후 고랑서 부두로 이동(약 20분 소요)
▶ 해상의 화원이라 불리는 작은 섬인 고랑서 관광
- 바다를 끼고 만들어진 아름다운 전통 정원인 숙장화원(전동카 편도)
- 해발 93m의 고랑서에서 가장 높은 봉우리 일광암
중식 후 열차편으로 무이산으로 이동
무이산 도착 후 석식
▶ 세계 유일 야외 360도 회전관객석과 무이산 산수를 배경으로 펼쳐지는 인상대홍포쇼
호텔 투숙 및 휴식`,
    places: [
      "고랑서",
      "숙장화원 전동카 편도",
      "일광암",
      "무이산 열차 이동",
      "인상대홍포쇼",
    ],
    duration: "고랑서 관광 후 무이산 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "동북요리",
      dinner: "버섯요리",
    },
    hotel: "무이산 윈덤 호텔 또는 동급 ★★★★★",
  },

  {
    day: "DAY 4",
    icon: "⛰️",
    title: "무이산 · 천유봉 · 구곡 뗏목투어",
    description:
      "무이산의 일선천과 다동, 천유봉을 관광하고 구곡 뗏목투어와 송대 옛거리를 둘러본 뒤 고속열차로 샤먼으로 돌아옵니다.",
    region: `무이산
하문`,

    transport: `전용차량
고속열차`,

    time: `전일
16:45
19:08`,

    schedule: `호텔 조식 후
▶ 무이산 관광
- 거대한 협곡 사이 한 줄기 선처럼 보이는 좁은 암벽의 일선천
- 천유봉 바로 아래 숨겨진 계곡이자 분지 형태인 다동
- 848개의 돌계단을 따라 올라가는 무이산 최고의 절경 천유봉 등정
중식 후
▶ 무이산 핵심 코스인 9곡에서 1곡까지 펼쳐지는 뗏목투어
▶ 송나라 시대의 건축양식을 재현한 송대 옛거리 관람
열차역으로 이동 후 무이산 출발
하문 도착 후 석식 및 호텔 투숙`,
    places: [
      "일선천",
      "다동",
      "천유봉",
      "무이산 구곡 뗏목투어",
      "송대 옛거리",
      "고속열차",
    ],
    duration: "무이산 전일 관광 후 샤먼 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "농가요리",
      dinner: "삼겹살 무제한",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 5",
    icon: "🏯",
    title: "남정토루 · 중산로 · 야경유람선",
    description:
      "전라갱토루, 탑하촌 토루마을과 유창루를 관광하고 샤먼으로 돌아와 중산로와 루장강 나이트크루즈를 즐긴 후 공항으로 이동합니다.",
    region: `하문
남정토루
하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 남정토루로 이동(약 2시간 소요)
▶ 중국 토루 문화지역 중 가장 유명한 전라갱 지역의 전라갱토루
▶ 장씨 집성촌이며 장수마을로 알려진 탑하촌 토루마을
▶ 600~700년의 역사를 가진 원형토루인 유창루
중식 후 하문으로 이동
▶ 하문의 명동거리로 불리는 보행자 전용 중산로 관광
석식 후
[특전] 신야경유람선(루장강 나이트크루즈) 탑승 후 야경감상(약 1시간)
자유일정 진행 후 23시 공항으로 이동`,
    places: [
      "전라갱토루",
      "탑하촌 토루마을",
      "유창루",
      "중산로",
      "루장강 나이트크루즈",
      "공항 이동",
    ],
    duration: "전일 관광 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "객가요리",
      dinner: "샤브샤브 무제한",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 6",
    icon: "🛬",
    title: "샤먼 출발 · 청주공항 도착",
    description:
      "샤먼 국제공항을 출발하여 청주 국제공항에 도착한 후 여행을 마무리합니다.",
    region: `하문
청주`,

    transport: `ZE828`,

    time: `02:00
06:20`,

    schedule: `하문 국제공항 출발 - 이스타항공 탑승
청주 국제공항 도착 후 해산
♣ 즐거운 여행되세요. 감사합니다. ♣`,
    places: ["샤먼 국제공항", "청주 국제공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
]);

// ======================================================
// 골프 3박 5일
// ======================================================

export const itineraryGolf3N5D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 샤먼 도착",
    description:
      "청주 국제공항을 출발하여 샤먼 국제공항에 도착한 후 호텔로 이동합니다.",
    region: `청주
하문`,

    transport: `ZE827
전용차량`,

    time: `20:00
23:00
01:20+1`,

    schedule: `청주 국제공항 1층 3번게이트 안 좌측 여행사 미팅 데스크 미팅
청주 국제공항 출발 (약 3시간 20분 소요) - 이스타항공 탑승
하문 공항 도착 후 가이드 미팅
호텔 투숙 및 휴식`,
    places: ["청주 국제공항", "샤먼 국제공항"],
    duration: "샤먼 도착",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 2",
    icon: "⛳",
    title: "남태무 CC · 18홀",
    description:
      "호텔 조식 후 남태무 골프장으로 이동하여 18홀 라운딩을 즐긴 후 호텔로 돌아옵니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전 자유일정 및 휴식
남태무 골프장으로 이동(약 40분 소요)
▶ 남태무CC 18홀 라운딩
- 1996년에 개장한 바다와 산을 끼고 있는 18홀 규모의 골프장
- 7,324야드의 동쪽은 바다, 남쪽으로는 남태무산을 끼고 있습니다.
석식 후 호텔 투숙 및 휴식`,
    places: ["남태무 CC", "18홀 라운딩"],
    duration: "전일 골프",
    meals: {
      breakfast: "호텔식",
      lunch: "클럽중식 불포함",
      dinner: "현지식",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 3",
    icon: "🏌️",
    title: "남태무 CC · 18홀",
    description: "남태무 골프장으로 이동하여 두 번째 18홀 라운딩을 진행합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후
남태무 골프장으로 이동(약 40분 소요)
▶ 남태무CC 18홀 라운딩
- 1996년에 개장한 바다와 산을 끼고 있는 18홀 규모의 골프장
- 7,324야드의 동쪽은 바다, 남쪽으로는 남태무산을 끼고 있습니다.
석식 후 호텔 투숙 및 휴식`,
    places: ["남태무 CC", "18홀 라운딩"],
    duration: "전일 골프",
    meals: {
      breakfast: "호텔식",
      lunch: "클럽중식 불포함",
      dinner: "현지식",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 4",
    icon: "⛳",
    title: "동방 CC · 18홀",
    description:
      "호텔 조식 후 동방 골프장으로 이동하여 18홀 라운딩을 즐기고 석식 후 공항으로 이동합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전
동방 골프장으로 이동(약 10분 소요)
▶ 동방CC 18홀 라운딩
- 1995년에 오픈한 로널드 프림이 설계한 27홀 규모의 명문 골프장
- 10,665야드, 27홀, 파 108 규모의 골프장입니다.
- 세계 100대 골프장에 선정된 바 있는 명문 골프장입니다.
석식 후 자유일정
23시 공항으로 이동`,
    places: ["동방 CC", "18홀 라운딩", "공항 이동"],
    duration: "전일 골프 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "클럽중식 불포함",
      dinner: "현지식",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 5",
    icon: "🛬",
    title: "샤먼 출발 · 청주공항 도착",
    description:
      "샤먼 국제공항을 출발하여 청주 국제공항에 도착한 후 여행을 마무리합니다.",
    region: `하문
청주`,

    transport: `ZE828`,

    time: `02:00
06:20`,

    schedule: `하문 국제공항 출발 - 이스타항공 탑승
청주 국제공항 도착 후 해산
♣ 즐거운 여행되세요. 감사합니다. ♣`,
    places: ["샤먼 국제공항", "청주 국제공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
];

// ======================================================
// 골프 4박 6일
// ======================================================

export const itineraryGolf4N6D: ItineraryItem[] = [
  {
    day: "DAY 1",
    icon: "✈️",
    title: "청주공항 출발 · 샤먼 도착",
    description:
      "청주 국제공항을 출발하여 샤먼 국제공항에 도착한 후 호텔로 이동합니다.",
    region: `청주
하문`,

    transport: `ZE827
전용차량`,

    time: `20:00
23:00
01:20+1`,

    schedule: `청주 국제공항 1층 3번게이트 안 좌측 여행사 미팅 데스크 미팅
청주 국제공항 출발 (약 3시간 20분 소요) - 이스타항공 탑승
하문 공항 도착 후 가이드 미팅
호텔 투숙 및 휴식`,
    places: ["청주 국제공항", "샤먼 국제공항"],
    duration: "샤먼 도착",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 2",
    icon: "⛳",
    title: "남태무 CC · 18홀",
    description:
      "호텔 조식 후 남태무 골프장으로 이동하여 18홀 라운딩을 즐깁니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전 자유일정 및 휴식
남태무 골프장으로 이동(약 40분 소요)
▶ 남태무CC 18홀 라운딩
- 1996년에 개장한 바다와 산을 끼고 있는 18홀 규모의 골프장
- 7,324야드의 동쪽은 바다, 남쪽으로는 남태무산을 끼고 있습니다.
석식 후 호텔 투숙 및 휴식`,
    places: ["남태무 CC", "18홀 라운딩"],
    duration: "전일 골프",
    meals: {
      breakfast: "호텔식",
      lunch: "클럽중식 불포함",
      dinner: "현지식",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 3",
    icon: "🏌️",
    title: "남태무 CC · 18홀",
    description: "남태무 골프장으로 이동하여 두 번째 18홀 라운딩을 진행합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전 자유일정 및 휴식
남태무 골프장으로 이동(약 40분 소요)
▶ 남태무CC 18홀 라운딩
- 1996년에 개장한 바다와 산을 끼고 있는 18홀 규모의 골프장
- 7,324야드의 동쪽은 바다, 남쪽으로는 남태무산을 끼고 있습니다.
석식 후 호텔 투숙 및 휴식`,
    places: ["남태무 CC", "18홀 라운딩"],
    duration: "전일 골프",
    meals: {
      breakfast: "호텔식",
      lunch: "클럽중식 불포함",
      dinner: "현지식",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 4",
    icon: "⛳",
    title: "천주 CC · 18홀",
    description:
      "천주 골프장으로 이동하여 18홀 라운딩을 진행한 후 샤먼으로 돌아옵니다.",
    region: `하문
천주
하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전 자유일정 및 휴식
천주 골프장으로 이동(약 1시간 10분 소요)
▶ 천주CC 18홀 라운딩
- 천주 4대 명산 중 자모산 자락에 위치한 18홀 규모의 골프장
- 산과 계곡을 따라 설계되어 있으며 도전적인 레이아웃으로 난이도 상급
하문으로 이동(약 1시간 10분 소요)
석식 후 호텔 투숙 및 휴식`,
    places: ["천주 CC", "18홀 라운딩"],
    duration: "전일 골프",
    meals: {
      breakfast: "호텔식",
      lunch: "클럽중식 불포함",
      dinner: "현지식",
    },
    hotel: "화렉스 호텔 / 큐리오 힐튼 또는 동급 ★★★★★",
  },

  {
    day: "DAY 5",
    icon: "🏌️",
    title: "동방 CC · 18홀",
    description:
      "동방 골프장으로 이동하여 18홀 라운딩을 즐긴 후 석식과 자유일정을 진행하고 공항으로 이동합니다.",
    region: `하문`,

    transport: `전용차량`,

    time: `전일`,

    schedule: `호텔 조식 후 오전
동방 골프장으로 이동(약 10분 소요)
▶ 동방CC 18홀 라운딩
- 1995년에 오픈한 로널드 프림이 설계한 27홀 규모의 명문 골프장
- 10,665야드, 27홀, 파 108 규모의 골프장입니다.
- 세계 100대 골프장에 선정된 바 있는 명문 골프장입니다.
석식 후 자유일정
23시 공항으로 이동`,
    places: ["동방 CC", "18홀 라운딩", "공항 이동"],
    duration: "전일 골프 후 공항 이동",
    meals: {
      breakfast: "호텔식",
      lunch: "클럽중식 불포함",
      dinner: "현지식",
    },
    hotel: "기내 숙박",
  },

  {
    day: "DAY 6",
    icon: "🛬",
    title: "샤먼 출발 · 청주공항 도착",
    description:
      "샤먼 국제공항을 출발하여 청주 국제공항에 도착한 후 여행을 마무리합니다.",
    region: `하문
청주`,

    transport: `ZE828`,

    time: `02:00
06:20`,

    schedule: `하문 국제공항 출발 - 이스타항공 탑승
청주 국제공항 도착 후 해산
♣ 즐거운 여행되세요. 감사합니다. ♣`,
    places: ["샤먼 국제공항", "청주 국제공항"],
    duration: "귀국",
    meals: {
      breakfast: "-----",
      lunch: "-----",
      dinner: "-----",
    },
    hotel: "해당없음",
  },
];

// ============================================================
// 포함 / 불포함
// ============================================================

export const includesValue3 = [
  { id: 1, text: "왕복항공료(TAX · 유류할증료)" },
  { id: 2, text: "5성급 호텔 2인 1실" },
  { id: 3, text: "현지 일정상 식사" },
  { id: 4, text: "전용차량" },
  { id: 5, text: "관광지 입장료" },
  { id: 6, text: "여행자보험" },
];

export const excludesValue3 = [
  { id: 1, text: "기사 · 가이드팁 400위안 / 1인" },
  { id: 2, text: "선택관광 비용" },
  { id: 3, text: "매너팁 및 기타 개인경비" },
  { id: 4, text: "싱글차지 +$101 / 1인(3박)" },
];

export const includesPremium3 = [
  { id: 1, text: "왕복항공료(TAX · 유류할증료)" },
  { id: 2, text: "5성급 호텔 2인 1실" },
  {
    id: 3,
    text: "전 일정 식사 · 특식6회(딤섬, 호남요리, 동북요리, 삼겹살 무제한, 객가요리, 항주요리)",
  },
  { id: 4, text: "전용차량" },
  { id: 5, text: "관광지 입장료 · 여행자보험(1억원)" },
  {
    id: 6,
    text: "특전[발+전신마사지 90분 1회(매너팁별도), 숙장화원(전동카 편도),민남전기쇼, 야경 유람선]",
  },
  { id: 7, text: "기사 · 가이드팁" },
];

export const excludesPremium3 = [
  { id: 1, text: "마사지 매너팁" },
  { id: 2, text: "기타 개인경비" },
  { id: 3, text: "싱글차지 +$101 / 1인(3박)" },
];

export const includesPremium4 = [
  { id: 1, text: "왕복항공료(TAX · 유류할증료)" },
  { id: 2, text: "5성급 호텔 2인 1실" },
  {
    id: 3,
    text: "전 일정 식사 · 특식8회(딤섬, 호남요리, 동북요리, 삼겹살 무제한, 객가요리, 항주요리, 한식, 샤브샤브무제한)",
  },
  { id: 4, text: "전용차량" },
  { id: 5, text: "관광지 입장료 · 여행자보험(1억원)" },
  {
    id: 6,
    text: "특전[발+전신마사지 90분 1회(매너팁별도),숙장화원(전동카 편도),민남전기쇼,해상명주탑,일월곡 온천욕,야경 유람선]",
  },
  { id: 7, text: "기사 · 가이드팁" },
];

export const excludesPremium4 = [
  { id: 1, text: "마사지 매너팁" },
  { id: 2, text: "기타 개인경비" },
  { id: 3, text: "싱글차지 +$135 / 1인(4박)" },
];

export const includesWuyishan4 = [
  { id: 1, text: "왕복항공료(TAX · 유류할증료)" },
  {
    id: 2,
    text: "샤먼 5성급 3박 + 무이산 준5성급 1박(2인 1실)",
  },
  {
    id: 3,
    text: "전 일정 식사 · 특식8회(딤섬, 호남요리, 동북요리, 버섯요리, 삼겹살 무제한, 농가요리, 객가요리, 샤브샤브 무제한)",
  },
  { id: 4, text: "전용차량" },
  { id: 5, text: "관광지 입장료 · 여행자보험(1억원)" },
  {
    id: 6,
    text: "[특전] 발+전신마사지 90분 1회(매너팁별도), 숙장화원(전동카 편도), 인상대홍포쇼, 무이산 뗏목투어,야경 유람선",
  },
  { id: 7, text: "스루가이드 및 기사 · 가이드팁" },
];

export const excludesWuyishan4 = [
  { id: 1, text: "마사지 매너팁" },
  { id: 2, text: "기타 개인경비" },
  { id: 3, text: "싱글차지 +$125 / 1인(4박)" },
];

export const includesGolf3 = [
  { id: 1, text: "왕복항공료(TAX · 유류할증료)" },
  { id: 2, text: "5성급 호텔 2인 1실" },
  { id: 3, text: "전용차량" },
  { id: 4, text: "조식+석식" },
  { id: 5, text: "여행자보험" },
  { id: 6, text: "54홀 그린피+캐디피(2인1캐디)+카트비(2인1카트)" },
  { id: 7, text: "미팅&샌딩비" },
];

export const excludesGolf3 = [
  { id: 1, text: "클럽 중식 약 100위안 / 1인~" },
  {
    id: 2,
    text: "캐디팁(2인 1캐디) 18홀 150위안 / 1인",
  },
  { id: 3, text: "기타 개인경비" },
  { id: 4, text: "싱글차지 +$101 / 1인(3박)" },
];

export const includesGolf4 = [
  { id: 1, text: "왕복항공료(TAX · 유류할증료)" },
  { id: 2, text: "5성급 호텔 2인 1실" },
  { id: 3, text: "전용차량" },
  { id: 4, text: "석식" },
  { id: 5, text: "여행자보험" },
  { id: 6, text: "72홀 그린피+캐디피(2인1캐디)+카트비(2인1카트)" },
  { id: 7, text: "미팅&샌딩비" },
];

export const excludesGolf4 = [
  { id: 1, text: "클럽 중식" },
  {
    id: 2,
    text: "캐디팁(2인 1캐디) 18홀 150위안 / 1인",
  },
  { id: 3, text: "기타 개인경비" },
  { id: 4, text: "싱글차지 +$135 / 1인(4박)" },
];

// ============================================================
// 쇼핑
// ============================================================

export const shoppingXiamen = [
  {
    id: 1,
    title: "찻집",
    desc: "중국 전통차와 차 문화를 만나볼 수 있는 쇼핑센터입니다.",
  },
  {
    id: 2,
    title: "라텍스",
    desc: "천연 라텍스 침구 및 생활용품을 둘러보는 쇼핑센터입니다.",
  },
  {
    id: 3,
    title: "침향",
    desc: "침향 관련 제품을 소개하는 쇼핑센터입니다.",
  },
];
// ============================================================
// FAQ
// ============================================================

export const faqs = [
  {
    id: 1,
    question: "샤먼 상품은 언제 출발하나요?",
    answer:
      "2026년 12월 3일부터 2027년 3월 25일까지 운항하며, 목요일은 3박5일, 일요일은 4박6일 일정으로 출발합니다.",
  },
  {
    id: 2,
    question: "최소 출발 인원은 몇 명인가요?",
    answer:
      "관광상품은 최소 10명 이상, 골프상품은 최소 4명부터 진행 가능합니다.",
  },
  {
    id: 3,
    question: "쇼핑센터 방문이 있나요?",
    answer:
      "관광상품은 찻집·라텍스·침향 중 2곳을 방문하며, 골프상품은 노쇼핑으로 진행됩니다.",
  },
  {
    id: 4,
    question: "기사·가이드팁은 상품가에 포함되어 있나요?",
    answer:
      "고품격 및 무이산 상품은 기사·가이드팁이 포함되어 있습니다. 실속상품과 골프상품은 코스별 불포함 비용이 있으므로 선택하신 상품의 포함·불포함 사항을 확인해주세요.",
  },
  {
    id: 5,
    question: "이스타항공 위탁수하물은 몇 kg인가요?",
    answer: "이스타항공 위탁수하물은 1인 15kg, 1Bag 기준입니다.",
  },
  {
    id: 6,
    question: "호텔은 어떤 등급을 이용하나요?",
    answer:
      "샤먼 일정은 5성급 호텔 2인1실 기준이며, 하문+무이산 상품은 샤먼 5성급 호텔과 무이산 준5성급 호텔을 이용합니다.",
  },
  {
    id: 7,
    question: "싱글룸 이용 시 추가요금이 있나요?",
    answer:
      "네. 3박5일은 상품에 따라 +$101/인, 일반 4박6일은 +$135/인, 하문+무이산 4박6일은 +$125/인 기준입니다.",
  },
  {
    id: 8,
    question: "골프상품에는 어떤 비용이 별도인가요?",
    answer:
      "클럽 중식, 캐디팁, 캐디피·전동카, 미팅·샌딩비 및 기타 개인경비가 별도입니다. 상세 금액은 선택하신 골프 일정의 불포함 사항에서 확인할 수 있습니다.",
  },
  {
    id: 9,
    question: "하문 날씨는 어디에서 확인할 수 있나요?",
    answer: "출발 전 하문의 최신 날씨는 아래 사이트에서 확인하실 수 있습니다.",
    link: "https://www.windy.com/24.451/118.173?24.402,118.190,11",
  },
];
