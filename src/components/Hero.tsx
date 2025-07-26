import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t, direction } = useLanguage();
  
  const scrollToOffers = () => {
    const offersSection = document.getElementById('offers');
    offersSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-elegant" dir={direction}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-gold opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-gold opacity-10 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-arabic animate-fade-in">
            <span className="text-gold-gradient">{t('hero.title')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-arabic animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>
          
          <Button 
            onClick={scrollToOffers}
            size="lg"
            className="btn-gold text-lg px-8 py-6 rounded-xl font-arabic animate-bounce-in"
            style={{ animationDelay: '0.4s' }}
          >
            {t('hero.cta')}
            <ArrowDown className={`h-5 w-5 ${direction === 'rtl' ? 'mr-2' : 'ml-2'}`} />
          </Button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gradient-gold rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;