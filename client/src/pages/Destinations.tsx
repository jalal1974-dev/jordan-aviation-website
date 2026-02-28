import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Users, Briefcase, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const destinationsList = [
  {
    code: 'CAI',
    name: 'Cairo',
    nameAr: 'القاهرة',
    country: 'Egypt',
    countryAr: 'مصر',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-cairo-nile-JtaeVtqyX37fkKPyHyPcbE.webp',
    description: 'Experience the magic of ancient Egypt with pyramids, museums, and vibrant culture',
    descriptionAr: 'اختبر سحر مصر القديمة مع الأهرامات والمتاحف والثقافة النابضة بالحياة',
    flights: 12,
    duration: '3h 30m',
    price: 89,
  },
  {
    code: 'KWI',
    name: 'Kuwait',
    nameAr: 'الكويت',
    country: 'Kuwait',
    countryAr: 'الكويت',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-gulf-skyline-gPdzZ2j6tpLFeqw47QqiKH.webp',
    description: 'Modern Gulf city with world-class shopping, dining, and business opportunities',
    descriptionAr: 'مدينة خليجية حديثة مع تسوق وطعام وفرص عمل من الدرجة الأولى',
    flights: 8,
    duration: '1h 15m',
    price: 120,
  },
  {
    code: 'BGW',
    name: 'Baghdad',
    nameAr: 'بغداد',
    country: 'Iraq',
    countryAr: 'العراق',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-istanbul-bosphorus-k9LT9opdZJyD2vMw3yPn7A.webp',
    description: 'Historic capital with rich cultural heritage and growing business sector',
    descriptionAr: 'عاصمة تاريخية بتراث ثقافي غني وقطاع أعمال متنام',
    flights: 6,
    duration: '1h 45m',
    price: 110,
  },
  {
    code: 'IST',
    name: 'Istanbul',
    nameAr: 'اسطنبول',
    country: 'Turkey',
    countryAr: 'تركيا',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-istanbul-bosphorus-k9LT9opdZJyD2vMw3yPn7A.webp',
    description: 'Bridge between continents with stunning architecture and bustling markets',
    descriptionAr: 'جسر بين القارات مع معمار مذهل والأسواق الصاخبة',
    flights: 10,
    duration: '4h 15m',
    price: 145,
  },
  {
    code: 'TBS',
    name: 'Tbilisi',
    nameAr: 'تبليسي',
    country: 'Georgia',
    countryAr: 'جورجيا',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-gulf-skyline-gPdzZ2j6tpLFeqw47QqiKH.webp',
    description: 'Emerging destination with wine, mountains, and warm Georgian hospitality',
    descriptionAr: 'وجهة ناشئة مع النبيذ والجبال والضيافة الجورجية الدافئة',
    flights: 4,
    duration: '5h 30m',
    price: 165,
  },
  {
    code: 'BAK',
    name: 'Baku',
    nameAr: 'باكو',
    country: 'Azerbaijan',
    countryAr: 'أذربيجان',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/destinations-gulf-skyline-gPdzZ2j6tpLFeqw47QqiKH.webp',
    description: 'Oil-rich capital with modern architecture and Caspian Sea views',
    descriptionAr: 'عاصمة غنية بالنفط مع معمار حديث وإطلالات على بحر قزوين',
    flights: 3,
    duration: '6h 00m',
    price: 175,
  },
];

export default function Destinations() {
  const { language, currency } = useLanguage();

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === 'en' ? 'Our Destinations' : 'وجهاتنا'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Explore our network of destinations across the Middle East and beyond'
              : 'استكشف شبكة وجهاتنا عبر الشرق الأوسط وما وراءه'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinationsList.map((dest) => (
            <Card
              key={dest.code}
              className="overflow-hidden hover:shadow-lg transition-shadow group"
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
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-primary">
                    {language === 'en' ? dest.name : dest.nameAr}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? dest.country : dest.countryAr}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'en' ? dest.description : dest.descriptionAr}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="bg-secondary/5 rounded p-2 text-center">
                    <p className="font-bold text-primary">{dest.flights}</p>
                    <p className="text-muted-foreground">
                      {language === 'en' ? 'Flights' : 'رحلات'}
                    </p>
                  </div>
                  <div className="bg-secondary/5 rounded p-2 text-center">
                    <p className="font-bold text-primary">{dest.duration}</p>
                    <p className="text-muted-foreground">
                      {language === 'en' ? 'Duration' : 'المدة'}
                    </p>
                  </div>
                  <div className="bg-secondary/5 rounded p-2 text-center">
                    <p className="font-bold text-accent">
                      {currency === 'USD' ? '$' : ''}{dest.price}
                    </p>
                    <p className="text-muted-foreground">
                      {language === 'en' ? 'From' : 'من'}
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90">
                  {language === 'en' ? 'Book Now' : 'احجز الآن'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* SEO Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold text-primary mb-6">
            {language === 'en'
              ? 'Destination Information'
              : 'معلومات الوجهات'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {destinationsList.slice(0, 2).map((dest) => (
              <Card key={dest.code} className="p-6">
                <h3 className="text-xl font-bold text-primary mb-4">
                  {language === 'en'
                    ? `Flights from Amman to ${dest.name}`
                    : `رحلات من عمّان إلى ${dest.nameAr}`}
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      {language === 'en' ? 'Best Time to Visit' : 'أفضل وقت للزيارة'}
                    </h4>
                    <p className="text-muted-foreground">
                      {language === 'en'
                        ? 'October to April offers pleasant weather and fewer crowds.'
                        : 'أكتوبر إلى أبريل يوفر طقساً لطيفاً وحشوداً أقل.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      {language === 'en' ? 'Airport Information' : 'معلومات المطار'}
                    </h4>
                    <p className="text-muted-foreground">
                      {language === 'en'
                        ? 'Modern facilities, multiple terminals, and excellent ground transportation.'
                        : 'مرافق حديثة وعدة محطات ونقل أرضي ممتاز.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      {language === 'en' ? 'Baggage Rules' : 'قواعد الأمتعة'}
                    </h4>
                    <p className="text-muted-foreground">
                      {language === 'en'
                        ? '1x 20kg checked baggage included. Additional baggage available for purchase.'
                        : 'أمتعة مسجلة واحدة بوزن 20 كجم مشمولة. أمتعة إضافية متاحة للشراء.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">
                      {language === 'en' ? 'Frequently Asked Questions' : 'الأسئلة الشائعة'}
                    </h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>
                        • {language === 'en'
                          ? 'What documents do I need?'
                          : 'ما المستندات التي أحتاجها؟'}
                      </li>
                      <li>
                        • {language === 'en'
                          ? 'Can I change my flight?'
                          : 'هل يمكنني تغيير رحلتي؟'}
                      </li>
                      <li>
                        • {language === 'en'
                          ? 'What is the refund policy?'
                          : 'ما هي سياسة الاسترجاع؟'}
                      </li>
                    </ul>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  {language === 'en' ? 'Learn More' : 'اعرف المزيد'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
