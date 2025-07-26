import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageGallery from "@/components/ImageGallery";
import VideoModal from "@/components/VideoModal";
import Notification from "@/components/Notification";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Share2, Download, Play, Star, MapPin, Calendar, Users, Bath, Home, Layers } from "lucide-react";
import html2canvas from 'html2canvas';
import resortHeroBg from '@/assets/resort-hero-bg.jpg';

interface ChaletOffer {
  category: string;
  name: string;
  floors: string;
  masterRooms: string;
  regularRooms: string;
  bathrooms: string;
  facilities: string;
  priceLabel1: string;
  price1: string;
  startDate1: string;
  endDate1: string;
  priceLabel2: string;
  price2: string;
  startDate2: string;
  endDate2: string;
  priceLabel3: string;
  price3: string;
  startDate3: string;
  endDate3: string;
  details: string;
  images: string[];
  video: string;
}

const ChaletsOffers = () => {
  const [offers, setOffers] = useState<ChaletOffer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; show: boolean } | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { t, direction } = useLanguage();

  useEffect(() => {
    fetchOffers();
    
    // فحص معاملات URL للعرض المحدد
    const urlParams = new URLSearchParams(window.location.search);
    const offerParam = urlParams.get('offer');
    if (offerParam) {
      setSelectedOffer(decodeURIComponent(offerParam));
    }
  }, []);

  const fetchOffers = async () => {
    try {
      const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQOz6I5EE4dBmlyV7QXS52BVGxjL2FSLeAoKJHLV-mXKA-d02nO7owqBDFaHNkbKruWuqdmKABHpVUN/pub?output=csv';
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedOffers: ChaletOffer[] = results.data.map((row: any) => {
            const images = [
              row['صورة رقم 1'],
              row['صورة رقم 2'],
              row['صورة رقم 3'],
              row['صورة رقم 4'],
              row['صورة رقم 5'],
              row['صورة رقم 6'],
              row['صورة رقم 7'],
              row['صورة رقم 8'],
              row['صورة رقم 9'],
              row['صورة رقم 10'],
              row['صورة رقم 11'],
              row['صورة رقم 12'],
            ].filter(Boolean);

            return {
              category: row['الفئة'] || '',
              name: row['الاسم'] || '',
              floors: row['عدد الادوار'] || '',
              masterRooms: row['عدد الغرف الماستر'] || '',
              regularRooms: row['عدد الغرف العادية'] || '',
              bathrooms: row['عدد الحمامات'] || '',
              facilities: row['المرافق'] || '',
              priceLabel1: row['تسمية السعر 1'] || '',
              price1: row['السعر 1'] || '',
              startDate1: row['تاريخ دخول السعر 1'] || '',
              endDate1: row['تاريخ خروج السعر 1'] || '',
              priceLabel2: row['تسمية السعر 2'] || '',
              price2: row['السعر 2'] || '',
              startDate2: row['تاريخ دخول السعر 2'] || '',
              endDate2: row['تاريخ خروج السعر 2'] || '',
              priceLabel3: row['تسمية السعر 3'] || '',
              price3: row['السعر 3'] || '',
              startDate3: row['تاريخ دخول السعر 3'] || '',
              endDate3: row['تاريخ خروج السعر 3'] || '',
              details: row['التفاصيل'] || '',
              images,
              video: row['الفيديو'] || ''
            };
          });

          setOffers(parsedOffers);
          
          const uniqueCategories = [...new Set(parsedOffers.map(offer => offer.category).filter(Boolean))];
          setCategories(uniqueCategories);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error fetching offers:', error);
      setLoading(false);
    }
  };

  const filteredOffers = selectedOffer
    ? offers.filter(offer => offer.name === selectedOffer)
    : selectedCategory 
    ? offers.filter(offer => offer.category === selectedCategory)
    : offers;

  const handleWhatsAppContact = (offer: ChaletOffer) => {
    const message = `أرغب بالاستفسار عن ${offer.name}`;
    const whatsappUrl = `https://wa.me/96551148114?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async (offer: ChaletOffer) => {
    const offerUrl = `${window.location.origin}/chalets?offer=${encodeURIComponent(offer.name)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: offer.name,
          text: offer.details,
          url: offerUrl
        });
        setNotification({ message: 'تم مشاركة العرض بنجاح', show: true });
      } catch (error) {
        console.error('Error sharing:', error);
        navigator.clipboard.writeText(offerUrl);
        setNotification({ message: 'تم نسخ الرابط', show: true });
      }
    } else {
      navigator.clipboard.writeText(offerUrl);
      setNotification({ message: 'تم نسخ الرابط', show: true });
    }
  };

  const downloadOffer = async (offer: ChaletOffer) => {
    const element = document.getElementById(`offer-${offer.name.replace(/\s+/g, '-')}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `${offer.name}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      setNotification({ message: 'تم تحميل العرض بنجاح', show: true });
    } catch (error) {
      console.error('Error downloading offer:', error);
      setNotification({ message: 'حدث خطأ في التحميل', show: true });
    }
  };

  const handleVideoPlay = (videoUrl: string) => {
    setVideoUrl(videoUrl);
    setIsVideoModalOpen(true);
  };

  const openImageGallery = (images: string[]) => {
    setGalleryImages(images);
    setIsGalleryOpen(true);
  };

  const ImageSlider = ({ images, offerName }: { images: string[]; offerName: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    if (!images.length) return null;

    return (
      <div className="relative w-full h-48 overflow-hidden rounded-lg cursor-pointer" onClick={() => openImageGallery(images)}>
        <img
          src={images[currentIndex]}
          alt={offerName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12" dir={direction}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-arabic">جاري تحميل الشاليهات والمنتجعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12" dir={direction}>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-arabic text-foreground">
            {selectedOffer 
              ? selectedOffer
              : selectedCategory 
              ? selectedCategory
              : 'الشاليهات والمنتجعات'
            }
          </h1>
          <p className="text-xl text-muted-foreground font-arabic max-w-2xl mx-auto">
            {selectedOffer 
              ? 'تفاصيل العرض المحدد'
              : selectedCategory 
              ? `${filteredOffers.length} ${filteredOffers.length === 1 ? 'وحدة متاحة' : 'وحدات متاحة'}`
              : 'استمتع بإقامة فاخرة في أجمل المواقع السياحية'
            }
          </p>
        </div>

      {!selectedCategory && !selectedOffer ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const categoryOffers = offers.filter(offer => offer.category === category);
            const firstOffer = categoryOffers[0];
            
            return (
              <Card 
                key={category}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-elegant border-primary/20"
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader className="p-0">
                  {firstOffer?.images?.[0] && (
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={firstOffer.images[0]}
                        alt={category}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 right-4 text-white text-right">
                        <h3 className="text-2xl font-bold font-arabic">{category}</h3>
                        <p className="text-sm opacity-90 font-arabic">
                          {categoryOffers.length} {categoryOffers.length === 1 ? 'وحدة' : 'وحدات'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              <Button
                onClick={() => window.open('https://awqattravel.com/', '_blank')}
                className="font-arabic bg-blue-600 hover:bg-blue-700 text-white"
              >
                عروض العمرة والسياحة
              </Button>
              {selectedOffer ? (
                <Button
                  onClick={() => {
                    setSelectedOffer(null);
                    window.history.pushState({}, '', '/chalets');
                  }}
                  className="font-arabic bg-orange-500 hover:bg-orange-600 text-white"
                >
                  العودة لجميع العروض
                </Button>
              ) : (
                <Button
                  onClick={() => setSelectedCategory(null)}
                  className="font-arabic bg-orange-500 hover:bg-orange-600 text-white"
                >
                  العودة للفئات
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredOffers.map((offer, index) => (
              <Card
                key={index}
                id={`offer-${offer.name.replace(/\s+/g, '-')}`}
                className="group transform transition-all duration-300 hover:scale-105 hover:shadow-elegant border-primary/20"
              >
                <CardHeader className="p-0 relative">
                  <ImageSlider images={offer.images} offerName={offer.name} />
                  
                  {offer.video && (
                    <button
                      onClick={() => handleVideoPlay(offer.video)}
                      className="absolute top-2 right-2 bg-primary text-white p-2 rounded-full hover:bg-primary/80 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-right">
                      <h3 className="text-xl font-bold font-arabic text-primary mb-2">{offer.name}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4 justify-start">
                        {offer.floors && (
                          <Badge variant="secondary" className="font-arabic text-xs">
                            <Layers className="h-3 w-3 mr-1" />
                            عدد الأدوار ({offer.floors})
                          </Badge>
                        )}
                         {offer.masterRooms && (
                           <Badge variant="secondary" className="font-arabic text-xs">
                             <Home className="h-3 w-3 mr-1" />
                             عدد الغرف الماستر ({offer.masterRooms})
                           </Badge>
                         )}
                         {offer.regularRooms && (
                           <Badge variant="secondary" className="font-arabic text-xs">
                             <Home className="h-3 w-3 mr-1" />
                             عدد الغرف العادية ({offer.regularRooms})
                           </Badge>
                         )}
                        {offer.bathrooms && (
                          <Badge variant="secondary" className="font-arabic text-xs">
                            <Bath className="h-3 w-3 mr-1" />
                            عدد الحمامات ({offer.bathrooms})
                          </Badge>
                        )}
                      </div>

                      {offer.facilities && (
                        <div className="mb-4">
                          <p className="text-sm font-bold font-arabic mb-2">المرافق:</p>
                          <div className="flex flex-wrap gap-1">
                            {offer.facilities.split(',').map((facility, idx) => {
                              const colors = [
                                'bg-red-500/20 text-red-700 border-red-300',
                                'bg-blue-500/20 text-blue-700 border-blue-300',
                                'bg-green-500/20 text-green-700 border-green-300',
                                'bg-purple-500/20 text-purple-700 border-purple-300',
                                'bg-orange-500/20 text-orange-700 border-orange-300',
                                'bg-pink-500/20 text-pink-700 border-pink-300',
                                'bg-cyan-500/20 text-cyan-700 border-cyan-300',
                                'bg-yellow-500/20 text-yellow-700 border-yellow-300'
                              ];
                              return (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 rounded-full text-xs font-arabic border ${colors[idx % colors.length]}`}
                                >
                                  {facility.trim()}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {offer.price1 && offer.priceLabel1 && (
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div className="font-arabic">
                            <div className="font-bold text-primary">{offer.priceLabel1}</div>
                            {offer.startDate1 && offer.endDate1 && (
                              <div className="text-xs text-muted-foreground">
                                من {offer.startDate1} إلى {offer.endDate1}
                              </div>
                            )}
                          </div>
                          <div className="text-lg font-bold text-gold">{offer.price1} د.ك</div>
                        </div>
                      )}

                      {offer.price2 && offer.priceLabel2 && (
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div className="font-arabic">
                            <div className="font-bold text-primary">{offer.priceLabel2}</div>
                            {offer.startDate2 && offer.endDate2 && (
                              <div className="text-xs text-muted-foreground">
                                من {offer.startDate2} إلى {offer.endDate2}
                              </div>
                            )}
                          </div>
                          <div className="text-lg font-bold text-gold">{offer.price2} د.ك</div>
                        </div>
                      )}

                      {offer.price3 && offer.priceLabel3 && (
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div className="font-arabic">
                            <div className="font-bold text-primary">{offer.priceLabel3}</div>
                            {offer.startDate3 && offer.endDate3 && (
                              <div className="text-xs text-muted-foreground">
                                من {offer.startDate3} إلى {offer.endDate3}
                              </div>
                            )}
                          </div>
                          <div className="text-lg font-bold text-gold">{offer.price3} د.ك</div>
                        </div>
                      )}
                    </div>

                    {offer.details && (
                      <p className="text-sm text-muted-foreground font-arabic bg-muted/50 p-3 rounded-lg">
                        {offer.details}
                      </p>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleWhatsAppContact(offer)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-arabic"
                      >
                        احجز الآن
                      </Button>
                      
                      <Button
                        onClick={() => downloadOffer(offer)}
                        variant="outline"
                        size="sm"
                        className="font-arabic"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={() => handleShare(offer)}
                        variant="outline"
                        size="sm"
                        className="font-arabic"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      </div>

      {notification && (
        <Notification
          message={notification.message}
          show={notification.show}
          onHide={() => setNotification(null)}
        />
      )}

      <ImageGallery
        images={galleryImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      <VideoModal
        videoUrl={videoUrl}
        title="فيديو الشاليه"
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
};

export default ChaletsOffers;