  import CTASection from "@/components/CTASection";
  import DepartureCalendar from "@/components/DepartureCalendar";
  import GallerySlider from "@/components/GallerySlider";
  import HotelCard from "@/components/HotelCard";
  import IncludedCard from "@/components/IncludedCard";
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
  
  import { supabase } from "@/lib/supabase";
  
  export default async function BaekduPage() {
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("slug", "baekdu")
      .single();
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#f7f3ec] pb-24 text-[#1f1f1f] lg:pb-0">
        <ProductHero product={product} />
  
        <SectionReveal className="relative z-20 mx-auto -mt-16 max-w-6xl px-6">
          <div className="grid gap-6 rounded-[36px] border border-black/5 bg-white p-8 shadow-2xl md:grid-cols-4">
            <InfoCard
              title="출발기간"
              value={product?.period || "2026.06.02 ~ 10.24"}
            />
            <InfoCard
              title="항공사"
              value={product?.airline || "이스타항공"}
            />
            <InfoCard
              title="여행일정"
              value={product?.duration || "3박4일 / 4박5일"}
            />
            <InfoCard
              title="상품가"
              value={
                product?.price
                  ? `${Number(product.price).toLocaleString()}원~`
                  : "799,000원~"
              }
            />
          </div>
        </SectionReveal>
  
        <div className="mt-10">
          <StickyBookingBar />
        </div>
  
        <section
          id="departure-calendar"
          className="mx-auto max-w-6xl scroll-mt-28 px-6 py-24"
        >
          <SectionReveal>
            <SectionTitle
              eyebrow="DEPARTURE DATE"
              title="출발일 선택"
              description="원하는 출발일을 선택하여 가격과 잔여석을 확인하세요."
            />
            <DepartureCalendar productId="ccbee4a2-7e39-40cc-97d7-38d9d99d5a5a" />
          </SectionReveal>
        </section>
  
        <SectionReveal>
          <PriceCard product={product} />
        </SectionReveal>
  
        <section className="bg-[#faf8f4] px-6">
          <SectionReveal>
            <Timeline />
          </SectionReveal>
        </section>
  
        <SectionReveal>
          <GallerySlider product={product} />
        </SectionReveal>
  
        <SectionReveal>
          <HotelCard />
        </SectionReveal>
  
        <SectionReveal>
          <IncludedCard />
        </SectionReveal>
  
        <SectionReveal>
          <ReviewSection />
        </SectionReveal>
  
        <SectionReveal>
          <ShoppingSection />
        </SectionReveal>
  
        <SectionReveal>
          <FAQSection />
        </SectionReveal>
  
        <SectionReveal>
          <PreparationSection />
        </SectionReveal>
  
        <SectionReveal>
          <CancellationSection />
        </SectionReveal>
  
        <SectionReveal>
          <CTASection />
        </SectionReveal>
  
        <SectionReveal>
          <ReservationCTASection />
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
        <p className="mb-3 text-sm tracking-[0.35em] text-[#b88a44]">
          {eyebrow}
        </p>
        <h2 className="text-4xl font-bold md:text-5xl">{title}</h2>
        <p className="mt-5 max-w-2xl leading-7 text-black/55">{description}</p>
      </div>
    );
  }
  