import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import BrandMessage from "@/components/home/BrandMessage";
import Discover from "@/components/home/Discover";
import SearchBar from "@/components/home/SearchBar";
import SpecialOffer from "@/components/home/SpecialOffer";
import Schedule from "@/components/home/Schedule";
import Gallery from "@/components/home/Gallery";
import Review from "@/components/home/Review";
import BestTour from "@/components/home/BestTour";


export default function Home() {
  return (
    <>
     <Header />
     <Hero />
     <SearchBar />
     <SpecialOffer />
     <Schedule />
     <Gallery />
     <Review />
     <BestTour />
    </>
  );
}