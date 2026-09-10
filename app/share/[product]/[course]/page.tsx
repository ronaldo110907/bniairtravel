import { notFound } from "next/navigation";

import {
  flightInfo as zhangjiajieFlightInfo,
  itinerary3N4D as zhangjiajie3N4D,
  itinerary4N5D as zhangjiajie4N5D,
  hotels as zhangjiajieHotels,
  includes as zhangjiajieIncludes,
  excludes as zhangjiajieExcludes,
} from "@/data/zhangjiajie";

import {
  flightInfo as baekduFlightInfo,
  itinerary3N4D as baekdu3N4D,
  itinerary4N5D as baekdu4N5D,
  hotels as baekduHotels,
  includes as baekduIncludes,
  excludes as baekduExcludes,
} from "@/data/baekdu";

import {
  flightInfo as phuquocFlightInfo,
  itineraryPremium as phuquocPremium,
  itineraryQuality as phuquocQuality,
  itineraryValue as phuquocValue,
  itineraryGolf as phuquocGolf,
  hotelsPremium as phuquocHotelsPremium,
  hotelsQuality as phuquocHotelsQuality,
  hotelsValue as phuquocHotelsValue,
  hotelsGolf as phuquocHotelsGolf,
  includesPremium as phuquocIncludesPremium,
  includesQuality as phuquocIncludesQuality,
  includesValue as phuquocIncludesValue,
  includesGolf as phuquocIncludesGolf,
  excludesPremium as phuquocExcludesPremium,
  excludesQuality as phuquocExcludesQuality,
  excludesValue as phuquocExcludesValue,
  excludesGolf as phuquocExcludesGolf,
} from "@/data/phuquoc";

import {
  flightInfo as guilinFlightInfo,
  itineraryGuilin3N5D,
  itineraryGuilin4N6D,
  itineraryChenzhou3N5D,
  itineraryChenzhou4N6D,
  hotels as guilinHotels,
  includesGuilin,
  excludesGuilin,
  includesChenzhou,
  excludesChenzhou,
} from "@/data/guilin";

import {
  flightInfo as xiamenFlightInfo,
  itineraryValue3N5D,
  itineraryPremium3N5D,
  itineraryValue4N6D,
  itineraryPremium4N6D,
  itineraryWuyishan4N6D,
  itineraryGolf3N5D,
  itineraryGolf4N6D,
  includesValue3,
  excludesValue3,
  includesValue4,
  excludesValue4,
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
  xiamenHotels,
  wuyishanHotels,
  golfImageMap,
} from "@/data/xiamen";

