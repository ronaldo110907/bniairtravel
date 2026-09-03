import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  itinerary3N4D,
  itinerary4N5D,
  hotels,
  includes,
  excludes,
  flightInfo,
  mealBaseUrl as zhangjiajieMealBaseUrl,
  mealImages as zhangjiajieMealImages,
} from "@/data/zhangjiajie";

import {
  flightInfo as baekduFlightInfo,
  itinerary3N4D as baekduItinerary3N4D,
  itinerary4N5D as baekduItinerary4N5D,
  hotels as baekduHotels,
  includes as baekduIncludes,
  excludes as baekduExcludes,
  mealBaseUrl as baekduMealBaseUrl,
  mealImages as baekduMealImages,
} from "@/data/baekdu";

import {
  flightInfo as phuquocFlightInfo,
  itineraryPremium as phuquocItineraryPremium,
  itineraryQuality as phuquocItineraryQuality,
  itineraryValue as phuquocItineraryValue,
  itineraryGolf as phuquocItineraryGolf,
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
  itineraryGuilin3N5D as guilinItinerary3N5D,
  itineraryGuilin4N6D as guilinItinerary4N6D,
  itineraryChenzhou3N5D as chenzhouItinerary3N5D,
  itineraryChenzhou4N6D as chenzhouItinerary4N6D,
  hotels as guilinHotels,
  includesGuilin as guilinIncludes,
  excludesGuilin as guilinExcludes,
  includesChenzhou as chenzhouIncludes,
  excludesChenzhou as chenzhouExcludes,
} from "@/data/guilin";

import {
  flightInfo as xiamenFlightInfo,
  itineraryValue3N5D as xiamenItineraryValue3N5D,
  itineraryPremium3N5D as xiamenItineraryPremium3N5D,
  itineraryPremium4N6D as xiamenItineraryPremium4N6D,
  itineraryWuyishan4N6D as xiamenItineraryWuyishan4N6D,
  itineraryGolf3N5D as xiamenItineraryGolf3N5D,
  itineraryGolf4N6D as xiamenItineraryGolf4N6D,
  includesValue3 as xiamenIncludesValue3,
  excludesValue3 as xiamenExcludesValue3,
  includesPremium3 as xiamenIncludesPremium3,
  excludesPremium3 as xiamenExcludesPremium3,
  includesPremium4 as xiamenIncludesPremium4,
  excludesPremium4 as xiamenExcludesPremium4,
  includesWuyishan4 as xiamenIncludesWuyishan4,
  excludesWuyishan4 as xiamenExcludesWuyishan4,
  includesGolf3 as xiamenIncludesGolf3,
  excludesGolf3 as xiamenExcludesGolf3,
  includesGolf4 as xiamenIncludesGolf4,
  excludesGolf4 as xiamenExcludesGolf4,
  xiamenHotels,
  wuyishanHotels as xiamenWuyishanHotels,
} from "@/data/xiamen";

const resend = new Resend(process.env.RESEND_API_KEY);
const zhangjiajieHotelBaseUrl =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/hotel/zhangjiajie/";
const baekduHotelBaseUrl =
  "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/hotel/baekdu/";

type EmailMeals = {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
};

function renderMealImages(
  meals: EmailMeals | undefined,
  baseUrl?: string,
  images?: Record<string, string>,
) {
  if (!meals || !baseUrl || !images) return "";

  const mealItems = [
    { label: "조식", name: meals.breakfast },
    { label: "중식", name: meals.lunch },
    { label: "석식", name: meals.dinner },
  ].flatMap(({ label, name }) => {
    const imageFile = name ? images[name] : undefined;

    if (!name || !imageFile) return [];

    return [
      {
        label,
        name,
        image: imageFile.startsWith("http")
          ? imageFile
          : `${baseUrl}${imageFile}`,
      },
    ];
  });

  if (mealItems.length === 0) return "";

  return `
    <table
      role="presentation"
      align="center"
      width="${mealItems.length * 220}"
      cellpadding="0"
      cellspacing="0"
      style="
        max-width: 100%;
        margin: 0 auto 16px;
        table-layout: fixed;
        border-collapse: collapse;
      "
    >
      <tr>
        ${mealItems
          .map(
            (meal) => `
              <td
                width="220"
                valign="top"
                style="
                  padding: 4px;
                  vertical-align: top;
                "
              >
                <img
                  src="${meal.image}"
                  alt="${meal.name}"
                  width="210"
                  style="
                    display: block;
                    width: 100%;
                    max-width: 210px;
                    height: 150px;
                    margin: 0 auto;
                    border: 0;
                    border-radius: 8px;
                    object-fit: cover;
                  "
                />

                <div
                  style="
                    margin-top: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    line-height: 1.4;
                    text-align: center;
                    color: #4b5563;
                  "
                >
                  ${meal.label} · ${meal.name}
                </div>
              </td>
            `,
          )
          .join("")}
      </tr>
    </table>
  `;
}

