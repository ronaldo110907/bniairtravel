import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import BrandMessage from "@/components/home/BrandMessage";
import Discover from "@/components/home/Discover";
import SpecialOffer from "@/components/home/SpecialOffer";
import Gallery from "@/components/home/Gallery";
import Review from "@/components/home/Review";
import NoticePopup from "@/components/NoticePopup";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      {/* <SearchBar /> */}
      <SpecialOffer />
      <Discover />
      <BrandMessage />
      {/* <Schedule /> */}
      <Review />
    </>
  );
}
