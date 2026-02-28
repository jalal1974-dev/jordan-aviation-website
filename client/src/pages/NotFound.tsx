import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Page Not Found' : 'الصفحة غير موجودة'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === 'en'
              ? 'Sorry, the page you are looking for does not exist.'
              : 'عذراً، الصفحة التي تبحث عنها غير موجودة.'}
          </p>
          <Link href="/">
            <a>
              <Button className="bg-primary hover:bg-primary/90">
                {language === 'en' ? 'Return to Home' : 'العودة إلى الرئيسية'}
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
