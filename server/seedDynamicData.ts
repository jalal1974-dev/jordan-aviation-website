/**
 * Seed Dynamic Data Script
 * Generates and seeds offers and prices with future dates
 * Run with: node seed-dynamic-data.mjs
 */

import { dynamicDateService, DynamicOffer } from "./dynamicDateService";

/**
 * Generate seed data for offers
 */
export function generateOffersSeedData() {
  const offers = dynamicDateService.generateDynamicOffers();

  return offers.map((offer, index) => ({
    id: index + 1,
    title: offer.title,
    titleAr: offer.title, // Would be translated in real scenario
    description: offer.description,
    descriptionAr: offer.description,
    code: `OFFER${String(index + 1).padStart(3, "0")}`,
    discountType: "percentage" as const,
    discountValue: offer.discount,
    maxDiscount: offer.maxPrice,
    minBookingAmount: offer.minPrice,
    validFrom: offer.startDate,
    validUntil: offer.endDate,
    maxUsage: 1000,
    currentUsage: 0,
    applicableRoutes: offer.applicableRoutes.join(","),
    applicableCabinClasses: "economy,business",
    isActive: true,
    createdBy: 1, // Admin user
    createdAt: dynamicDateService.getReferenceDate(),
    updatedAt: dynamicDateService.getReferenceDate(),
  }));
}

/**
 * Generate seed data for prices
 */
export function generatePricesSeedData() {
  const prices = dynamicDateService.generateDynamicPrices();

  return prices.map((price, index) => ({
    id: index + 1,
    route: price.route,
    basePrice: price.basePrice,
    currentPrice: price.currentPrice,
    currency: "USD",
    validFrom: price.validFrom,
    validUntil: price.validUntil,
    seasonalAdjustment: 1.0,
    createdAt: dynamicDateService.getReferenceDate(),
    updatedAt: dynamicDateService.getReferenceDate(),
  }));
}

/**
 * Generate fare calendar seed data
 */
export function generateFareCalendarSeedData(monthOffset: number = 0) {
  const calendar = dynamicDateService.getFareCalendar(monthOffset);

  return calendar.map((day, index) => ({
    id: index + 1,
    date: day.date,
    price: day.price,
    available: day.available,
    isBestDeal: day.best,
    route: "AMM-CAI", // Default route
    createdAt: dynamicDateService.getReferenceDate(),
    updatedAt: dynamicDateService.getReferenceDate(),
  }));
}

/**
 * Generate upcoming flights seed data
 */
export function generateUpcomingFlightsSeedData() {
  const routes = [
    { code: "AMM-CAI", name: "Amman to Cairo" },
    { code: "AMM-KWI", name: "Amman to Kuwait" },
    { code: "AMM-BGW", name: "Amman to Baghdad" },
    { code: "AMM-IST", name: "Amman to Istanbul" },
    { code: "AMM-TBS", name: "Amman to Tbilisi" },
    { code: "AMM-BAK", name: "Amman to Baku" },
  ];

  const upcomingDates = dynamicDateService.getUpcomingFlightDates(30);
  const flights = [];

  let flightId = 1;
  for (const route of routes) {
    for (let i = 0; i < 3; i++) {
      const date = upcomingDates[Math.floor(Math.random() * upcomingDates.length)];
      const departTime = `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;

      flights.push({
        id: flightId++,
        flightNumber: `JA${String(flightId).padStart(4, "0")}`,
        route: route.code,
        departureDate: date,
        departureTime: departTime,
        arrivalTime: `${String((parseInt(departTime.split(":")[0]) + 3) % 24).padStart(2, "0")}:${departTime.split(":")[1]}`,
        aircraft: "Boeing 737",
        capacity: 180,
        availableSeats: Math.floor(Math.random() * 100) + 20,
        price: dynamicDateService.getPriceWithSeason(100, date),
        status: "scheduled" as const,
        createdAt: dynamicDateService.getReferenceDate(),
        updatedAt: dynamicDateService.getReferenceDate(),
      });
    }
  }

  return flights;
}

/**
 * Generate destinations seed data with dynamic pricing
 */
export function generateDestinationsSeedData() {
  const destinations = [
    { code: "CAI", name: "Cairo", nameAr: "القاهرة", country: "Egypt" },
    { code: "KWI", name: "Kuwait", nameAr: "الكويت", country: "Kuwait" },
    { code: "BGW", name: "Baghdad", nameAr: "بغداد", country: "Iraq" },
    { code: "IST", name: "Istanbul", nameAr: "اسطنبول", country: "Turkey" },
    { code: "TBS", name: "Tbilisi", nameAr: "تبليسي", country: "Georgia" },
    { code: "BAK", name: "Baku", nameAr: "باكو", country: "Azerbaijan" },
  ];

  return destinations.map((dest, index) => ({
    id: index + 1,
    code: dest.code,
    name: dest.name,
    nameAr: dest.nameAr,
    country: dest.country,
    basePrice: 100 + index * 20,
    currentPrice: dynamicDateService.calculateDynamicPrice(100 + index * 20),
    description: `Fly to ${dest.name} with Jordan Aviation`,
    descriptionAr: `اطر إلى ${dest.nameAr} مع الأردنية للطيران`,
    isActive: true,
    createdAt: dynamicDateService.getReferenceDate(),
    updatedAt: dynamicDateService.getReferenceDate(),
  }));
}

/**
 * Export all seed data
 */
export const seedData = {
  offers: generateOffersSeedData(),
  prices: generatePricesSeedData(),
  fareCalendar: generateFareCalendarSeedData(),
  upcomingFlights: generateUpcomingFlightsSeedData(),
  destinations: generateDestinationsSeedData(),
};

export default seedData;
