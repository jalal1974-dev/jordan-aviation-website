/**
 * Dynamic Date Service
 * Generates future dates and prices dynamically based on current date (May 1, 2026)
 * Ensures all offers and prices are always in the future
 */

export interface DynamicOffer {
  id: string;
  title: string;
  description: string;
  discount: number; // percentage
  startDate: Date;
  endDate: Date;
  applicableRoutes: string[];
  minPrice: number;
  maxPrice: number;
}

export interface DynamicPrice {
  route: string;
  basePrice: number;
  currentPrice: number;
  discount: number;
  validFrom: Date;
  validUntil: Date;
}

class DynamicDateService {
  private readonly BASE_DATE = new Date("2026-05-01T00:00:00Z");

  /**
   * Get the current reference date (May 1, 2026)
   */
  getReferenceDate(): Date {
    return new Date(this.BASE_DATE);
  }

  /**
   * Get a future date relative to reference date
   */
  getFutureDate(daysFromNow: number): Date {
    const date = new Date(this.BASE_DATE);
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }

  /**
   * Get a date range for an offer
   */
  getOfferDateRange(startDaysFromNow: number, durationDays: number) {
    return {
      startDate: this.getFutureDate(startDaysFromNow),
      endDate: this.getFutureDate(startDaysFromNow + durationDays),
    };
  }

  /**
   * Generate dynamic offers that are always in the future
   */
  generateDynamicOffers(): DynamicOffer[] {
    return [
      {
        id: "offer-1",
        title: "Summer Travel Special",
        description: "Up to 30% off on all Middle East routes",
        discount: 30,
        ...this.getOfferDateRange(7, 60), // Starts May 8, lasts 60 days
        applicableRoutes: ["AMM-CAI", "AMM-KWI", "AMM-BGW", "AMM-IST"],
        minPrice: 75,
        maxPrice: 150,
      },
      {
        id: "offer-2",
        title: "Early Bird Promotion",
        description: "Book 30 days in advance and save 25%",
        discount: 25,
        ...this.getOfferDateRange(1, 90), // Starts May 2, lasts 90 days
        applicableRoutes: ["AMM-TBS", "AMM-BAK", "AMM-IST"],
        minPrice: 100,
        maxPrice: 200,
      },
      {
        id: "offer-3",
        title: "Weekend Getaway",
        description: "Special rates for Friday-Sunday travel",
        discount: 20,
        ...this.getOfferDateRange(14, 45), // Starts May 15, lasts 45 days
        applicableRoutes: ["AMM-CAI", "AMM-KWI"],
        minPrice: 85,
        maxPrice: 160,
      },
      {
        id: "offer-4",
        title: "Group Booking Discount",
        description: "Save 35% when booking for 4+ passengers",
        discount: 35,
        ...this.getOfferDateRange(3, 120), // Starts May 4, lasts 120 days
        applicableRoutes: ["AMM-CAI", "AMM-KWI", "AMM-BGW", "AMM-IST", "AMM-TBS", "AMM-BAK"],
        minPrice: 70,
        maxPrice: 180,
      },
      {
        id: "offer-5",
        title: "Loyalty Member Exclusive",
        description: "Members get 40% off on selected flights",
        discount: 40,
        ...this.getOfferDateRange(5, 75), // Starts May 6, lasts 75 days
        applicableRoutes: ["AMM-TBS", "AMM-BAK"],
        minPrice: 80,
        maxPrice: 170,
      },
    ];
  }

  /**
   * Generate dynamic prices for routes
   */
  generateDynamicPrices(): DynamicPrice[] {
    const routes = [
      { route: "AMM-CAI", basePrice: 95 },
      { route: "AMM-KWI", basePrice: 120 },
      { route: "AMM-BGW", basePrice: 110 },
      { route: "AMM-IST", basePrice: 145 },
      { route: "AMM-TBS", basePrice: 165 },
      { route: "AMM-BAK", basePrice: 175 },
    ];

    return routes.map((r) => ({
      route: r.route,
      basePrice: r.basePrice,
      currentPrice: this.calculateDynamicPrice(r.basePrice),
      discount: this.calculateDiscount(r.basePrice),
      validFrom: this.getReferenceDate(),
      validUntil: this.getFutureDate(30), // Valid for 30 days
    }));
  }

  /**
   * Calculate dynamic price with seasonal variation
   */
  calculateDynamicPrice(basePrice: number): number {
    // Add seasonal variation (5-15% variation)
    const variation = Math.random() * 0.1 + 0.05;
    const adjustedPrice = basePrice * (1 - variation);
    return Math.round(adjustedPrice);
  }

  /**
   * Calculate discount percentage
   */
  private calculateDiscount(basePrice: number): number {
    // Random discount between 5-20%
    return Math.floor(Math.random() * 15) + 5;
  }

  /**
   * Get fare calendar for a specific month
   */
  getFareCalendar(monthOffset: number = 0) {
    const startDate = new Date(this.BASE_DATE);
    startDate.setMonth(startDate.getMonth() + monthOffset);
    startDate.setDate(1);

    const calendar = [];
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(startDate);
      date.setDate(day);

      // Generate price variation for each day
      const basePrice = 89;
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const priceMultiplier = isWeekend ? 1.15 : 1.0; // Weekend premium

      calendar.push({
        day,
        price: Math.round(basePrice * priceMultiplier + Math.random() * 20),
        available: Math.random() > 0.1, // 90% availability
        best: day % 7 === 2, // Mark some days as best deals
        date: date.toISOString().split("T")[0],
      });
    }

    return calendar;
  }

  /**
   * Get upcoming flight dates
   */
  getUpcomingFlightDates(daysAhead: number = 30): Date[] {
    const dates: Date[] = [];
    for (let i = 1; i <= daysAhead; i++) {
      dates.push(this.getFutureDate(i));
    }
    return dates;
  }

  /**
   * Format date for display
   */
  formatDate(date: Date, locale: string = "en-US"): string {
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Format date range for display
   */
  formatDateRange(startDate: Date, endDate: Date, locale: string = "en-US"): string {
    const start = this.formatDate(startDate, locale);
    const end = this.formatDate(endDate, locale);
    return `${start} - ${end}`;
  }

  /**
   * Check if date is in the future
   */
  isFutureDate(date: Date): boolean {
    return date > this.getReferenceDate();
  }

  /**
   * Get days until date
   */
  getDaysUntil(date: Date): number {
    const now = this.getReferenceDate();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get seasonal price adjustment
   */
  getSeasonalAdjustment(date: Date): number {
    const month = date.getMonth();
    // Summer (June-August) = 1.2x, Winter (Dec-Feb) = 0.8x
    if (month >= 5 && month <= 7) return 1.2;
    if (month === 11 || month <= 1) return 0.8;
    return 1.0;
  }

  /**
   * Generate price with seasonal adjustment
   */
  getPriceWithSeason(basePrice: number, date: Date): number {
    const adjustment = this.getSeasonalAdjustment(date);
    return Math.round(basePrice * adjustment);
  }
}

export const dynamicDateService = new DynamicDateService();
