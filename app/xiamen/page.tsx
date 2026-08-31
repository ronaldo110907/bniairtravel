import DepartureCalendar from "@/components/DepartureCalendar";
import GallerySlider from "@/components/GallerySlider";
import MobileBookingButton from "@/components/MobileBookingButton";
import PriceCard from "@/components/PriceCard";
import ProductHero from "@/components/ProductHero";
import SectionReveal from "@/components/SectionReveal";
import StickyBookingBar from "@/components/StickyBookingBar";
import XiamenProductContent from "@/components/xiamen/XiamenProductContent";
import PreparationSection from "@/components/sections/PreparationSection";
import CancellationSection from "@/components/sections/CancellationSection";
import FAQSection from "@/components/sections/FAQSection";
import { faqs } from "@/data/xiamen";
import ItineraryEmailButton from "@/components/ItineraryEmailButton";

import { supabase } from "@/lib/supabase";

export default async function XiamenPage() {
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", "xiamen")
    .single();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f3ec] pb-24 text-[#1f1f1f] lg:pb-0">
      {/* ==================== HERO ==================== */}

      <ProductHero product={product} />

      {/* ==================== 포스터 ==================== */}

      <SectionReveal className="relative z-20 mx-auto -mt-16 max-w-3xl px-6">
        <div className="overflow-hidden rounded-[36px] bg-white p-5 shadow-2xl">
          <img
            src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/xiamen.png"
            alt="샤먼 상품 안내 포스터"
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

          <div className="mx-auto mb-8 max-w-3xl">
            <ItineraryEmailButton product="xiamen" />
          </div>

          {product?.id && (
            <DepartureCalendar
              productId={product.id}
              productName={product.title}
            />
          )}
        </SectionReveal>
      </section>

      {/* ==================== 가격 ==================== */}

      <SectionReveal>
        <PriceCard product={product} />
      </SectionReveal>

      {/* ==================== 일정 ==================== */}

      <XiamenProductContent />

      {/* ==================== 갤러리 ==================== */}

      <SectionReveal>
        <GallerySlider product={product} />
      </SectionReveal>

      {/* ==================== 취소규정 ==================== */}

      <SectionReveal>
        <CancellationSection />
      </SectionReveal>

      {/* ==================== FAQ ==================== */}

      <SectionReveal>
        <FAQSection faqs={faqs} />
      </SectionReveal>

      {/* ==================== 여행 준비사항 ==================== */}

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
    <div className="mb-12 text-center">
      <p className="text-sm font-bold tracking-[0.35em] text-[#B88A44]">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-4xl font-bold md:text-5xl">{title}</h2>

      <p className="mt-5 text-gray-500">{description}</p>
    </div>
  );
}
