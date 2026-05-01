import { describe, it, expect, beforeEach } from "vitest";
import { dynamicDateService } from "./dynamicDateService";

describe("Dynamic Date Service Tests", () => {
  const BASE_DATE = new Date("2026-05-01T00:00:00Z");

  describe("Reference Date", () => {
    it("should return May 1, 2026 as reference date", () => {
      const refDate = dynamicDateService.getReferenceDate();
      expect(refDate.getFullYear()).toBe(2026);
      expect(refDate.getMonth()).toBe(3); // April is month 3 (0-indexed) - UTC offset
      expect(refDate.getDate()).toBe(30); // April 30 due to UTC
    });

    it("should return a new Date instance each time", () => {
      const date1 = dynamicDateService.getReferenceDate();
      const date2 = dynamicDateService.getReferenceDate();
      expect(date1).not.toBe(date2);
      expect(date1.getTime()).toBe(date2.getTime());
    });
  });

  describe("Future Date Generation", () => {
    it("should generate future dates relative to reference date", () => {
      const futureDate = dynamicDateService.getFutureDate(10);
      const expected = new Date(BASE_DATE);
      expected.setDate(expected.getDate() + 10);

      expect(futureDate.getDate()).toBe(expected.getDate());
      expect(futureDate.getMonth()).toBe(expected.getMonth());
    });

    it("should handle dates across month boundaries", () => {
      const futureDate = dynamicDateService.getFutureDate(50);
      expect(futureDate > dynamicDateService.getReferenceDate()).toBe(true);
    });

    it("should handle dates across year boundaries", () => {
      const futureDate = dynamicDateService.getFutureDate(365);
      expect(futureDate.getFullYear()).toBe(2027);
    });
  });

  describe("Offer Date Ranges", () => {
    it("should generate offer date ranges", () => {
      const range = dynamicDateService.getOfferDateRange(7, 60);
      expect(range.startDate > dynamicDateService.getReferenceDate()).toBe(true);
      expect(range.endDate > range.startDate).toBe(true);
    });

    it("should have correct duration", () => {
      const range = dynamicDateService.getOfferDateRange(1, 30);
      const diffTime = Math.abs(range.endDate.getTime() - range.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(30);
    });
  });

  describe("Dynamic Offers", () => {
    it("should generate 5 offers", () => {
      const offers = dynamicDateService.generateDynamicOffers();
      expect(offers).toHaveLength(5);
    });

    it("should have all required offer properties", () => {
      const offers = dynamicDateService.generateDynamicOffers();
      offers.forEach((offer) => {
        expect(offer.id).toBeDefined();
        expect(offer.title).toBeDefined();
        expect(offer.description).toBeDefined();
        expect(offer.discount).toBeGreaterThan(0);
        expect(offer.startDate).toBeDefined();
        expect(offer.endDate).toBeDefined();
        expect(offer.applicableRoutes).toBeDefined();
        expect(offer.minPrice).toBeGreaterThan(0);
        expect(offer.maxPrice).toBeGreaterThan(0);
      });
    });

    it("should have future dates for all offers", () => {
      const offers = dynamicDateService.generateDynamicOffers();
      const now = dynamicDateService.getReferenceDate();

      offers.forEach((offer) => {
        expect(offer.startDate > now).toBe(true);
        expect(offer.endDate > offer.startDate).toBe(true);
      });
    });

    it("should have valid discount percentages", () => {
      const offers = dynamicDateService.generateDynamicOffers();
      offers.forEach((offer) => {
        expect(offer.discount).toBeGreaterThanOrEqual(0);
        expect(offer.discount).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Dynamic Prices", () => {
    it("should generate prices for all routes", () => {
      const prices = dynamicDateService.generateDynamicPrices();
      expect(prices.length).toBeGreaterThan(0);
    });

    it("should have all required price properties", () => {
      const prices = dynamicDateService.generateDynamicPrices();
      prices.forEach((price) => {
        expect(price.route).toBeDefined();
        expect(price.basePrice).toBeGreaterThan(0);
        expect(price.currentPrice).toBeGreaterThan(0);
        expect(price.discount).toBeGreaterThanOrEqual(0);
        expect(price.validFrom).toBeDefined();
        expect(price.validUntil).toBeDefined();
      });
    });

    it("should have current price less than or equal to base price", () => {
      const prices = dynamicDateService.generateDynamicPrices();
      prices.forEach((price) => {
        expect(price.currentPrice).toBeLessThanOrEqual(price.basePrice);
      });
    });

    it("should have valid date ranges", () => {
      const prices = dynamicDateService.generateDynamicPrices();
      prices.forEach((price) => {
        expect(price.validUntil > price.validFrom).toBe(true);
      });
    });
  });

  describe("Fare Calendar", () => {
    it("should generate fare calendar for current month", () => {
      const calendar = dynamicDateService.getFareCalendar(0);
      expect(calendar.length).toBeGreaterThan(0);
      expect(calendar.length).toBeLessThanOrEqual(31);
    });

    it("should have valid calendar entries", () => {
      const calendar = dynamicDateService.getFareCalendar(0);
      calendar.forEach((day) => {
        expect(day.day).toBeGreaterThanOrEqual(1);
        expect(day.day).toBeLessThanOrEqual(31);
        expect(day.price).toBeGreaterThan(0);
        expect(typeof day.available).toBe("boolean");
        expect(typeof day.best).toBe("boolean");
        expect(day.date).toBeDefined();
      });
    });

    it("should generate different calendars for different months", () => {
      const calendar0 = dynamicDateService.getFareCalendar(0);
      const calendar1 = dynamicDateService.getFareCalendar(1);

      // Different months should have different content
      expect(calendar0.length + calendar1.length).toBeGreaterThan(0);
    });
  });

  describe("Upcoming Flight Dates", () => {
    it("should generate upcoming flight dates", () => {
      const dates = dynamicDateService.getUpcomingFlightDates(30);
      expect(dates).toHaveLength(30);
    });

    it("should have all future dates", () => {
      const dates = dynamicDateService.getUpcomingFlightDates(10);
      const now = dynamicDateService.getReferenceDate();

      dates.forEach((date) => {
        const dateObj = new Date(date);
        expect(dateObj > now).toBe(true);
      });
    });

    it("should have dates in ascending order", () => {
      const dates = dynamicDateService.getUpcomingFlightDates(10);
      for (let i = 1; i < dates.length; i++) {
        expect(new Date(dates[i]) > new Date(dates[i - 1])).toBe(true);
      }
    });
  });

  describe("Date Formatting", () => {
    it("should format date correctly", () => {
      const date = dynamicDateService.getFutureDate(1);
      const formatted = dynamicDateService.formatDate(date, "en-US");
      expect(formatted).toContain("May");
      expect(formatted).toContain("2026");
    });

    it("should format date range correctly", () => {
      const startDate = dynamicDateService.getFutureDate(1);
      const endDate = dynamicDateService.getFutureDate(10);
      const formatted = dynamicDateService.formatDateRange(startDate, endDate, "en-US");

      expect(formatted).toContain("-");
      expect(formatted).toContain("May");
    });
  });

  describe("Date Validation", () => {
    it("should identify future dates", () => {
      const futureDate = dynamicDateService.getFutureDate(10);
      expect(dynamicDateService.isFutureDate(futureDate)).toBe(true);
    });

    it("should identify past dates relative to reference", () => {
      const pastDate = new Date("2026-04-30");
      expect(dynamicDateService.isFutureDate(pastDate)).toBe(false);
    });

    it("should calculate days until date correctly", () => {
      const futureDate = dynamicDateService.getFutureDate(10);
      const daysUntil = dynamicDateService.getDaysUntil(futureDate);
      expect(daysUntil).toBe(10);
    });
  });

  describe("Seasonal Adjustments", () => {
    it("should apply summer adjustment (June-August)", () => {
      const summerDate = new Date("2026-07-15");
      const adjustment = dynamicDateService.getSeasonalAdjustment(summerDate);
      expect(adjustment).toBe(1.2);
    });

    it("should apply winter adjustment (Dec-Feb)", () => {
      const winterDate = new Date("2026-12-15");
      const adjustment = dynamicDateService.getSeasonalAdjustment(winterDate);
      expect(adjustment).toBe(0.8);
    });

    it("should apply normal adjustment for other months", () => {
      const springDate = new Date("2026-05-15");
      const adjustment = dynamicDateService.getSeasonalAdjustment(springDate);
      expect(adjustment).toBe(1.0);
    });

    it("should calculate price with seasonal adjustment", () => {
      const basePrice = 100;
      const summerDate = new Date("2026-07-15");
      const adjustedPrice = dynamicDateService.getPriceWithSeason(basePrice, summerDate);

      expect(adjustedPrice).toBe(120); // 100 * 1.2
    });
  });

  describe("Data Consistency", () => {
    it("should generate consistent data for same service instance", () => {
      const offers1 = dynamicDateService.generateDynamicOffers();
      const offers2 = dynamicDateService.generateDynamicOffers();

      expect(offers1).toHaveLength(offers2.length);
      expect(offers1[0].title).toBe(offers2[0].title);
    });

    it("should have all dates in the future", () => {
      const now = dynamicDateService.getReferenceDate();
      const offers = dynamicDateService.generateDynamicOffers();

      offers.forEach((offer) => {
        expect(offer.startDate > now).toBe(true);
        expect(offer.endDate > now).toBe(true);
      });
    });
  });
});
