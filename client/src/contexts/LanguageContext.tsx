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
    'admin.performance.title': 'Performance Dashboard',
    'admin.performance.leaderboard': 'Verifier Leaderboard',
    'admin.performance.statistics': 'Performance Statistics',
    'admin.performance.trends': 'Performance Trends',
    'admin.performance.accessDenied': 'Access Denied',
    'admin.performance.noPermission': 'You do not have permission to access this page.',
    'admin.performance.loading': 'Loading performance data...',
    'admin.performance.timeRange': 'Time Range',
    'admin.performance.sortBy': 'Sort By',
    'admin.performance.score': 'Score',
    'admin.performance.documents': 'Documents',
    'admin.performance.accuracy': 'Accuracy',
    'admin.performance.export': 'Export Report',
    'admin.performance.topPerformers': 'Top Performers',
    'admin.performance.accuracyDistribution': 'Accuracy Distribution',
    'admin.performance.averageScore': 'Average Score',
    'admin.performance.totalDocuments': 'Total Documents',
    'admin.performance.averageAccuracy': 'Average Accuracy',
    'admin.performance.averageTime': 'Average Processing Time',
    'admin.alerts.title': 'Alerts Dashboard',
    'admin.alerts.critical': 'Critical',
    'admin.alerts.high': 'High',
    'admin.alerts.medium': 'Medium',
    'admin.alerts.low': 'Low',
    'admin.alerts.filter': 'Filter by Severity',
    'admin.alerts.dismiss': 'Dismiss',
    'admin.alerts.action': 'Take Action',
    'admin.bonus.title': 'Bonus Simulator',
    'admin.bonus.configure': 'Configure Weights',
    'admin.bonus.accuracy': 'Accuracy Weight',
    'admin.bonus.volume': 'Volume Weight',
    'admin.bonus.speed': 'Speed Weight',
    'admin.bonus.calculate': 'Calculate Bonuses',
    'admin.bonus.distribution': 'Bonus Distribution',
    'admin.bonus.export': 'Export as CSV',
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
    'admin.performance.title': 'لوحة الأداء',
    'admin.performance.leaderboard': 'ترتيب المدققين',
    'admin.performance.statistics': 'إحصائيات الأداء',
    'admin.performance.trends': 'اتجاهات الأداء',
    'admin.performance.accessDenied': 'تم رفض الوصول',
    'admin.performance.noPermission': 'ليس لديك إذن للوصول إلى هذه الصفحة.',
    'admin.performance.loading': 'جاري تحميل بيانات الأداء...',
    'admin.performance.timeRange': 'نطاق الوقت',
    'admin.performance.sortBy': 'ترتيب حسب',
    'admin.performance.score': 'النقاط',
    'admin.performance.documents': 'المستندات',
    'admin.performance.accuracy': 'الدقة',
    'admin.performance.export': 'تصدير التقرير',
    'admin.performance.topPerformers': 'أفضل الأداء',
    'admin.performance.accuracyDistribution': 'توزيع الدقة',
    'admin.performance.averageScore': 'متوسط النقاط',
    'admin.performance.totalDocuments': 'إجمالي المستندات',
    'admin.performance.averageAccuracy': 'متوسط الدقة',
    'admin.performance.averageTime': 'متوسط وقت المعالجة',
    'admin.alerts.title': 'لوحة التنبيهات',
    'admin.alerts.critical': 'حرج',
    'admin.alerts.high': 'مرتفع',
    'admin.alerts.medium': 'متوسط',
    'admin.alerts.low': 'منخفض',
    'admin.alerts.filter': 'تصفية حسب الخطورة',
    'admin.alerts.dismiss': 'إغلاق',
    'admin.alerts.action': 'اتخاذ إجراء',
    'admin.bonus.title': 'محاكي المكافآت',
    'admin.bonus.configure': 'تكوين الأوزان',
    'admin.bonus.accuracy': 'وزن الدقة',
    'admin.bonus.volume': 'وزن الحجم',
    'admin.bonus.speed': 'وزن السرعة',
    'admin.bonus.calculate': 'حساب المكافآت',
    'admin.bonus.distribution': 'توزيع المكافآت',
    'admin.bonus.export': 'تصدير كـ CSV',
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
