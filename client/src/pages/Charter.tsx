import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Users, Briefcase, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const fleet = [
  {
    aircraft: 'Boeing 737-300',
    seats: 144,
    range: '2850 km',
    features: ['Comfortable seating', 'Galley service', 'Lavatory facilities'],
    featuresAr: ['مقاعد مريحة', 'خدمة المطبخ', 'مرافق دورات المياه'],
  },
  {
    aircraft: 'Airbus A320-200',
    seats: 166,
    range: '6300 km',
    features: ['Modern avionics', 'In-flight entertainment', 'Premium catering'],
    featuresAr: ['أنظمة حديثة', 'ترفيه أثناء الرحلة', 'تموين متميز'],
  },
  {
    aircraft: 'Boeing 767-200',
    seats: 288,
    range: '7590 km',
    features: ['Wide-body comfort', 'Cargo capacity', 'Long-range capability'],
    featuresAr: ['راحة الجسم العريض', 'سعة الشحن', 'قدرة المدى الطويل'],
  },
];

const services = [
  {
    title: 'Charter Flights',
    titleAr: 'الرحلات المستأجرة',
    description: 'Full aircraft rental for groups, events, and special occasions',
    descriptionAr: 'استئجار الطائرة بالكامل للمجموعات والأحداث والمناسبات الخاصة',
  },
  {
    title: 'ACMI Leasing',
    titleAr: 'تأجير ACMI',
    description: 'Aircraft, Crew, Maintenance, and Insurance solutions',
    descriptionAr: 'حلول الطائرة والطاقم والصيانة والتأمين',
  },
  {
    title: 'Group Travel',
    titleAr: 'السفر الجماعي',
    description: 'Customized group packages with dedicated support',
    descriptionAr: 'حزم جماعية مخصصة مع دعم مخصص',
  },
  {
    title: 'Hajj & Umrah',
    titleAr: 'الحج والعمرة',
    description: 'Specialized operations for pilgrimage travel',
    descriptionAr: 'عمليات متخصصة لسفر الحج',
  },
];

export default function Charter() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    route: '',
    dates: '',
    passengers: '',
    requirements: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (formData.company && formData.name && formData.email) {
      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          company: '',
          name: '',
          email: '',
          phone: '',
          route: '',
          dates: '',
          passengers: '',
          requirements: '',
        });
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === 'en'
              ? 'Charter & ACMI Services'
              : 'خدمات الرحلات المستأجرة و ACMI'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Premium B2B solutions for airlines, tour operators, and corporate clients'
              : 'حلول B2B متميزة لشركات الطيران وموظفي الجولات والعملاء الشركاتيين'}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, idx) => (
            <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
              <Briefcase className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="font-bold text-primary mb-2">
                {language === 'en' ? service.title : service.titleAr}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? service.description : service.descriptionAr}
              </p>
            </Card>
          ))}
        </div>

        {/* Fleet Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            {language === 'en' ? 'Our Fleet' : 'أسطولنا'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fleet.map((aircraft, idx) => (
              <Card key={idx} className="p-6">
                <h3 className="text-lg font-bold text-primary mb-4">
                  {aircraft.aircraft}
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-3 bg-secondary/5 rounded">
                    <span className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Capacity' : 'السعة'}
                    </span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {aircraft.seats}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-secondary/5 rounded">
                    <span className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Range' : 'المدى'}
                    </span>
                    <span className="font-bold text-primary">
                      {aircraft.range}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    {language === 'en' ? 'Features' : 'الميزات'}
                  </p>
                  <ul className="space-y-1">
                    {(language === 'en'
                      ? aircraft.features
                      : aircraft.featuresAr
                    ).map((feature, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-12 bg-primary/5 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-primary mb-6">
            {language === 'en'
              ? 'Why Choose Jordan Aviation'
              : 'لماذا تختار الأردنية للطيران'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: language === 'en' ? 'Safety & Compliance' : 'السلامة والامتثال',
                description: language === 'en'
                  ? 'IATA and BSP certified with rigorous safety protocols'
                  : 'معتمدة من IATA و BSP مع بروتوكولات سلامة صارمة',
              },
              {
                title: language === 'en' ? '24/7 Support' : 'دعم 24/7',
                description: language === 'en'
                  ? 'Dedicated customer service team available round the clock'
                  : 'فريق خدمة العملاء المخصص متاح على مدار الساعة',
              },
              {
                title: language === 'en' ? 'Competitive Pricing' : 'أسعار تنافسية',
                description: language === 'en'
                  ? 'Flexible rates and customized packages for all budgets'
                  : 'أسعار مرنة وحزم مخصصة لجميع الميزانيات',
              },
              {
                title: language === 'en' ? 'Operational Excellence' : 'التميز التشغيلي',
                description: language === 'en'
                  ? 'Modern fleet with experienced crew and maintenance teams'
                  : 'أسطول حديث مع طاقم وفرق صيانة ذوي خبرة',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Request Form */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-primary mb-6">
            {language === 'en'
              ? 'Request a Quote'
              : 'طلب عرض أسعار'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Company Name' : 'اسم الشركة'}
              </label>
              <Input
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder={language === 'en' ? 'Your company' : 'شركتك'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Contact Name' : 'اسم المتصل'}
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={language === 'en' ? 'Full name' : 'الاسم الكامل'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Phone' : 'الهاتف'}
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+962 6 445 5555"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Route' : 'الطريق'}
              </label>
              <Input
                value={formData.route}
                onChange={(e) =>
                  setFormData({ ...formData, route: e.target.value })
                }
                placeholder="e.g., AMM-CAI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Dates' : 'التواريخ'}
              </label>
              <Input
                type="date"
                value={formData.dates}
                onChange={(e) =>
                  setFormData({ ...formData, dates: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === 'en' ? 'Number of Passengers' : 'عدد الركاب'}
              </label>
              <Input
                type="number"
                value={formData.passengers}
                onChange={(e) =>
                  setFormData({ ...formData, passengers: e.target.value })
                }
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {language === 'en'
                ? 'Special Requirements'
                : 'متطلبات خاصة'}
            </label>
            <Textarea
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
              placeholder={language === 'en'
                ? 'Describe your needs...'
                : 'صف احتياجاتك...'}
              rows={4}
            />
          </div>

          <div className="mt-6 flex gap-2">
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90"
            >
              {language === 'en' ? 'Submit Request' : 'إرسال الطلب'}
            </Button>

            {submitted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>
                  {language === 'en'
                    ? 'Quote request submitted successfully!'
                    : 'تم إرسال طلب العرض بنجاح!'}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
