import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, MapPin, Briefcase, Heart, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TravelInfo() {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === 'en' ? 'Travel Information' : 'معلومات السفر'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Everything you need to know before your flight'
              : 'كل ما تحتاج معرفته قبل رحلتك'}
          </p>
        </div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="documents">
              {language === 'en' ? 'Documents' : 'المستندات'}
            </TabsTrigger>
            <TabsTrigger value="baggage">
              {language === 'en' ? 'Baggage' : 'الأمتعة'}
            </TabsTrigger>
            <TabsTrigger value="health">
              {language === 'en' ? 'Health' : 'الصحة'}
            </TabsTrigger>
            <TabsTrigger value="checkin">
              {language === 'en' ? 'Check-in' : 'الحجز'}
            </TabsTrigger>
            <TabsTrigger value="onboard">
              {language === 'en' ? 'On Board' : 'على الطائرة'}
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {language === 'en'
                  ? 'Travel Documents Required'
                  : 'المستندات المطلوبة للسفر'}
              </h2>

              <div className="space-y-4">
                {[
                  {
                    title: language === 'en' ? 'Passport' : 'جواز السفر',
                    requirements: language === 'en'
                      ? 'Valid for at least 6 months from your travel date'
                      : 'صالح لمدة 6 أشهر على الأقل من تاريخ السفر',
                  },
                  {
                    title: language === 'en' ? 'Visa' : 'التأشيرة',
                    requirements: language === 'en'
                      ? 'Check visa requirements for your destination country'
                      : 'تحقق من متطلبات التأشيرة لدولة الوجهة',
                  },
                  {
                    title: language === 'en' ? 'Boarding Pass' : 'بطاقة الصعود',
                    requirements: language === 'en'
                      ? 'Print or have digital copy available'
                      : 'اطبع أو احصل على نسخة رقمية',
                  },
                  {
                    title: language === 'en' ? 'Travel Insurance' : 'تأمين السفر',
                    requirements: language === 'en'
                      ? 'Recommended for all international flights'
                      : 'موصى به لجميع الرحلات الدولية',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg flex gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.requirements}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900">
                    {language === 'en'
                      ? 'Visa Requirements'
                      : 'متطلبات التأشيرة'}
                  </p>
                  <p className="text-sm text-blue-800">
                    {language === 'en'
                      ? 'Please check with your destination country embassy for current visa requirements.'
                      : 'يرجى التحقق من سفارة دولة الوجهة للحصول على متطلبات التأشيرة الحالية.'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Baggage Tab */}
          <TabsContent value="baggage" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {language === 'en' ? 'Baggage Allowance' : 'حد الأمتعة'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  {
                    type: language === 'en' ? 'Carry-on' : 'الأمتعة اليدوية',
                    weight: '7 kg',
                    dimensions: '55 x 40 x 20 cm',
                    items: 1,
                  },
                  {
                    type: language === 'en' ? 'Checked Baggage' : 'الأمتعة المسجلة',
                    weight: '20 kg',
                    dimensions: 'Standard',
                    items: 1,
                  },
                  {
                    type: language === 'en' ? 'Extra Baggage' : 'أمتعة إضافية',
                    weight: '23 kg',
                    dimensions: 'Standard',
                    items: 'Available',
                  },
                ].map((bag, idx) => (
                  <Card key={idx} className="p-4 bg-secondary/5">
                    <h4 className="font-bold text-primary mb-3">{bag.type}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">
                          {language === 'en' ? 'Weight' : 'الوزن'}
                        </p>
                        <p className="font-medium">{bag.weight}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {language === 'en' ? 'Dimensions' : 'الأبعاد'}
                        </p>
                        <p className="font-medium">{bag.dimensions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {language === 'en' ? 'Items' : 'العناصر'}
                        </p>
                        <p className="font-medium">{bag.items}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-primary">
                  {language === 'en'
                    ? 'Prohibited Items'
                    : 'العناصر المحظورة'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Weapons & explosives',
                    'Flammable liquids',
                    'Sharp objects',
                    'Lithium batteries (large)',
                    'Pressurized containers',
                    'Toxic substances',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {language === 'en'
                  ? 'Health & Safety'
                  : 'الصحة والسلامة'}
              </h2>

              <div className="space-y-4">
                {[
                  {
                    title: language === 'en' ? 'Vaccinations' : 'التطعيمات',
                    description: language === 'en'
                      ? 'Check if vaccinations are required for your destination'
                      : 'تحقق مما إذا كانت التطعيمات مطلوبة لوجهتك',
                  },
                  {
                    title: language === 'en' ? 'Medical Conditions' : 'الحالات الطبية',
                    description: language === 'en'
                      ? 'Inform us of any medical conditions requiring special assistance'
                      : 'أخبرنا عن أي حالات طبية تتطلب مساعدة خاصة',
                  },
                  {
                    title: language === 'en' ? 'Medications' : 'الأدوية',
                    description: language === 'en'
                      ? 'Carry medications in original containers with prescriptions'
                      : 'احمل الأدوية في حاويات أصلية مع وصفات طبية',
                  },
                  {
                    title: language === 'en' ? 'Pregnancy' : 'الحمل',
                    description: language === 'en'
                      ? 'Pregnant passengers should inform us during booking'
                      : 'يجب على الحوامل إخبارنا أثناء الحجز',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg flex gap-3">
                    <Heart className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Check-in Tab */}
          <TabsContent value="checkin" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {language === 'en'
                  ? 'Check-in Information'
                  : 'معلومات الحجز'}
              </h2>

              <div className="space-y-4">
                {[
                  {
                    time: language === 'en' ? '3 hours before' : '3 ساعات قبل',
                    description: language === 'en'
                      ? 'International flights - arrive for check-in'
                      : 'الرحلات الدولية - اذهب للحجز',
                  },
                  {
                    time: language === 'en' ? '2 hours before' : 'ساعتان قبل',
                    description: language === 'en'
                      ? 'Regional flights - arrive for check-in'
                      : 'الرحلات الإقليمية - اذهب للحجز',
                  },
                  {
                    time: language === 'en' ? '1 hour before' : 'ساعة واحدة قبل',
                    description: language === 'en'
                      ? 'Online check-in closes'
                      : 'إغلاق الحجز عبر الإنترنت',
                  },
                  {
                    time: language === 'en' ? '30 minutes before' : '30 دقيقة قبل',
                    description: language === 'en'
                      ? 'Gate closure - boarding ends'
                      : 'إغلاق البوابة - انتهاء الصعود',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg flex gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-primary">{item.time}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900">
                    {language === 'en'
                      ? 'Important Reminder'
                      : 'تذكير مهم'}
                  </p>
                  <p className="text-sm text-yellow-800">
                    {language === 'en'
                      ? 'Arriving late may result in your booking being cancelled.'
                      : 'قد يؤدي الوصول المتأخر إلى إلغاء حجزك.'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* On Board Tab */}
          <TabsContent value="onboard" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {language === 'en'
                  ? 'On Board Services'
                  : 'الخدمات على الطائرة'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: language === 'en' ? 'Meals & Beverages' : 'الوجبات والمشروبات',
                    items: [
                      language === 'en'
                        ? 'Complimentary beverages'
                        : 'مشروبات مجانية',
                      language === 'en'
                        ? 'Snacks available'
                        : 'وجبات خفيفة متاحة',
                      language === 'en'
                        ? 'Special meals on request'
                        : 'وجبات خاصة عند الطلب',
                    ],
                  },
                  {
                    title: language === 'en' ? 'Entertainment' : 'الترفيه',
                    items: [
                      language === 'en'
                        ? 'In-flight magazine'
                        : 'مجلة على الطائرة',
                      language === 'en'
                        ? 'Music & podcasts'
                        : 'الموسيقى والبودكاست',
                      language === 'en'
                        ? 'Reading materials'
                        : 'مواد القراءة',
                    ],
                  },
                  {
                    title: language === 'en' ? 'Comfort' : 'الراحة',
                    items: [
                      language === 'en'
                        ? 'Comfortable seating'
                        : 'مقاعد مريحة',
                      language === 'en'
                        ? 'Blankets & pillows'
                        : 'بطانيات ووسائد',
                      language === 'en'
                        ? 'Lavatory facilities'
                        : 'مرافق دورات المياه',
                    ],
                  },
                  {
                    title: language === 'en' ? 'Assistance' : 'المساعدة',
                    items: [
                      language === 'en'
                        ? 'Friendly crew'
                        : 'طاقم ودود',
                      language === 'en'
                        ? 'Special assistance available'
                        : 'مساعدة خاصة متاحة',
                      language === 'en'
                        ? 'First aid kit on board'
                        : 'صندوق الإسعافات الأولية على الطائرة',
                    ],
                  },
                ].map((category, idx) => (
                  <Card key={idx} className="p-4 bg-secondary/5">
                    <h4 className="font-bold text-primary mb-3">
                      {category.title}
                    </h4>
                    <ul className="space-y-2">
                      {category.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
