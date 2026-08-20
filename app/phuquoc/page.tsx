import CTASection from "@/components/CTASection";
import DepartureCalendar from "@/components/DepartureCalendar";
import GallerySlider from "@/components/GallerySlider";
import IncludedCard from "@/components/IncludedCard";
import PhuquocProductContent from "@/components/phuquoc/PhuquocProductContent";

import {
  includesPremium,
  excludesPremium,
  shoppingPremium,
  faqs,
  flightInfo,
  itineraryPremium,
  itineraryQuality,
  itineraryValue,
  itineraryGolf,
  mealBaseUrl,
  mealImages,
} from "@/data/phuquoc";

import MobileBookingButton from "@/components/MobileBookingButton";
import PriceCard from "@/components/PriceCard";
import ProductHero from "@/components/ProductHero";
import SectionReveal from "@/components/SectionReveal";
import StickyBookingBar from "@/components/StickyBookingBar";
import Timeline from "@/components/Timeline";
import ShoppingSection from "@/components/sections/ShoppingSection";
import FAQSection from "@/components/sections/FAQSection";
import PreparationSection from "@/components/sections/PreparationSection";
import CancellationSection from "@/components/sections/CancellationSection";

import { supabase } from "@/lib/supabase";

export default async function PhuQuocPage() {
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", "phuquoc")
    .single();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f3ec] pb-24 text-[#1f1f1f] lg:pb-0">
      {/* ==================== HERO ==================== */}

      <ProductHero product={product} />

      {/* ==================== 수정씨 포스터 ==================== */}

      <SectionReveal className="relative z-20 mx-auto -mt-16 max-w-3xl px-6">
        <div className="overflow-hidden rounded-[36px] bg-white p-5 shadow-2xl">
          <img
            src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/phuquoc.png"
            alt="푸꾸옥 상품 안내 포스터"
            className="w-full rounded-2xl"
          />
        </div>
      </SectionReveal>

      {/* ==================== 예약 BAR ==================== */}

      <div className="mt-10">
        <StickyBookingBar
          product={product?.title}
          departure={product?.departure_airport}
          price="출발일 확인"
        />
      </div>

      {/* ==================== 출발일 ==================== */}

      <section
        id="departure-calendar"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 py-24"
      >
        <SectionReveal>
          <SectionTitle
            eyebrow="DEPARTURE DATE"
            title="출발일 선택"
            description="원하는 출발일을 선택하여 가격과 잔여석을 확인하세요."
          />

          {product?.id && (
            <DepartureCalendar
              productId={product.id}
              productName={product.title}
            />
          )}

          <p className="mt-3 text-center text-sm font-bold text-red-600">
            ⚠️ 특가상품은 기본 일정과 차이가 있으니 꼭 확인해주세요!
          </p>
        </SectionReveal>
      </section>

      {/* ==================== 상품 가격 ==================== */}

      <SectionReveal>
        <PriceCard product={product} />
      </SectionReveal>

      {/* ==================== 푸꾸옥 관광지 지도 ==================== */}

      <SectionReveal>
        <img
          src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/phuquocmap.png"
          alt="푸꾸옥 관광지 안내"
          className="mx-auto my-20 w-full max-w-3xl rounded-[36px] shadow-xl"
        />
      </SectionReveal>

      {/* ==================== 푸꾸옥 호텔 위치도 ==================== */}

      <section className="mx-auto my-24 max-w-6xl px-6">
        <SectionTitle
          eyebrow="HOTEL LOCATION"
          title="푸꾸옥 호텔 위치 안내"
          description="푸꾸옥 주요 지역과 호텔의 위치를 한눈에 확인해보세요."
        />

        <img
          src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/phuquoc/phuquochotelmap.png"
          alt="푸꾸옥 호텔 위치도"
          className="block h-auto w-full rounded-[36px] shadow-xl"
        />
      </section>

      {/* ==================== 일정 ==================== */}

      <PhuquocProductContent />

      {/* ==================== 갤러리 ==================== */}

      <SectionReveal>
        <GallerySlider product={product} />
      </SectionReveal>

      {/* ==================== 취소 규정 ==================== */}

      <SectionReveal>
        <CancellationSection />
      </SectionReveal>

      {/* ==================== FAQ ==================== */}

      <SectionReveal>
        <FAQSection faqs={faqs} />
      </SectionReveal>

      {/* ==================== 여행 준비 ==================== */}

      <SectionReveal>
        <PreparationSection />
      </SectionReveal>

      {/* ==================== 모바일 예약 ==================== */}

      <MobileBookingButton />
    </main>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-12">
      <p className="mb-3 text-sm tracking-[0.35em] text-[#b88a44]">{eyebrow}</p>

      <h2 className="text-4xl font-bold md:text-5xl">{title}</h2>

      <p className="mt-5 max-w-2xl leading-7 text-black/55">{description}</p>
    </div>
  );
}
