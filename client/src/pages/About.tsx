import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Award, Users, Globe } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function About() {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            {language === 'en'
              ? 'About Jordan Aviation'
              : 'حول الأردنية للطيران'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {language === 'en'
              ? 'Connecting the Middle East with excellence, reliability, and innovation since 1992.'
              : 'ربط الشرق الأوسط بالتميز والموثوقية والابتكار منذ عام 1992.'}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-8 bg-primary/5">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {language === 'en' ? 'Our Mission' : 'مهمتنا'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'To provide safe, reliable, and affordable air transportation services that connect people, cultures, and opportunities across the Middle East and beyond.'
                : 'توفير خدمات نقل جوي آمنة وموثوقة وبأسعار معقولة تربط الناس والثقافات والفرص عبر الشرق الأوسط وما وراءه.'}
            </p>
          </Card>

          <Card className="p-8 bg-accent/5">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {language === 'en' ? 'Our Vision' : 'رؤيتنا'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'To be the leading airline in the Middle East, recognized for our commitment to safety, customer service excellence, and operational efficiency.'
                : 'أن نكون الناقل الجوي الرائد في الشرق الأوسط، معروفون بالتزامنا بالسلامة وتميز خدمة العملاء والكفاءة التشغيلية.'}
            </p>
          </Card>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            {
              number: '30+',
              label: language === 'en' ? 'Destinations' : 'وجهات',
            },
            {
              number: '25+',
              label: language === 'en' ? 'Years Experience' : 'سنة خبرة',
            },
            {
              number: '5M+',
              label: language === 'en' ? 'Passengers' : 'راكب',
            },
            {
              number: '98%',
              label: language === 'en' ? 'On-Time Rate' : 'معدل الالتزام',
            },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-8">
            {language === 'en' ? 'Our Values' : 'قيمنا'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CheckCircle,
                title: language === 'en' ? 'Safety' : 'السلامة',
                description: language === 'en'
                  ? 'Safety is our highest priority in all operations'
                  : 'السلامة هي أولويتنا الأولى في جميع العمليات',
              },
              {
                icon: Users,
                title: language === 'en' ? 'Customer Focus' : 'التركيز على العملاء',
                description: language === 'en'
                  ? 'We put our customers at the heart of everything'
                  : 'نضع عملائنا في قلب كل شيء',
              },
              {
                icon: Award,
                title: language === 'en' ? 'Excellence' : 'التميز',
                description: language === 'en'
                  ? 'We strive for excellence in every aspect'
                  : 'نسعى للتميز في كل جانب',
              },
              {
                icon: Globe,
                title: language === 'en' ? 'Responsibility' : 'المسؤولية',
                description: language === 'en'
                  ? 'We are committed to environmental sustainability'
                  : 'نحن ملتزمون بالاستدامة البيئية',
              },
            ].map((value, idx) => {
              const Icon = value.icon;
              return (
                <Card key={idx} className="p-6 text-center">
                  <Icon className="w-8 h-8 text-accent mx-auto mb-4" />
                  <h3 className="font-bold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* History */}
        <div className="mb-12 bg-secondary/5 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-primary mb-6">
            {language === 'en' ? 'Our History' : 'تاريخنا'}
          </h2>

          <div className="space-y-4">
            {[
              {
                year: '1992',
                title: language === 'en' ? 'Founded' : 'التأسيس',
                description: language === 'en'
                  ? 'Jordan Aviation was established as a regional carrier'
                  : 'تم تأسيس الأردنية للطيران كناقل إقليمي',
              },
              {
                year: '2000',
                title: language === 'en' ? 'Expansion' : 'التوسع',
                description: language === 'en'
                  ? 'Expanded to 15 destinations across the Middle East'
                  : 'توسعت إلى 15 وجهة عبر الشرق الأوسط',
              },
              {
                year: '2010',
                title: language === 'en' ? 'Modernization' : 'التحديث',
                description: language === 'en'
                  ? 'Modernized fleet with new aircraft acquisitions'
                  : 'تحديث الأسطول بشراء طائرات جديدة',
              },
              {
                year: '2023',
                title: language === 'en' ? 'Digital Transformation' : 'التحول الرقمي',
                description: language === 'en'
                  ? 'Launched new digital booking platform and mobile app'
                  : 'إطلاق منصة الحجز الرقمية الجديدة وتطبيق الهاتف المحمول',
              },
            ].map((milestone, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  {idx < 3 && <div className="w-0.5 h-16 bg-border mt-2"></div>}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-bold text-accent">{milestone.year}</p>
                  <h4 className="font-bold text-foreground">{milestone.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-8">
            {language === 'en'
              ? 'Awards & Recognition'
              : 'الجوائز والاعترافات'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                award: 'Best Regional Airline',
                year: '2023',
                organization: 'Middle East Aviation Awards',
              },
              {
                award: 'Customer Service Excellence',
                year: '2022',
                organization: 'Arab Air Carriers Organization',
              },
              {
                award: 'Safety Excellence',
                year: '2023',
                organization: 'IATA',
              },
            ].map((award, idx) => (
              <Card key={idx} className="p-6 border-l-4 border-accent">
                <Award className="w-8 h-8 text-accent mb-3" />
                <h4 className="font-bold text-foreground mb-1">
                  {award.award}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {award.organization}
                </p>
                <p className="text-xs text-accent font-bold">{award.year}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="p-8 bg-primary/5 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {language === 'en'
              ? 'Ready to Fly with Us?'
              : 'هل أنت مستعد معنا؟'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'en'
              ? 'Experience the Jordan Aviation difference today'
              : 'اختبر الفرق مع الأردنية للطيران اليوم'}
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            {language === 'en' ? 'Book Your Flight' : 'احجز رحلتك'}
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
