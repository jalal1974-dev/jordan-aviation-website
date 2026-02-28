import { useState } from 'react';
import { Link } from 'wouter';
import { Calendar, MapPin, Users, Briefcase, ArrowRight, Star, TrendingDown, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const destinations = [
  { code: 'CAI', name: 'Cairo', ar: 'القاهرة', image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-cairo-nile-JtaeVtqyX37fkKPyHyPcbE.webp', price: 89, currency: 'USD' },
  { code: 'KWI', name: 'Kuwait', ar: 'الكويت', image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-gulf-skyline-gPdzZ2j6tpLFeqw47QqiKH.webp', price: 120, currency: 'USD' },
  { code: 'BGW', name: 'Baghdad', ar: 'بغداد', image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-istanbul-bosphorus-k9LT9opdZJyD2vMw3yPn7A.webp', price: 110, currency: 'USD' },
  { code: 'IST', name: 'Istanbul', ar: 'اسطنبول', image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-istanbul-bosphorus-k9LT9opdZJyD2vMw3yPn7A.webp', price: 145, currency: 'USD' },
  { code: 'TBS', name: 'Tbilisi', ar: 'تبليسي', image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-gulf-skyline-gPdzZ2j6tpLFeqw47QqiKH.webp', price: 165, currency: 'USD' },
  { code: 'BAK', name: 'Baku', ar: 'باكو', image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-gulf-skyline-gPdzZ2j6tpLFeqw47QqiKH.webp', price: 175, currency: 'USD' },
];

const fareCalendar = [
  { day: 1, price: 95, available: true },
  { day: 2, price: 89, available: true, best: true },
  { day: 3, price: 92, available: true },
  { day: 4, price: 110, available: false },
  { day: 5, price: 105, available: true },
  { day: 6, price: 98, available: true },
  { day: 7, price: 115, available: true },
];

const whyChooseUs = [
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Safety First',
    titleAr: 'السلامة أولاً',
    description: 'Modern fleet with rigorous maintenance and safety protocols',
    descriptionAr: 'أسطول حديث مع صيانة صارمة وبروتوكولات السلامة',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Direct Routes',
    titleAr: 'رحلات مباشرة',
    description: 'Non-stop flights to major Middle Eastern destinations',
    descriptionAr: 'رحلات مباشرة إلى الوجهات الرئيسية في الشرق الأوسط',
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'Premium Service',
    titleAr: 'خدمة متميزة',
    description: 'Exceptional customer care from booking to landing',
    descriptionAr: 'رعاية عملاء استثنائية من الحجز إلى الهبوط',
  },
  {
    icon: <TrendingDown className="w-6 h-6" />,
    title: 'Best Fares',
    titleAr: 'أفضل الأسعار',
    description: 'Competitive pricing with flexible booking options',
    descriptionAr: 'أسعار تنافسية مع خيارات حجز مرنة',
  },
];

export default function Home() {
  const { language, t, isRTL, currency } = useLanguage();
  const [from, setFrom] = useState('AMM');
  const [to, setTo] = useState('CAI');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [cabin, setCabin] = useState('economy');
  const [promoCode, setPromoCode] = useState('');

  const handleSearch = () => {
    console.log('Search:', { from, to, departDate, returnDate, passengers, cabin, promoCode });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section
        className="relative h-96 md:h-[500px] bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/hero-amman-skyline-kQa6vFg4eb5toPJ2CHzLsr.webp')`,
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className={`relative z-10 text-center text-white max-w-2xl px-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {language === 'en' ? 'Fly with Confidence' : 'اطر بثقة'}
          </h1>
          <p className="text-lg md:text-xl opacity-95">
            {language === 'en'
              ? 'Premium airline service connecting the Middle East'
              : 'خدمة طيران متميزة تربط الشرق الأوسط'}
          </p>
        </div>
      </section>

      {/* Search Widget */}
      <section className="bg-white border-b border-border">
        <div className="container py-8">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">
              {language === 'en' ? 'Search Flights' : 'ابحث عن الرحلات'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
              {/* From */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('search.from')}
                </label>
                <Select value={from} onValueChange={setFrom}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AMM">Amman (AMM)</SelectItem>
                    <SelectItem value="CAI">Cairo (CAI)</SelectItem>
                    <SelectItem value="KWI">Kuwait (KWI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* To */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('search.to')}
                </label>
                <Select value={to} onValueChange={setTo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAI">Cairo (CAI)</SelectItem>
                    <SelectItem value="KWI">Kuwait (KWI)</SelectItem>
                    <SelectItem value="BGW">Baghdad (BGW)</SelectItem>
                    <SelectItem value="IST">Istanbul (IST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Depart Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('search.depart')}
                </label>
                <Input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('search.return')}
                </label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('search.passengers')}
                </label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cabin */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('search.cabin')}
                </label>
                <Select value={cabin} onValueChange={setCabin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">
                      {language === 'en' ? 'Economy' : 'اقتصادي'}
                    </SelectItem>
                    <SelectItem value="business">
                      {language === 'en' ? 'Business' : 'رجال الأعمال'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {t('search.button')}
                </Button>
              </div>
            </div>

            {/* Promo Code */}
            <div className="flex gap-2">
              <Input
                placeholder={t('search.promo')}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline">
                {language === 'en' ? 'Apply' : 'تطبيق'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Fare Calendar */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-secondary/5">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">
              {language === 'en' ? 'Lowest Fares' : 'أقل الأسعار'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Amman to Cairo - March 2026'
                : 'عمّان إلى القاهرة - مارس 2026'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {fareCalendar.map((item) => (
              <Card
                key={item.day}
                className={`p-4 text-center cursor-pointer transition-all hover:shadow-lg ${
                  item.best ? 'border-accent border-2 bg-accent/5' : ''
                } ${!item.available ? 'opacity-50' : ''}`}
              >
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {language === 'en' ? `Mar ${item.day}` : `مار ${item.day}`}
                </div>
                <div className="text-2xl font-bold text-primary mb-2">
                  {currency === 'USD' ? '$' : ''}{item.price}
                </div>
                {item.best && (
                  <div className="text-xs font-semibold text-accent bg-accent/10 rounded px-2 py-1">
                    {language === 'en' ? 'Best' : 'الأفضل'}
                  </div>
                )}
                {!item.available && (
                  <div className="text-xs text-destructive">
                    {language === 'en' ? 'Sold Out' : 'مباع'}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">
              {language === 'en' ? 'Popular from Amman' : 'الوجهات الشهيرة من عمّان'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Explore our most popular destinations'
                : 'استكشف وجهاتنا الأكثر شهرة'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <Card
                key={dest.code}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-primary">
                        {language === 'en' ? dest.name : dest.ar}
                      </h3>
                      <p className="text-sm text-muted-foreground">{dest.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent">
                        {currency === 'USD' ? '$' : ''}{dest.price}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' ? 'from' : 'من'}
                      </p>
                    </div>
                  </div>
                  <Link href="/book">
                    <a className="inline-flex items-center gap-2 text-primary hover:text-accent font-medium text-sm mt-4">
                      {language === 'en' ? 'Book Now' : 'احجز الآن'}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Jordan Aviation */}
      <section className="py-12 md:py-16 bg-primary/5">
        <div className="container">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">
              {language === 'en' ? 'Why Jordan Aviation' : 'لماذا الأردنية للطيران'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Experience the difference with our premium service'
                : 'اختبر الفرق مع خدمتنا المتميزة'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4 text-accent">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  {language === 'en' ? item.title : item.titleAr}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? item.description : item.descriptionAr}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ancillaries & Bundles */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">
                {language === 'en' ? 'Enhance Your Journey' : 'حسّن رحلتك'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'en'
                  ? 'Add baggage, select premium seats, or upgrade to business class. Customize your flight experience.'
                  : 'أضف أمتعة، اختر مقاعد متميزة، أو ارقِ إلى درجة رجال الأعمال. خصص تجربة رحلتك.'}
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: language === 'en' ? 'Extra Baggage' : 'أمتعة إضافية',
                    price: '$25',
                  },
                  {
                    title: language === 'en' ? 'Seat Selection' : 'اختيار المقعد',
                    price: '$15',
                  },
                  {
                    title: language === 'en' ? 'Meal Upgrade' : 'ترقية الوجبة',
                    price: '$10',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-secondary/5 rounded-lg">
                    <span className="font-medium text-foreground">{item.title}</span>
                    <span className="font-bold text-accent">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-64 md:h-96 bg-muted rounded-lg overflow-hidden">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/hero-aircraft-cabin-LSmtth9LzX7MtT5iW2pWAo.webp"
                alt="Premium Cabin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'en' ? 'Stay Updated' : 'ابقَ محدثاً'}
          </h2>
          <p className="mb-6 opacity-90">
            {language === 'en'
              ? 'Subscribe to our newsletter for exclusive deals and travel updates'
              : 'اشترك في نشرتنا الإخبارية للحصول على عروض حصرية وتحديثات السفر'}
          </p>

          <div className="flex gap-2">
            <Input
              type="email"
              placeholder={language === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني'}
              className="bg-primary-foreground text-foreground"
            />
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {language === 'en' ? 'Subscribe' : 'اشترك'}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
