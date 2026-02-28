import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Phone, MapPin, Search } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const faqs = [
  {
    category: 'Booking',
    categoryAr: 'الحجز',
    questions: [
      {
        q: 'How do I book a flight?',
        qAr: 'كيف أحجز رحلة؟',
        a: 'Visit our website, select your route and dates, choose your flight, enter passenger details, and complete payment.',
        aAr: 'قم بزيارة موقعنا، واختر مسارك والتواريخ، واختر رحلتك، وأدخل تفاصيل الركاب، وأكمل الدفع.',
      },
      {
        q: 'Can I modify my booking?',
        qAr: 'هل يمكنني تعديل حجزي؟',
        a: 'Yes, you can modify your booking through Manage Booking. Changes may incur additional fees.',
        aAr: 'نعم، يمكنك تعديل حجزك من خلال إدارة الحجز. قد تتطلب التغييرات رسوماً إضافية.',
      },
    ],
  },
  {
    category: 'Check-in & Boarding',
    categoryAr: 'الحجز والصعود',
    questions: [
      {
        q: 'When should I arrive at the airport?',
        qAr: 'متى يجب أن أصل إلى المطار؟',
        a: 'International flights: 3 hours before. Regional flights: 2 hours before.',
        aAr: 'الرحلات الدولية: 3 ساعات قبل. الرحلات الإقليمية: ساعتان قبل.',
      },
      {
        q: 'Can I check in online?',
        qAr: 'هل يمكنني الحجز عبر الإنترنت؟',
        a: 'Yes, online check-in opens 24 hours before departure.',
        aAr: 'نعم، يفتح الحجز عبر الإنترنت قبل 24 ساعة من المغادرة.',
      },
    ],
  },
];

const contactMethods = [
  {
    icon: Phone,
    title: 'Phone',
    titleAr: 'الهاتف',
    value: '+962 6 445 5555',
    description: 'Available 24/7',
    descriptionAr: 'متاح 24/7',
  },
  {
    icon: Mail,
    title: 'Email',
    titleAr: 'البريد الإلكتروني',
    value: 'support@jordanaviation.com',
    description: 'Response within 2 hours',
    descriptionAr: 'الرد خلال ساعتين',
  },
  {
    icon: MapPin,
    title: 'Office',
    titleAr: 'المكتب',
    value: 'Queen Alia International Airport',
    valueAr: 'مطار الملكة علياء الدولي',
    description: 'Amman, Jordan',
    descriptionAr: 'عمّان، الأردن',
  },
];

export default function HelpCenter() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {language === 'en' ? 'Help Center' : 'مركز المساعدة'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Find answers to common questions and get support'
              : 'ابحث عن إجابات للأسئلة الشائعة واحصل على الدعم'}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search for help...' : 'ابحث عن مساعدة...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-primary mb-4">
              {language === 'en' ? 'Contact Us' : 'اتصل بنا'}
            </h2>
            <div className="space-y-4">
              {contactMethods.map((method, idx) => {
                const Icon = method.icon;
                return (
                  <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex gap-3">
                      <Icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-foreground">
                          {language === 'en' ? method.title : method.titleAr}
                        </h4>
                        <p className="text-sm font-medium text-primary">
                          {language === 'en' ? method.value : method.valueAr || method.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'en'
                            ? method.description
                            : method.descriptionAr}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-primary mb-4">
              {language === 'en'
                ? 'Frequently Asked Questions'
                : 'الأسئلة الشائعة'}
            </h2>

            <div className="space-y-6">
              {faqs.map((category, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-foreground mb-3">
                    {language === 'en'
                      ? category.category
                      : category.categoryAr}
                  </h3>
                  <Accordion type="single" collapsible>
                    {category.questions.map((item, qIdx) => (
                      <AccordionItem
                        key={qIdx}
                        value={`${idx}-${qIdx}`}
                        className="border border-border rounded-lg mb-2"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/5">
                          {language === 'en' ? item.q : item.qAr}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3 text-muted-foreground">
                          {language === 'en' ? item.a : item.aAr}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Still Need Help */}
        <Card className="mt-8 p-8 bg-primary/5 text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">
            {language === 'en'
              ? 'Still Need Help?'
              : 'هل تحتاج إلى مساعدة أخرى؟'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'en'
              ? 'Our customer support team is ready to assist you'
              : 'فريق دعم العملاء لدينا جاهز لمساعدتك'}
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            {language === 'en' ? 'Contact Support' : 'اتصل بالدعم'}
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
