import { Link } from 'wouter';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { isRTL, language } = useLanguage();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-primary font-bold">
                JA
              </div>
              <h3 className="font-bold text-lg">
                {language === 'en' ? 'Jordan Aviation' : 'الأردنية للطيران'}
              </h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              {language === 'en'
                ? 'Premium airline service connecting the Middle East with modern aircraft and exceptional customer care.'
                : 'خدمة طيران متميزة تربط الشرق الأوسط بطائرات حديثة ورعاية عملاء استثنائية.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h4 className="font-bold mb-4">
              {language === 'en' ? 'Quick Links' : 'روابط سريعة'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Home' : 'الرئيسية'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/book">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Book a Flight' : 'احجز رحلة'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/destinations">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Destinations' : 'الوجهات'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/offers">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Offers' : 'العروض'}
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Travel Info */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h4 className="font-bold mb-4">
              {language === 'en' ? 'Travel Info' : 'معلومات السفر'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/travel-info/baggage">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Baggage' : 'الأمتعة'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/travel-info/check-in">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Check-in' : 'تسجيل الدخول'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/travel-info/special-assistance">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Special Assistance' : 'مساعدة خاصة'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/travel-info/seat-selection">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Seat Selection' : 'اختيار المقعد'}
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h4 className="font-bold mb-4">
              {language === 'en' ? 'Support' : 'الدعم'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/manage-booking">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Manage Booking' : 'إدارة الحجز'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/flight-status">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Flight Status' : 'حالة الرحلة'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Help Center' : 'مركز المساعدة'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/help/contact">
                  <a className="hover:text-accent transition-colors">
                    {language === 'en' ? 'Contact Us' : 'اتصل بنا'}
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h4 className="font-bold mb-4">
              {language === 'en' ? 'Contact' : 'اتصل بنا'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>+962 6 445 5555</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>info@jordanaviation.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Queen Alia International Airport, Amman, Jordan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-90">
          <p>
            © {currentYear} {language === 'en' ? 'Jordan Aviation' : 'الأردنية للطيران'}
            . {language === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy">
              <a className="hover:text-accent transition-colors">
                {language === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
              </a>
            </Link>
            <Link href="/terms">
              <a className="hover:text-accent transition-colors">
                {language === 'en' ? 'Terms & Conditions' : 'الشروط والأحكام'}
              </a>
            </Link>
            <a href="#" className="hover:text-accent transition-colors">
              {language === 'en' ? 'Cookies' : 'ملفات تعريف الارتباط'}
            </a>
          </div>
        </div>

        {/* Compliance Info */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-xs opacity-75">
          <p>
            {language === 'en'
              ? 'Jordan Aviation is IATA and BSP certified. We operate under strict safety and regulatory compliance standards.'
              : 'الأردنية للطيران معتمدة من IATA و BSP. نعمل وفقاً لمعايير السلامة والامتثال التنظيمي الصارمة.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
