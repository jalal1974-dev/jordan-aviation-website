import { useMemo } from 'react';

/**
 * Hook to generate dynamic dates and prices for the frontend
 * All dates are relative to May 1, 2026
 */

const BASE_DATE = new Date('2026-05-01T00:00:00Z');

export function useDynamicDates() {
  return useMemo(() => {
    const getReferenceDate = () => new Date(BASE_DATE);

    const getFutureDate = (daysFromNow: number) => {
      const date = new Date(BASE_DATE);
      date.setDate(date.getDate() + daysFromNow);
      return date;
    };

    const getDestinationPrices = () => [
      { code: 'CAI', name: 'Cairo', ar: 'القاهرة', price: 89, currency: 'USD' },
      { code: 'KWI', name: 'Kuwait', ar: 'الكويت', price: 120, currency: 'USD' },
      { code: 'BGW', name: 'Baghdad', ar: 'بغداد', price: 110, currency: 'USD' },
      { code: 'IST', name: 'Istanbul', ar: 'اسطنبول', price: 145, currency: 'USD' },
      { code: 'TBS', name: 'Tbilisi', ar: 'تبليسي', price: 165, currency: 'USD' },
      { code: 'BAK', name: 'Baku', ar: 'باكو', price: 175, currency: 'USD' },
    ];

    const getFareCalendar = (monthOffset: number = 0) => {
      const startDate = new Date(BASE_DATE);
      startDate.setMonth(startDate.getMonth() + monthOffset);
      startDate.setDate(1);

      const calendar = [];
      const daysInMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      ).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(startDate);
        date.setDate(day);

        const basePrice = 89;
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const priceMultiplier = isWeekend ? 1.15 : 1.0;

        calendar.push({
          day,
          price: Math.round(basePrice * priceMultiplier + Math.random() * 20),
          available: Math.random() > 0.1,
          best: day % 7 === 2,
          date: date.toISOString().split('T')[0],
        });
      }

      return calendar;
    };

    const getOffers = () => [
      {
        id: 'offer-1',
        title: 'Summer Travel Special',
        titleAr: 'عرض السفر الصيفي',
        description: 'Up to 30% off on all Middle East routes',
        descriptionAr: 'خصم يصل إلى 30% على جميع الطرق في الشرق الأوسط',
        discount: 30,
        startDate: getFutureDate(7),
        endDate: getFutureDate(67),
        badge: 'HOT DEAL',
      },
      {
        id: 'offer-2',
        title: 'Early Bird Promotion',
        titleAr: 'عرض الحجز المبكر',
        description: 'Book 30 days in advance and save 25%',
        descriptionAr: 'احجز قبل 30 يوم وحقق توفيرات بنسبة 25%',
        discount: 25,
        startDate: getFutureDate(1),
        endDate: getFutureDate(91),
        badge: 'SAVE NOW',
      },
      {
        id: 'offer-3',
        title: 'Weekend Getaway',
        titleAr: 'عطلة نهاية الأسبوع',
        description: 'Special rates for Friday-Sunday travel',
        descriptionAr: 'أسعار خاصة لرحلات الجمعة والأحد',
        discount: 20,
        startDate: getFutureDate(14),
        endDate: getFutureDate(59),
        badge: 'LIMITED TIME',
      },
    ];

    const getUpcomingFlightDates = (daysAhead: number = 30) => {
      const dates: string[] = [];
      for (let i = 1; i <= daysAhead; i++) {
        const date = getFutureDate(i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    };

    const formatDate = (date: Date, locale: string = 'en-US'): string => {
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatDateRange = (
      startDate: Date,
      endDate: Date,
      locale: string = 'en-US'
    ): string => {
      const start = formatDate(startDate, locale);
      const end = formatDate(endDate, locale);
      return `${start} - ${end}`;
    };

    const getMinDate = (): string => {
      const date = getFutureDate(1);
      return date.toISOString().split('T')[0];
    };

    const getMaxDate = (): string => {
      const date = getFutureDate(365);
      return date.toISOString().split('T')[0];
    };

    return {
      getReferenceDate,
      getFutureDate,
      getDestinationPrices,
      getFareCalendar,
      getOffers,
      getUpcomingFlightDates,
      formatDate,
      formatDateRange,
      getMinDate,
      getMaxDate,
    };
  }, []);
}