export async function POST(request: Request) {
  try {
    const {
      email,
      companyName,
      managerName,
      phone,
      etc,
      course,
      product,
      phuquocCourse,
      guilinCourse,
      xiamenCourse,
    } = await request.json();
    console.log("MAIL PRODUCT:", product);
    console.log("PHUQUOC COURSE:", phuquocCourse);
    console.log("GUILIN COURSE:", guilinCourse);
    console.log("XIAMEN COURSE:", xiamenCourse);

    const productData = {
      zhangjiajie: {
        name: "장가계",
        poster:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/zhangjiajie.png",
        flightInfo,
        hotels: hotels.map((hotel) => ({
          ...hotel,
          image: hotel.image.startsWith("http")
            ? hotel.image
            : `${zhangjiajieHotelBaseUrl}${hotel.image}`,
        })),
        includes,
        excludes,
        itinerary3: itinerary3N4D,
        itinerary4: itinerary4N5D,
      },

      baekdu: {
        name: "백두산",
        poster:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/baekdu.png",
        flightInfo: baekduFlightInfo,
        hotels: baekduHotels.map((hotel) => ({
          ...hotel,
          image: hotel.image.startsWith("http")
            ? hotel.image
            : `${baekduHotelBaseUrl}${hotel.image}`,
        })),
        includes: baekduIncludes,
        excludes: baekduExcludes,
        itinerary3: baekduItinerary3N4D,
        itinerary4: baekduItinerary4N5D,
      },

      phuquoc: {
        name: "푸꾸옥",
        poster:
          "https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/phuquoc.png",

        flightInfo: phuquocFlightInfo,

        courses: {
          premium: {
            name: "고품격",
            itinerary: phuquocItineraryPremium,
            hotels: phuquocHotelsPremium,
            includes: phuquocIncludesPremium,
            excludes: phuquocExcludesPremium,
          },

          quality: {
            name: "품격",
            itinerary: phuquocItineraryQuality,
            hotels: phuquocHotelsQuality,
            includes: phuquocIncludesQuality,
            excludes: phuquocExcludesQuality,
          },

          value: {
            name: "실속",
            itinerary: phuquocItineraryValue,
            hotels: phuquocHotelsValue,
            includes: phuquocIncludesValue,
            excludes: phuquocExcludesValue,
          },

          golf: {
            name: "골프",
            itinerary: phuquocItineraryGolf,
            hotels: phuquocHotelsGolf,
            includes: phuquocIncludesGolf,
            excludes: phuquocExcludesGolf,
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
            itinerary: guilinItinerary3N5D,
            hotels: guilinHotels,
            includes: guilinIncludes,
            excludes: guilinExcludes,
          },

          guilin4N6D: {
            name: "계림 4박6일",
            itinerary: guilinItinerary4N6D,
            hotels: guilinHotels,
            includes: guilinIncludes,
            excludes: guilinExcludes,
          },

          chenzhou3N5D: {
            name: "천저우 3박5일",
            itinerary: chenzhouItinerary3N5D,
            hotels: guilinHotels,
            includes: chenzhouIncludes,
            excludes: chenzhouExcludes,
          },

          chenzhou4N6D: {
            name: "천저우 4박6일",
            itinerary: chenzhouItinerary4N6D,
            hotels: guilinHotels,
            includes: chenzhouIncludes,
            excludes: chenzhouExcludes,
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
            itinerary: xiamenItineraryValue3N5D,
            hotels: xiamenHotels,
            includes: xiamenIncludesValue3,
            excludes: xiamenExcludesValue3,
          },

          premium3: {
            name: "고품격 3박5일",
            itinerary: xiamenItineraryPremium3N5D,
            hotels: xiamenHotels,
            includes: xiamenIncludesPremium3,
            excludes: xiamenExcludesPremium3,
          },

          premium4: {
            name: "고품격 4박6일",
            itinerary: xiamenItineraryPremium4N6D,
            hotels: xiamenHotels,
            includes: xiamenIncludesPremium4,
            excludes: xiamenExcludesPremium4,
          },

          wuyishan4: {
            name: "무이산 4박6일",
            itinerary: xiamenItineraryWuyishan4N6D,
            hotels: xiamenWuyishanHotels,
            includes: xiamenIncludesWuyishan4,
            excludes: xiamenExcludesWuyishan4,
          },

          golf3: {
            name: "골프 3박5일",
            itinerary: xiamenItineraryGolf3N5D,
            hotels: xiamenHotels,
            includes: xiamenIncludesGolf3,
            excludes: xiamenExcludesGolf3,
          },

          golf4: {
            name: "골프 4박6일",
            itinerary: xiamenItineraryGolf4N6D,
            hotels: xiamenHotels,
            includes: xiamenIncludesGolf4,
            excludes: xiamenExcludesGolf4,
          },
        },
      },
    };

    const selectedProduct =
      product === "baekdu" ? productData.baekdu : productData.zhangjiajie;

    const productInfo =
      product === "phuquoc"
        ? productData.phuquoc
        : product === "guilin"
          ? productData.guilin
          : product === "xiamen"
            ? productData.xiamen
            : selectedProduct;

    const selectedPhuquocCourse =
      phuquocCourse === "quality"
        ? productData.phuquoc.courses.quality
        : phuquocCourse === "value"
          ? productData.phuquoc.courses.value
          : phuquocCourse === "golf"
            ? productData.phuquoc.courses.golf
            : productData.phuquoc.courses.premium;
    const selectedGuilinCourse =
      guilinCourse === "guilin4N6D"
        ? productData.guilin.courses.guilin4N6D
        : guilinCourse === "chenzhou3N5D"
          ? productData.guilin.courses.chenzhou3N5D
          : guilinCourse === "chenzhou4N6D"
            ? productData.guilin.courses.chenzhou4N6D
            : productData.guilin.courses.guilin3N5D;
    const selectedXiamenCourse =
      xiamenCourse === "premium3"
        ? productData.xiamen.courses.premium3
        : xiamenCourse === "premium4"
          ? productData.xiamen.courses.premium4
          : xiamenCourse === "wuyishan4"
            ? productData.xiamen.courses.wuyishan4
            : xiamenCourse === "golf3"
              ? productData.xiamen.courses.golf3
              : xiamenCourse === "golf4"
                ? productData.xiamen.courses.golf4
                : productData.xiamen.courses.value3;

    const isPhuquoc = product === "phuquoc";
    const isGuilin = product === "guilin";
    const isXiamen = product === "xiamen";

    const mealImageConfig =
      product === "zhangjiajie"
        ? {
            baseUrl: zhangjiajieMealBaseUrl,
            images: zhangjiajieMealImages,
          }
        : product === "baekdu"
          ? {
              baseUrl: baekduMealBaseUrl,
              images: baekduMealImages,
            }
          : undefined;

    const displayCourse = isPhuquoc
      ? "3박5일"
      : isGuilin
        ? selectedGuilinCourse.name
        : isXiamen
          ? selectedXiamenCourse.name
          : course;

    const itinerary = isPhuquoc
      ? selectedPhuquocCourse.itinerary
      : isGuilin
        ? selectedGuilinCourse.itinerary
        : isXiamen
          ? selectedXiamenCourse.itinerary
          : course === "4박5일"
            ? selectedProduct.itinerary4
            : selectedProduct.itinerary3;

    const flightHtml = `
  <div
    style="
      margin: 30px 0 40px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background-color: #ffffff;
    "
  >
    <div
      style="
        padding: 14px 18px;
        background-color: #f8fafc;
        font-size: 17px;
        font-weight: 700;
      "
    >
      ✈️ 항공 스케줄
    </div>

    <div
      style="
        padding: 18px;
        border-top: 1px solid #e5e7eb;
      "
    >
      <strong>
        출국 · ${productInfo.flightInfo.outbound.airline}
        ${productInfo.flightInfo.outbound.flight}
      </strong>

      <div style="margin-top: 8px; color: #4b5563;">
        ${productInfo.flightInfo.outbound.from}
        ${productInfo.flightInfo.outbound.departure}
        &nbsp;→&nbsp;
        ${productInfo.flightInfo.outbound.to}
        ${productInfo.flightInfo.outbound.arrival}
      </div>
    </div>

    <div
      style="
        padding: 18px;
        border-top: 1px solid #e5e7eb;
      "
    >
      <strong>
        귀국 · ${productInfo.flightInfo.inbound.airline}
        ${productInfo.flightInfo.inbound.flight}
      </strong>

      <div style="margin-top: 8px; color: #4b5563;">
        ${productInfo.flightInfo.inbound.from}
        ${productInfo.flightInfo.inbound.departure}
        &nbsp;→&nbsp;
        ${productInfo.flightInfo.inbound.to}
        ${productInfo.flightInfo.inbound.arrival}
      </div>
    </div>
  </div>
`;

    type EmailItineraryItem = (typeof itinerary)[number] & {
      spotImages?: {
        name: string;
        image: string;
      }[];
    };

    const emailItinerary = itinerary as EmailItineraryItem[];

    const itineraryHtml = emailItinerary
      .map(
        (item) => `
      <div
        style="
          margin-bottom: 24px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background-color: #ffffff;
        "
      >
        <div
          style="
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 700;
            color: #b88a44;
          "
        >
          ${item.day}
        </div>

        <p
          style="
            margin: 0 0 18px;
            line-height: 1.7;
            color: #4b5563;
          "
        >
          ${item.description}
        </p>

        <div
          style="
            margin-bottom: 16px;
            padding: 14px;
            border-radius: 10px;
            background-color: #f9fafb;
            line-height: 1.7;
          "
        >
                    <strong>주요 관광지</strong><br />
        $${item.places?.join(" · ") ?? "-----"}
        </div>

        ${
          isXiamen && item.spotImages?.length
            ? `
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  width: 100%;
                  margin: 0 0 16px;
                  table-layout: fixed;
                  border-collapse: collapse;
                "
              >
                <tr>
                  ${item.spotImages
                    .map(
                      (spot) => `
                        <td
                          width="${Math.floor(100 / item.spotImages!.length)}%"
                          valign="top"
                          style="
                            padding: 4px;
                            vertical-align: top;
                          "
                        >
                          <img
                            src="${spot.image}"
                            alt="${spot.name}"
                            style="
                              display: block;
                              width: 100%;
                              height: 180px;
                              border: 0;
                              border-radius: 8px;
                              object-fit: cover;
                            "
                          />

                          <div
                            style="
                              margin-top: 6px;
                              font-size: 12px;
                              font-weight: 700;
                              line-height: 1.4;
                              text-align: center;
                              color: #4b5563;
                            "
                          >
                            ${spot.name}
                          </div>
                        </td>
                      `,
                    )
                    .join("")}
                </tr>
              </table>
            `
            : ""
        }
        
                ${renderMealImages(
                  item.meals,
                  mealImageConfig?.baseUrl,
                  mealImageConfig?.images,
                )}

        <table
          style="
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          "
        >
          <tr>
            <td
              style="
                width: 25%;
                padding: 10px;
                border: 1px solid #e5e7eb;
                background-color: #f9fafb;
                font-weight: 700;
              "
            >
              조식
            </td>

            <td
              style="
                width: 25%;
                padding: 10px;
                border: 1px solid #e5e7eb;
              "
            >
              ${item.meals?.breakfast ?? "-----"}
            </td>

            <td
              style="
                width: 25%;
                padding: 10px;
                border: 1px solid #e5e7eb;
                background-color: #f9fafb;
                font-weight: 700;
              "
            >
              중식
            </td>

            <td
              style="
                width: 25%;
                padding: 10px;
                border: 1px solid #e5e7eb;
              "
            >
              ${item.meals?.lunch ?? "-----"}
            </td>
          </tr>

          <tr>
            <td
              style="
                padding: 10px;
                border: 1px solid #e5e7eb;
                background-color: #f9fafb;
                font-weight: 700;
              "
            >
              석식
            </td>

            <td
              style="
                padding: 10px;
                border: 1px solid #e5e7eb;
              "
            >
              ${item.meals?.dinner ?? "-----"}
            </td>

            <td
              style="
                padding: 10px;
                border: 1px solid #e5e7eb;
                background-color: #f9fafb;
                font-weight: 700;
              "
            >
              숙박
            </td>

            <td
              style="
                padding: 10px;
                border: 1px solid #e5e7eb;
              "
            >
              ${item.hotel}
            </td>
          </tr>
        </table>
      </div>
    `,
      )
      .join("");

    const selectedHotels = isPhuquoc
      ? selectedPhuquocCourse.hotels
      : isGuilin
        ? selectedGuilinCourse.hotels
        : isXiamen
          ? selectedXiamenCourse.hotels
          : selectedProduct.hotels;

    type EmailHotel = {
      name: string;
      grade?: string;
      desc?: string;
      image?: string;
      roomImage?: string;
    };

    const hotelsHtml = (selectedHotels as EmailHotel[])
      .map(
        (hotel) => `
      <div
        style="
          margin-bottom: 12px;
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background-color: #ffffff;
        "
      >
        <div
          style="
            font-size: 17px;
            font-weight: 700;
            color: #111827;
          "
        >
          ${hotel.name}
        </div>

        <div
          style="
            margin-top: 4px;
            color: #b88a44;
          "
        >
          ${hotel.grade}
        </div>
                ${
                  (isXiamen ||
                    product === "zhangjiajie" ||
                    product === "baekdu") &&
                  (hotel.image || hotel.roomImage)
                    ? `
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  width: 100%;
                  margin-top: 14px;
                  table-layout: fixed;
                  border-collapse: collapse;
                "
              >
                <tr>
                  ${
                    hotel.image
                      ? `
                        <td
                          width="${hotel.roomImage ? "50%" : "100%"}"
                          valign="top"
                          style="
                            padding: 4px;
                            vertical-align: top;
                          "
                        >
                                                    <img
                            src="${hotel.image}"
                            alt="${hotel.name} 전경"
                            style="
                              display: block;
                              width: 100%;
                              height: ${hotel.roomImage ? "200px" : "300px"};
                              margin: 0 auto;
                              border: 0;
                              border-radius: 10px;
                              background-color: #f8fafc;
                              object-fit: ${
                                hotel.roomImage ? "cover" : "contain"
                              };
                              object-position: center;
                            "
                          />

                          <div
                            style="
                              margin-top: 6px;
                              font-size: 12px;
                              text-align: center;
                              color: #6b7280;
                            "
                          >
                            호텔 전경
                          </div>
                        </td>
                      `
                      : ""
                  }

                  ${
                    hotel.roomImage
                      ? `
                        <td
                          width="${hotel.image ? "50%" : "100%"}"
                          valign="top"
                          style="
                            padding: 4px;
                            vertical-align: top;
                          "
                        >
                          <img
                            src="${hotel.roomImage}"
                            alt="${hotel.name} 객실"
                            style="
                              display: block;
                              width: 100%;
                              height: 200px;
                              border: 0;
                              border-radius: 10px;
                              object-fit: cover;
                            "
                          />

                          <div
                            style="
                              margin-top: 6px;
                              font-size: 12px;
                              text-align: center;
                              color: #6b7280;
                            "
                          >
                            객실
                          </div>
                        </td>
                      `
                      : ""
                  }
                </tr>
              </table>
            `
                    : ""
                }
        <div
          style="
            margin-top: 8px;
            line-height: 1.6;
            color: #6b7280;
          "
        >
          ${hotel.desc}
        </div>
      </div>
    `,
      )
      .join("");

    const includesHtml = (
      isPhuquoc
        ? selectedPhuquocCourse.includes
        : isGuilin
          ? selectedGuilinCourse.includes
          : isXiamen
            ? selectedXiamenCourse.includes
            : selectedProduct.includes
    )
      .map(
        (item) => `
      <li style="margin-bottom: 8px; line-height: 1.6;">
        ${item.text}
      </li>
    `,
      )
      .join("");

    const excludesHtml = (
      isPhuquoc
        ? selectedPhuquocCourse.excludes
        : isGuilin
          ? selectedGuilinCourse.excludes
          : isXiamen
            ? selectedXiamenCourse.excludes
            : selectedProduct.excludes
    )
      .map(
        (item) => `
      <li style="margin-bottom: 8px; line-height: 1.6;">
        ${item.text}
      </li>
    `,
      )
      .join("");

    const cancellationRules = [
      {
        period: "예약금 입금 다음날 ~ 출발 60일 전",
        fee: "예약금 환불 불가",
      },
      {
        period: "출발 59일 ~ 45일 전",
        fee: "총 여행경비의 30%",
      },
      {
        period: "출발 44일 ~ 30일 전",
        fee: "총 여행경비의 50%",
      },
      {
        period: "출발 29일 ~ 21일 전",
        fee: "총 여행경비의 60%",
      },
      {
        period: "출발 20일 ~ 15일 전",
        fee: "총 여행경비의 70%",
      },
      {
        period: "출발 14일 ~ 1일 전",
        fee: "총 여행경비의 80%",
      },
      {
        period: "출발 당일",
        fee: "총 여행경비의 100%",
      },
    ];

    const cancellationRulesHtml = cancellationRules
      .map(
        (rule) => `
      <tr>
        <td
          style="
            padding: 12px;
            border: 1px solid #e5e7eb;
          "
        >
          ${rule.period}
        </td>

        <td
          style="
            padding: 12px;
            border: 1px solid #e5e7eb;
            font-weight: 700;
          "
        >
          ${rule.fee}
        </td>
      </tr>
    `,
      )
      .join("");

    if (!email) {
      return NextResponse.json(
        { error: "이메일 주소가 필요합니다." },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: "청주출발 전세기 <info@cjjbni.com>",
      to: email,
      subject: `[${companyName}] ${productInfo.name} ${displayCourse} 여행 일정`,
      html: `
  <div
    style="
      font-family: Arial, sans-serif;
      padding: 30px;
      color: #111827;
    "
  >
    <div
  style="
    text-align: center;
    margin: 0 auto 28px;
  "
>
  <img
  src="${productInfo.poster}"
  alt="${productInfo.name} 여행 안내"
  width="320"
    style="
      display: block;
      width: 100%;
      max-width: 320px;
      height: auto;
      margin: 0 auto;
      border: 0;
      border-radius: 14px;
    "
  />
</div>
    <div
      style="
        margin-bottom: 40px;
        padding: 32px;
        border-radius: 16px;
        background-color: #faf8f4;
        text-align: center;
      "
    >
      <div
        style="
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #b88a44;
        "
      >
        TRAVEL ITINERARY
      </div>

      <h1
        style="
          margin: 0;
          font-size: 28px;
          color: #111827;
        "
      >
        ${productInfo.name} ${displayCourse} 여행 일정
      </h1>

      <p
        style="
          margin: 12px 0 0;
          color: #6b7280;
        "
      >
        즐거운 여행을 위한 상세 일정을 안내드립니다.
      </p>

      <div
        style="
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          line-height: 1.8;
          color: #374151;
        "
      >
        <strong>${companyName}</strong><br />
        담당자 ${managerName} · ${phone}
      </div>
        </div>

    ${
      etc?.trim()
        ? `
          <div
            style="
              margin: -15px 0 30px;
              padding: 18px 20px;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              background-color: #f8fafc;
              line-height: 1.7;
              color: #374151;
            "
          >
            <div
              style="
                margin-bottom: 8px;
                font-weight: 700;
                color: #111827;
              "
            >
              📌 기타사항
            </div>

            <div style="white-space: pre-line;">
              ${etc}
            </div>
          </div>
        `
        : ""
    }

    ${flightHtml}

<div
  style="
    margin: 28px 0 20px;
    padding: 18px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background-color: #f8fafc;
  "
>
  <div
    style="
      margin-bottom: 6px;
      font-size: 20px;
      font-weight: 700;
      color: #111827;
    "
  >
    📋 상세 여행일정
  </div>

  <div
    style="
      font-size: 14px;
      line-height: 1.6;
      color: #64748b;
    "
  >
    아래에서 요청하신 여행상품의 상세 일정을 확인해 주세요.
  </div>
</div>

${itineraryHtml}

<h2 style="margin-top: 40px;">이용 예정 호텔</h2>
${hotelsHtml}

<h2 style="margin-top: 40px;">포함사항</h2>

<div
  style="
    padding: 20px;
    border-radius: 12px;
    background-color: #f0fdf4;
    color: #166534;
  "
>
  <ul style="margin: 0; padding-left: 20px;">
    ${includesHtml}
  </ul>
</div>

<h2 style="margin-top: 40px;">불포함사항</h2>

<div
  style="
    padding: 20px;
    border-radius: 12px;
    background-color: #fef2f2;
    color: #991b1b;
  "
>
  <ul style="margin: 0; padding-left: 20px;">
    ${excludesHtml}
  </ul>
</div>
<h2 style="margin-top: 40px;">
  전세기 특별약관 및 취소규정
</h2>

<div
  style="
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #fcd34d;
    border-radius: 12px;
    background-color: #fffbeb;
    line-height: 1.7;
  "
>
  <strong>전세기 특별약관</strong>

  <p style="margin-bottom: 0; color: #4b5563;">
    본 상품은 전세기 상품으로 국외여행 표준약관이 아닌
    전세기 특별약관이 적용됩니다. 취소 시 일반 상품보다
    높은 취소수수료가 발생할 수 있습니다.
  </p>
</div>

<div
  style="
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
  "
>
  <strong>계약금 안내</strong>

  <ul
    style="
      margin-bottom: 0;
      padding-left: 20px;
      line-height: 1.8;
      color: #4b5563;
    "
  >
    <li>예약일 기준 3일 이내 1인당 계약금 200,000원 입금</li>
    <li>기한 내 미입금 시 예약이 자동 취소될 수 있습니다.</li>
    <li>
      취소규정 적용기간 예약 시 계약금보다 취소료가 큰 경우
      해당 취소료가 적용됩니다.
    </li>
  </ul>
</div>

<table
  style="
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  "
>
  <thead>
    <tr style="background-color: #c8a15a; color: #ffffff;">
      <th
        style="
          padding: 12px;
          border: 1px solid #c8a15a;
          text-align: left;
        "
      >
        취소 시점
      </th>

      <th
        style="
          padding: 12px;
          border: 1px solid #c8a15a;
          text-align: left;
        "
      >
        취소 수수료
      </th>
    </tr>
  </thead>

  <tbody>
    ${cancellationRulesHtml}
  </tbody>
</table>

<div
  style="
    margin-top: 20px;
    padding: 18px;
    border: 1px solid #fecaca;
    border-radius: 12px;
    background-color: #fef2f2;
    line-height: 1.7;
  "
>
  <strong style="color: #b91c1c;">※ 중요 안내</strong>

  <p style="margin-bottom: 0; color: #4b5563;">
    항공 좌석 및 호텔 객실을 사전 확보한 전세기 상품으로
    취소 시 위 특별약관이 적용됩니다.
    예약 전 반드시 취소규정을 확인해 주시기 바랍니다.
  </p>
</div>
<hr style="margin: 40px 0;" />
  </div>
`,
    });

    if (error) {
      console.error("RESEND ERROR:", error);

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("SEND ITINERARY ERROR:", error);

    return NextResponse.json(
      { error: "메일 발송 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