type ShareItem = {
  day?: string;
  title?: string;
  description?: string;
  schedule?: string;
  duration?: string;
  icon?: string;
  image?: string;
  imagePosition?: string;
  places?: string[];
  spotImages?: {
    name: string;
    image: string;
  }[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  hotel?: string;
};

type ShareFlight = {
  airline: string;
  flight: string;
  from: string;
  departure: string;
  to: string;
  arrival: string;
};

type ShareFlightInfo = {
  outbound: ShareFlight;
  inbound: ShareFlight;
};

type ShareHotel = {
  id?: number | string;
  name: string;
  grade?: string;
  desc?: string;
  image?: string;
  roomImage?: string;
};

type ShareListItem = {
  id?: number | string;
  text: string;
};

type ShareCourse = {
  name: string;
  itinerary: ShareItem[];
  hotels: ShareHotel[];
  includes: ShareListItem[];
  excludes: ShareListItem[];
};

type ShareProduct = {
  name: string;
  poster: string;
  flightInfo: ShareFlightInfo;
  courses: Record<string, ShareCourse>;
};

const shareProducts: Record<string, ShareProduct> = {
  zhangjiajie: {
    name: "장가계",
    poster:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/zhangjiajie.png",
    flightInfo: zhangjiajieFlightInfo,
    courses: {
      "3n4d": {
        name: "3박4일",
        itinerary: zhangjiajie3N4D as ShareItem[],
        hotels: zhangjiajieHotels as ShareHotel[],
        includes: zhangjiajieIncludes as ShareListItem[],
        excludes: zhangjiajieExcludes as ShareListItem[],
      },
      "4n5d": {
        name: "4박5일",
        itinerary: zhangjiajie4N5D as ShareItem[],
        hotels: zhangjiajieHotels as ShareHotel[],
        includes: zhangjiajieIncludes as ShareListItem[],
        excludes: zhangjiajieExcludes as ShareListItem[],
      },
    },
  },

  baekdu: {
    name: "백두산",
    poster:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/baekdu.png",
    flightInfo: baekduFlightInfo,
    courses: {
      "3n4d": {
        name: "3박4일",
        itinerary: baekdu3N4D as ShareItem[],
        hotels: baekduHotels as ShareHotel[],
        includes: baekduIncludes as ShareListItem[],
        excludes: baekduExcludes as ShareListItem[],
      },
      "4n5d": {
        name: "4박5일",
        itinerary: baekdu4N5D as ShareItem[],
        hotels: baekduHotels as ShareHotel[],
        includes: baekduIncludes as ShareListItem[],
        excludes: baekduExcludes as ShareListItem[],
      },
    },
  },

  phuquoc: {
    name: "푸꾸옥",
    poster:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/phuquoc.png",
    flightInfo: phuquocFlightInfo,
    courses: {
      premium: {
        name: "고품격",
        itinerary: phuquocPremium as ShareItem[],
        hotels: phuquocHotelsPremium as ShareHotel[],
        includes: phuquocIncludesPremium as ShareListItem[],
        excludes: phuquocExcludesPremium as ShareListItem[],
      },
      quality: {
        name: "품격",
        itinerary: phuquocQuality as ShareItem[],
        hotels: phuquocHotelsQuality as ShareHotel[],
        includes: phuquocIncludesQuality as ShareListItem[],
        excludes: phuquocExcludesQuality as ShareListItem[],
      },
      value: {
        name: "실속",
        itinerary: phuquocValue as ShareItem[],
        hotels: phuquocHotelsValue as ShareHotel[],
        includes: phuquocIncludesValue as ShareListItem[],
        excludes: phuquocExcludesValue as ShareListItem[],
      },
      golf: {
        name: "골프",
        itinerary: phuquocGolf as ShareItem[],
        hotels: phuquocHotelsGolf as ShareHotel[],
        includes: phuquocIncludesGolf as ShareListItem[],
        excludes: phuquocExcludesGolf as ShareListItem[],
      },
    },
  },

  guilin: {
    name: "계림",
    poster:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/guilin.png",
    flightInfo: guilinFlightInfo,
    courses: {
      guilin3N5D: {
        name: "계림 3박5일",
        itinerary: itineraryGuilin3N5D as ShareItem[],
        hotels: guilinHotels as ShareHotel[],
        includes: includesGuilin as ShareListItem[],
        excludes: excludesGuilin as ShareListItem[],
      },
      guilin4N6D: {
        name: "계림 4박6일",
        itinerary: itineraryGuilin4N6D as ShareItem[],
        hotels: guilinHotels as ShareHotel[],
        includes: includesGuilin as ShareListItem[],
        excludes: excludesGuilin as ShareListItem[],
      },
      chenzhou3N5D: {
        name: "천저우 3박5일",
        itinerary: itineraryChenzhou3N5D as ShareItem[],
        hotels: guilinHotels as ShareHotel[],
        includes: includesChenzhou as ShareListItem[],
        excludes: excludesChenzhou as ShareListItem[],
      },
      chenzhou4N6D: {
        name: "천저우 4박6일",
        itinerary: itineraryChenzhou4N6D as ShareItem[],
        hotels: guilinHotels as ShareHotel[],
        includes: includesChenzhou as ShareListItem[],
        excludes: excludesChenzhou as ShareListItem[],
      },
    },
  },

  xiamen: {
    name: "샤먼",
    poster:
      "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/xiamen.png",
    flightInfo: xiamenFlightInfo,
    courses: {
      value3: {
        name: "실속 3박5일",
        itinerary: itineraryValue3N5D as ShareItem[],
        hotels: xiamenHotels as ShareHotel[],
        includes: includesValue3 as ShareListItem[],
        excludes: excludesValue3 as ShareListItem[],
      },
      premium3: {
        name: "고품격 3박5일",
        itinerary: itineraryPremium3N5D as ShareItem[],
        hotels: xiamenHotels as ShareHotel[],
        includes: includesPremium3 as ShareListItem[],
        excludes: excludesPremium3 as ShareListItem[],
      },
      golf3: {
        name: "골프 3박5일",
        itinerary: itineraryGolf3N5D as ShareItem[],
        hotels: xiamenHotels as ShareHotel[],
        includes: includesGolf3 as ShareListItem[],
        excludes: excludesGolf3 as ShareListItem[],
      },
      value4: {
        name: "실속 4박6일",
        itinerary: itineraryValue4N6D as ShareItem[],
        hotels: xiamenHotels as ShareHotel[],
        includes: includesValue4 as ShareListItem[],
        excludes: excludesValue4 as ShareListItem[],
      },
      premium4: {
        name: "고품격 4박6일",
        itinerary: itineraryPremium4N6D as ShareItem[],
        hotels: xiamenHotels as ShareHotel[],
        includes: includesPremium4 as ShareListItem[],
        excludes: excludesPremium4 as ShareListItem[],
      },
      wuyishan4: {
        name: "무이산 4박6일",
        itinerary: itineraryWuyishan4N6D as ShareItem[],
        hotels: wuyishanHotels as ShareHotel[],
        includes: includesWuyishan4 as ShareListItem[],
        excludes: excludesWuyishan4 as ShareListItem[],
      },
      golf4: {
        name: "골프 4박6일",
        itinerary: itineraryGolf4N6D as ShareItem[],
        hotels: xiamenHotels as ShareHotel[],
        includes: includesGolf4 as ShareListItem[],
        excludes: excludesGolf4 as ShareListItem[],
      },
    },
  },
};

function itinerary3N4DToShare(data: unknown) {
  return data as ShareItem[];
}

const cancellationRules = [
  { period: "예약금 입금 다음날 ~ 출발 60일 전", fee: "예약금 환불 불가" },
  { period: "출발 59일 ~ 45일 전", fee: "총 여행경비의 30%" },
  { period: "출발 44일 ~ 30일 전", fee: "총 여행경비의 50%" },
  { period: "출발 29일 ~ 21일 전", fee: "총 여행경비의 60%" },
  { period: "출발 20일 ~ 15일 전", fee: "총 여행경비의 70%" },
  { period: "출발 14일 ~ 1일 전", fee: "총 여행경비의 80%" },
  { period: "출발 당일", fee: "총 여행경비의 100%" },
];

export default async function ShareItineraryPage({
  params,
}: {
  params: Promise<{
    product: string;
    course: string;
  }>;
}) {
  const { product, course } = await params;

  const productData = shareProducts[product];
  const courseData = productData?.courses[course];

  const selectedHotels = courseData.hotels;
  const selectedIncludes = courseData.includes;
  const selectedExcludes = courseData.excludes;

  if (!productData || !courseData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#faf8f4] px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* ==================== 제목 ==================== */}

        <div className="mb-10 text-center">
          <p className="text-sm font-bold tracking-[0.35em] text-[#b88a44]">
            TRAVEL ITINERARY
          </p>

          <h1 className="mt-4 text-3xl font-bold text-[#1f1f1f] md:text-5xl">
            {productData.name} {courseData.name}
          </h1>

          <p className="mt-4 text-gray-500">상세 여행 일정</p>
        </div>

        <div className="mb-10 overflow-hidden rounded-[28px] border border-[#ece7df] bg-white p-4 shadow-sm">
          <img
            src={productData.poster}
            alt={`${productData.name} 여행 안내`}
            className="mx-auto w-full max-w-[320px] rounded-2xl"
          />
        </div>

        <div className="mb-10 overflow-hidden rounded-[28px] border border-[#ece7df] bg-white shadow-sm">
          <div className="border-b border-[#ece7df] bg-[#faf8f4] px-6 py-4 text-lg font-bold">
            ✈️ 항공 스케줄
          </div>

          <div className="px-6 py-5">
            <div className="font-bold">
              출국 · {productData.flightInfo.outbound.airline}{" "}
              {productData.flightInfo.outbound.flight}
            </div>

            <div className="mt-2 text-gray-600">
              {productData.flightInfo.outbound.from}{" "}
              {productData.flightInfo.outbound.departure}
              {" → "}
              {productData.flightInfo.outbound.to}{" "}
              {productData.flightInfo.outbound.arrival}
            </div>
          </div>

          <div className="border-t border-[#ece7df] px-6 py-5">
            <div className="font-bold">
              귀국 · {productData.flightInfo.inbound.airline}{" "}
              {productData.flightInfo.inbound.flight}
            </div>

            <div className="mt-2 text-gray-600">
              {productData.flightInfo.inbound.from}{" "}
              {productData.flightInfo.inbound.departure}
              {" → "}
              {productData.flightInfo.inbound.to}{" "}
              {productData.flightInfo.inbound.arrival}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[24px] border border-[#ece7df] bg-[#faf8f4] px-6 py-5">
          <div className="text-xl font-bold text-[#1f1f1f]">
            📋 상세 여행일정
          </div>

          <div className="mt-2 text-sm text-gray-500">
            아래에서 요청하신 여행상품의 상세 일정을 확인해 주세요.
          </div>
        </div>

        {/* ==================== 일정 ==================== */}

        <div className="space-y-8">
          {courseData.itinerary.map((item, index) => {
            const golfText = [
              item.title ?? "",
              ...(item.places ?? []),
              item.schedule ?? "",
            ].join(" ");

            const golfImages = golfText.includes("남태무")
              ? golfImageMap["남태무 CC"]
              : golfText.includes("동방")
                ? golfImageMap["동방 골프장"]
                : golfText.includes("해서")
                  ? golfImageMap["해서 골프장"]
                  : golfText.includes("천주")
                    ? golfImageMap["천주 골프장"]
                    : undefined;

            const golfPlace = golfText.includes("남태무")
              ? "남태무 CC"
              : golfText.includes("동방")
                ? "동방 CC"
                : golfText.includes("해서")
                  ? "해서 CC"
                  : golfText.includes("천주")
                    ? "천주 CC"
                    : "";

            return (
              <article
                key={`${course}-${item.day ?? index}`}
                className="overflow-hidden rounded-[30px] border border-[#ece7df] bg-white shadow-sm"
              >
                {/* 대표 이미지 */}

                {item.image && (
                  <div className="overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title || item.day || "여행 일정"}
                      className="h-[240px] w-full object-cover md:h-[330px]"
                      style={{
                        objectPosition: item.imagePosition || "center",
                      }}
                    />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  {/* DAY */}

                  <div className="flex flex-wrap items-center gap-3">
                    {item.day && (
                      <span className="rounded-full bg-[#f6f1e8] px-4 py-2 text-sm font-bold text-[#b88a44]">
                        {item.day}
                      </span>
                    )}

                    {item.duration && (
                      <span className="text-sm text-gray-400">
                        {item.duration}
                      </span>
                    )}
                  </div>

                  {/* 제목 */}

                  {item.title && (
                    <div className="mt-5 flex items-center gap-3">
                      {item.icon && (
                        <span className="text-3xl">{item.icon}</span>
                      )}

                      <h2 className="text-xl font-bold leading-snug text-[#1f1f1f] md:text-2xl">
                        {item.title}
                      </h2>
                    </div>
                  )}

                  {/* 설명 */}

                  {item.description && (
                    <p className="mt-5 whitespace-pre-line leading-8 text-gray-600">
                      {item.description}
                    </p>
                  )}

                  {/* 상세 일정 */}

                  {item.schedule && (
                    <div className="mt-6 rounded-2xl border border-[#e8dcc4] bg-[#fcfaf7] p-5">
                      <div className="mb-3 text-sm font-bold text-[#b88a44]">
                        상세 일정
                      </div>

                      <div className="whitespace-pre-line leading-7 text-gray-700">
                        {item.schedule}
                      </div>
                      {golfImages?.courseGuide && (
                        <div className="mt-5">
                          <div className="mb-3 text-sm font-bold text-[#b88a44]">
                            ⛳ 코스 안내도
                          </div>

                          <div className="overflow-hidden rounded-2xl border border-[#e8dcc4] bg-white">
                            <img
                              src={golfImages.courseGuide}
                              alt={`${golfPlace} 코스 안내도`}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 주요 관광지 */}

                  {item.places && item.places.length > 0 && (
                    <div className="mt-7">
                      <div className="mb-3 text-sm font-bold text-[#b88a44]">
                        주요 일정
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.places.map((place) => (
                          <span
                            key={place}
                            className="rounded-full border border-[#e8dcc4] bg-[#faf8f4] px-4 py-2 text-sm font-medium text-gray-600"
                          >
                            {place}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 관광지 사진 */}

                  {item.spotImages && item.spotImages.length > 0 && (
                    <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3">
                      {item.spotImages.map((spot) => (
                        <div
                          key={spot.name}
                          className="overflow-hidden rounded-2xl bg-[#faf8f4]"
                        >
                          <img
                            src={spot.image}
                            alt={spot.name}
                            className="h-36 w-full object-cover md:h-44"
                          />

                          <div className="p-3 text-center text-sm font-bold">
                            {spot.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 식사 */}

                  {item.meals && (
                    <div className="mt-7 rounded-2xl bg-[#faf8f4] p-5">
                      <div className="mb-4 text-sm font-bold text-[#b88a44]">
                        🍽️ MEAL
                      </div>

                      <div className="grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                          <span className="font-bold text-gray-400">조식</span>

                          <div className="mt-1 font-semibold text-gray-700">
                            {item.meals.breakfast || "-----"}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-gray-400">중식</span>

                          <div className="mt-1 font-semibold text-gray-700">
                            {item.meals.lunch || "-----"}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-gray-400">석식</span>

                          <div className="mt-1 font-semibold text-gray-700">
                            {item.meals.dinner || "-----"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 호텔 */}

                  {item.hotel && (
                    <div className="mt-4 rounded-2xl border border-[#e8dcc4] bg-white p-5">
                      <div className="text-sm font-bold text-[#b88a44]">
                        🏨 HOTEL
                      </div>

                      <div className="mt-2 text-sm font-semibold leading-6 text-gray-700">
                        {item.hotel}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs leading-6 text-gray-400 md:text-sm">
          ※ 상기 일정은 항공 및 현지 사정에 따라 변경될 수 있습니다.
        </p>

        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-[#1f1f1f]">
            이용 예정 호텔
          </h2>

          <div className="space-y-4">
            {selectedHotels.map((hotel, index) => (
              <div
                key={`${hotel.name}-${index}`}
                className="rounded-[28px] border border-[#ece7df] bg-white p-5 shadow-sm"
              >
                <div className="text-xl font-bold text-[#1f1f1f]">
                  {hotel.name}
                </div>

                {hotel.grade && (
                  <div className="mt-1 font-semibold text-[#b88a44]">
                    {hotel.grade}
                  </div>
                )}

                {(hotel.image || hotel.roomImage) && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {hotel.image && (
                      <div className="overflow-hidden rounded-2xl bg-[#faf8f4]">
                        <img
                          src={hotel.image}
                          alt={`${hotel.name} 전경`}
                          className="h-[260px] w-full object-cover"
                        />
                        <div className="p-3 text-center text-sm text-gray-500">
                          호텔 전경
                        </div>
                      </div>
                    )}

                    {hotel.roomImage && (
                      <div className="overflow-hidden rounded-2xl bg-[#faf8f4]">
                        <img
                          src={hotel.roomImage}
                          alt={`${hotel.name} 객실`}
                          className="h-[260px] w-full object-cover"
                        />
                        <div className="p-3 text-center text-sm text-gray-500">
                          객실
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {hotel.desc && (
                  <div className="mt-4 leading-7 text-gray-600">
                    {hotel.desc}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="mb-4 text-2xl font-bold text-[#1f1f1f]">포함사항</h2>

          <div className="rounded-[24px] bg-green-50 p-6 text-green-900">
            <ul className="space-y-2 pl-5">
              {selectedIncludes.map((item, index) => (
                <li key={`${item.text}-${index}`} className="leading-7">
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold text-[#1f1f1f]">불포함사항</h2>

          <div className="rounded-[24px] bg-red-50 p-6 text-red-900">
            <ul className="space-y-2 pl-5">
              {selectedExcludes.map((item, index) => (
                <li key={`${item.text}-${index}`} className="leading-7">
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="mb-4 text-2xl font-bold text-[#1f1f1f]">
            전세기 특별약관 및 취소규정
          </h2>

          <div className="mb-5 rounded-[24px] border border-yellow-300 bg-yellow-50 p-6">
            <div className="font-bold text-[#1f1f1f]">전세기 특별약관</div>

            <p className="mt-3 leading-7 text-gray-600">
              본 상품은 전세기 상품으로 국외여행 표준약관이 아닌 전세기
              특별약관이 적용됩니다. 취소 시 일반 상품보다 높은 취소수수료가
              발생할 수 있습니다.
            </p>
          </div>

          <div className="mb-5 rounded-[24px] border border-[#ece7df] bg-white p-6">
            <div className="font-bold text-[#1f1f1f]">계약금 안내</div>

            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-gray-600">
              <li>예약일 기준 3일 이내 1인당 계약금 200,000원 입금</li>
              <li>기한 내 미입금 시 예약이 자동 취소될 수 있습니다.</li>
              <li>
                취소규정 적용기간 예약 시 계약금보다 취소료가 큰 경우 해당
                취소료가 적용됩니다.
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#ece7df] bg-white">
            <div className="grid grid-cols-2 bg-[#c8a15a] text-white">
              <div className="px-4 py-3 font-bold">취소 시점</div>
              <div className="px-4 py-3 font-bold">취소 수수료</div>
            </div>

            {cancellationRules.map((rule) => (
              <div
                key={rule.period}
                className="grid grid-cols-2 border-t border-[#ece7df]"
              >
                <div className="px-4 py-3 text-sm text-gray-700">
                  {rule.period}
                </div>
                <div className="px-4 py-3 text-sm font-bold text-gray-900">
                  {rule.fee}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 p-6">
            <div className="font-bold text-red-700">※ 중요 안내</div>

            <p className="mt-3 leading-7 text-gray-600">
              항공 좌석 및 호텔 객실을 사전 확보한 전세기 상품으로 취소 시 위
              특별약관이 적용됩니다. 예약 전 반드시 취소규정을 확인해 주시기
              바랍니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
