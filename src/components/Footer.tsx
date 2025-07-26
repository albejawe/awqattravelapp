import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const { t, direction } = useLanguage();
  const location = useLocation();
  const isChaletsPage = location.pathname === '/chalets';
  
  const handleWhatsAppContact = () => {
    const message = "أرغب بالاستفسار عن خدماتكم";
    const whatsappNumber = isChaletsPage ? "96551148114" : "96522289080";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <footer className="bg-gradient-gold text-white py-12 mt-20" dir={direction}>
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* WhatsApp Button */}
          <div className="mb-8">
            <Button
              onClick={handleWhatsAppContact}
              className="bg-white hover:bg-white text-primary-dark font-bold px-8 py-3 rounded-full text-lg font-arabic border-2 border-white"
            >
              {t('footer.whatsapp')}
            </Button>
          </div>

          {/* Company Info */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4 font-arabic">
              <MapPin className={`h-5 w-5 ${direction === 'rtl' ? 'mr-2' : 'ml-2'}`} />
              <span>{t('footer.address')}</span>
            </div>
          </div>
        </div>
        
        {/* Link for Chalets page only */}
        {isChaletsPage && (
          <div className="text-center mb-6">
            <button
              onClick={() => window.open('https://awqattravel.com', '_blank')}
              className="text-white hover:text-gold transition-colors font-arabic text-lg underline"
            >
              عروض العمرة والسياحة
            </button>
          </div>
        )}
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center font-arabic">
          <p>{t('footer.company')}</p>
          <p className="mt-2 text-sm opacity-80">&copy; 2025 {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;