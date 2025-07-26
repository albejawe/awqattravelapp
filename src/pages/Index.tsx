import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TravelOffers from "@/components/TravelOffers";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { direction } = useLanguage();
  
  return (
    <div className="min-h-screen" dir={direction}>
      <Header />
      <Hero />
      <TravelOffers />
      <Footer />
    </div>
  );
};

export default Index;
