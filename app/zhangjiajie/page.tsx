import CTASection from "@/components/CTASection";
import DepartureCalendar from "@/components/DepartureCalendar";
import GallerySlider from "@/components/GallerySlider";
import HotelCard from "@/components/HotelCard";
import IncludedCard from "@/components/IncludedCard";
import {
  includes,
  excludes,
  hotels,
  shopping,
  faqs,
  flightInfo,
  itinerary4N5D,
  itinerary3N4D,
  reviews,
  mealBaseUrl,
  mealImages,
} from "@/data/zhangjiajie";
import MobileBookingButton from "@/components/MobileBookingButton";
import PriceCard from "@/components/PriceCard";
import ProductHero from "@/components/ProductHero";
import SectionReveal from "@/components/SectionReveal";
import StickyBookingBar from "@/components/StickyBookingBar";
import Timeline from "@/components/Timeline";
import ReviewSection from "@/components/sections/ReviewSection";
import ShoppingSection from "@/components/sections/ShoppingSection";
import FAQSection from "@/components/sections/FAQSection";
import PreparationSection from "@/components/sections/PreparationSection";
import CancellationSection from "@/components/sections/CancellationSection";
import ReservationCTASection from "@/components/sections/ReservationCTASection";

import ItineraryEmailButton from "@/components/ItineraryEmailButton";

import { supabase } from "@/lib/supabase";

export default async function ZhangjiajiePage() {
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", "zhangjiajie")
    .single();
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f3ec] pb-24 text-[#1f1f1f] lg:pb-0">
      <ProductHero product={product} />

      <SectionReveal className="relative z-20 mx-auto -mt-16 max-w-5xl px-6">
        <div className="overflow-hidden rounded-[36px] bg-white p-5 shadow-2xl">
          <img
            src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/poster/zhangjiajie.png"
            alt="장가계 상품 안내 포스터"
            className="w-full rounded-2xl"
          />
        </div>
      </SectionReveal>

      <div className="mt-10">
        <StickyBookingBar
          product={product?.title}
          departure={product?.departure_airport}
          price="출발일 확인"
          pdfFile="/files/zhangjiajie.pdf"
          hwpFile="/files/zhangjiajie.hwp"
        />
      </div>

      <section
        id="departure-calendar"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 py-24"
      >
        <SectionReveal>
          <div className="mb-10">
            <ItineraryEmailButton />
          </div>

          <SectionTitle
            eyebrow="DEPARTURE DATE"
            title="출발일 선택"
            description="원하는 출발일을 선택하여 가격과 잔여석을 확인하세요."
          />
          <DepartureCalendar
            productId="b367ce56-d07a-49a4-bcd5-a6f44027f265"
            productName="장가계"
          />
          <p className="mt-3 text-center text-sm font-bold text-red-600">
            ⚠️ 특가상품은 기본 일정과 차이가 있으니 꼭 확인해주세요!
          </p>
        </SectionReveal>
      </section>

      <SectionReveal>
        <PriceCard product={product} />
      </SectionReveal>

      <SectionReveal>
        <img
          src="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/destinations/zhangjiajie/zhangjiajiemap.JPG"
          alt="장가계"
          className="mx-auto my-20 w-full max-w-6xl rounded-[36px] shadow-xl"
        />
      </SectionReveal>

      <SectionReveal>
        <Timeline
          itinerary4N5D={itinerary4N5D}
          itinerary3N4D={itinerary3N4D}
          mealBaseUrl={mealBaseUrl}
          mealImages={mealImages}
          flightInfo={flightInfo}
        />
      </SectionReveal>

      <SectionReveal>
        <GallerySlider product={product} />
      </SectionReveal>

      <SectionReveal>
        <HotelCard
          baseUrl="https://eqzrecpphisfqqqvsmjq.supabase.co/storage/v1/object/public/gallery/gallery/hotel/zhangjiajie/"
          hotels={hotels}
        />
      </SectionReveal>

      <SectionReveal>
        <IncludedCard includes={includes} excludes={excludes} />
      </SectionReveal>

      <SectionReveal>
        <CancellationSection />
      </SectionReveal>

      <SectionReveal>
        <ReviewSection reviews={reviews} />
      </SectionReveal>

      <SectionReveal>
        <ShoppingSection shopping={shopping} />
      </SectionReveal>

      <SectionReveal>
        <FAQSection faqs={faqs} />
      </SectionReveal>

      <SectionReveal>
        <PreparationSection />
      </SectionReveal>

      <SectionReveal>
        <CTASection
          title={"장가계,\n지금 예약해보세요."}
          description={
            "출발일, 잔여석, 상품가격을 확인하고\n가장 알맞은 일정으로 안내해드립니다."
          }
          buttonHref="/reservation?product=장가계"
        />
      </SectionReveal>

      <MobileBookingButton />
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#faf8f4] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <p className="text-sm text-black/45">{title}</p>
      <h3 className="mt-2 text-xl font-bold">{value}</h3>
    </div>
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
