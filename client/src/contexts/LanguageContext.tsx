import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Currency = 'USD' | 'JOD' | 'EGP' | 'AED' | 'KWD' | 'SAR';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.book': 'Book a Flight',
    'nav.manage': 'Manage Booking',
    'nav.status': 'Flight Status',
    'nav.destinations': 'Destinations',
    'nav.offers': 'Offers',
    'nav.charter': 'Charter / ACMI',
    'nav.travel': 'Travel Information',
    'nav.help': 'Help Center',
    'nav.about': 'About',
    'hero.headline': 'Fly with Confidence',
    'hero.subheadline': 'Premium airline service connecting the Middle East',
    'search.from': 'From',
    'search.to': 'To',
    'search.depart': 'Depart',
    'search.return': 'Return',
    'search.passengers': 'Passengers',
    'search.cabin': 'Cabin Class',
    'search.promo': 'Promo Code',
    'search.button': 'Search Flights',
    'footer.copyright': '© 2026 Jordan Aviation. All rights reserved.',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.book': 'احجز رحلة',
    'nav.manage': 'إدارة الحجز',
    'nav.status': 'حالة الرحلة',
    'nav.destinations': 'الوجهات',
    'nav.offers': 'العروض',
    'nav.charter': 'الرحلات المستأجرة',
    'nav.travel': 'معلومات السفر',
    'nav.help': 'مركز المساعدة',
    'nav.about': 'حول الشركة',
    'hero.headline': 'سافر بثقة',
    'hero.subheadline': 'خدمة طيران متميزة تربط الشرق الأوسط',
    'search.from': 'من',
    'search.to': 'إلى',
    'search.depart': 'تاريخ المغادرة',
    'search.return': 'تاريخ العودة',
    'search.passengers': 'عدد الركاب',
    'search.cabin': 'فئة المقصورة',
    'search.promo': 'كود الترويج',
    'search.button': 'ابحث عن الرحلات',
    'footer.copyright': '© 2026 الأردنية للطيران. جميع الحقوق محفوظة.',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language') as Language | null;
      return stored || 'en';
    }
    return 'en';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currency') as Currency | null;
      return stored || 'USD';
    }
    return 'USD';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    currency,
    setCurrency,
    isRTL: language === 'ar',
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
