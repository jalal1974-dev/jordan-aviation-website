import { useState } from 'react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Copy, Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const offers = [
  {
    id: 1,
    title: 'Early Bird Special',
    titleAr: 'عرض الطيور المبكرة',
    description: 'Book 30 days in advance and save 20%',
    descriptionAr: 'احجز قبل 30 يوماً واحفظ 20%',
    discount: '20%',
    routes: ['AMM-CAI', 'AMM-KWI'],
    validUntil: 'March 31, 2026',
    validUntilAr: '31 مارس 2026',
    code: 'EARLY20',
    featured: true,
  },
  {
    id: 2,
    title: 'Weekend Getaway',
    titleAr: 'عطلة نهاية الأسبوع',
    description: 'Fly Friday-Sunday and get 15% off',
    descriptionAr: 'سافر الجمعة-الأحد واحصل على 15% خصم',
    discount: '15%',
    routes: ['AMM-CAI', 'AMM-IST'],
    validUntil: 'April 30, 2026',
    validUntilAr: '30 أبريل 2026',
    code: 'WEEKEND15',
  },
  {
    id: 3,
    title: 'Group Travel',
    titleAr: 'السفر الجماعي',
    description: 'Groups of 10+ save 25% per ticket',
    descriptionAr: 'مجموعات من 10+ توفر 25% لكل تذكرة',
    discount: '25%',
    routes: ['All Routes'],
    validUntil: 'Ongoing',
    validUntilAr: 'مستمر',
    code: 'GROUP25',
  },
  {
    id: 4,
    title: 'Student Discount',
    titleAr: 'خصم الطلاب',
    description: 'Valid student ID gets 10% off',
    descriptionAr: 'بطاقة طالب صالحة تحصل على 10% خصم',
    discount: '10%',
    routes: ['All Routes'],
    validUntil: 'Ongoing',
    validUntilAr: 'مستمر',
    code: 'STUDENT10',
  },
];

export default function Offers() {
  const { language, currency } = useLanguage();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === 'en' ? 'Special Offers' : 'العروض الخاصة'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Discover amazing deals and save on your next flight'
              : 'اكتشف صفقات رائعة واحفظ على رحلتك القادمة'}
          </p>
        </div>

        {/* Featured Offers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {offers.map((offer) => (
            <Card
              key={offer.id}
              className={`p-6 relative overflow-hidden ${
                offer.featured ? 'border-accent border-2 bg-accent/5' : ''
              }`}
            >
              {offer.featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-accent text-accent-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {language === 'en' ? 'Featured' : 'مميز'}
                  </Badge>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-primary mb-1">
                  {language === 'en' ? offer.title : offer.titleAr}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? offer.description : offer.descriptionAr}
                </p>
              </div>

              <div className="mb-4">
                <div className="text-4xl font-bold text-accent mb-2">
                  {offer.discount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Discount' : 'الخصم'}
                </p>
              </div>

              <div className="mb-4 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {language === 'en' ? 'Valid Routes' : 'الطرق الصالحة'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {offer.routes.map((route, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Valid Until' : 'صالح حتى'}
                  </p>
                  <p className="text-sm font-medium">
                    {language === 'en' ? offer.validUntil : offer.validUntilAr}
                  </p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-primary/5 rounded-lg flex items-center justify-between">
                <code className="font-mono font-bold text-primary">
                  {offer.code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyCode(offer.code)}
                  className="gap-1"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-4 h-4" />
                      {language === 'en' ? 'Copied' : 'تم النسخ'}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {language === 'en' ? 'Copy' : 'نسخ'}
                    </>
                  )}
                </Button>
              </div>

              <Link href="/book">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  {language === 'en' ? 'Book Now' : 'احجز الآن'}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Deal Alerts Signup */}
        <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-primary mb-2">
              {language === 'en'
                ? 'Never Miss a Deal'
                : 'لا تفوت أي عرض'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'en'
                ? 'Subscribe to our newsletter and get exclusive offers delivered to your inbox'
                : 'اشترك في نشرتنا الإخبارية واحصل على عروض حصرية في بريدك الإلكتروني'}
            </p>

            <div className="flex gap-2 mb-4">
              <Input
                type="email"
                placeholder={language === 'en' ? 'your@email.com' : 'بريدك@البريد.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleSubscribe}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {language === 'en' ? 'Subscribe' : 'اشترك'}
              </Button>
            </div>

            {subscribed && (
              <p className="text-sm text-green-600">
                {language === 'en'
                  ? 'Thank you! Check your email for exclusive offers.'
                  : 'شكراً! تحقق من بريدك الإلكتروني للحصول على عروض حصرية.'}
              </p>
            )}

            <div className="flex gap-4 mt-6 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-muted-foreground">
                  {language === 'en'
                    ? 'Email notifications'
                    : 'إشعارات البريد الإلكتروني'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-muted-foreground">
                  {language === 'en'
                    ? 'WhatsApp updates'
                    : 'تحديثات WhatsApp'}
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Terms Section */}
        <div className="mt-8 p-6 bg-secondary/5 rounded-lg">
          <h3 className="font-bold text-primary mb-2">
            {language === 'en' ? 'Terms & Conditions' : 'الشروط والأحكام'}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • {language === 'en'
                ? 'Promo codes cannot be combined'
                : 'لا يمكن دمج رموز الترويج'}
            </li>
            <li>
              • {language === 'en'
                ? 'Discounts apply to base fare only'
                : 'تنطبق الخصومات على السعر الأساسي فقط'}
            </li>
            <li>
              • {language === 'en'
                ? 'Blackout dates may apply'
                : 'قد تنطبق تواريخ الإغلاق'}
            </li>
            <li>
              • {language === 'en'
                ? 'Limited seats available at discounted rates'
                : 'عدد محدود من المقاعد المتاحة بأسعار مخفضة'}
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
