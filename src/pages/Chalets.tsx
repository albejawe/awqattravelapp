import Header from "@/components/Header";
import ChaletsOffers from "@/components/ChaletsOffers";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const Chalets = () => {
  const { direction } = useLanguage();
  
  return (
    <div className="min-h-screen" dir={direction}>
      <Header />
      <div className="pt-20">
        <ChaletsOffers />
      </div>
      <Footer />
    </div>
  );
};

export default Chalets;